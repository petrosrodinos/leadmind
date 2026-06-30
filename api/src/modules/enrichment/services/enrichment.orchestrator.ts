import { Injectable, Logger } from '@nestjs/common';
import { EnrichmentSource, Prisma, ApifyUsageOperation } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { LinkedInCompanyAdapter } from '@/integrations/apify/linkedin-company/linkedin-company.adapter';
import { LinkedInProfileAdapter } from '@/integrations/apify/linkedin-profile/linkedin-profile.adapter';
import { WebsiteContentCrawlerAdapter } from '@/integrations/apify/website-content-crawler/website-content-crawler.adapter';
import { plainTextFromCrawledPage } from '@/integrations/apify/website-content-crawler/crawl-page-text.utils';
import { GoogleSearchAdapter } from '@/integrations/apify/google-search/google-search.adapter';
import { GemiService } from '@/integrations/gemi/gemi.service';
import { GemiCompany } from '@/integrations/gemi/gemi.interfaces';
import { LeadAiService } from '@/modules/leads/utils/lead-ai.service';
import {
    buildGemiDocumentsEnrichmentSummary,
    extractArGemiFromLead,
    isGemiActivityActive,
    parseGemiCompanyFromLead,
} from '@/modules/leads/utils/gemi-enrichment.utils';
import {
    googleSearchPayloadToContext,
    isLinkedInCompanyUrl,
    isLinkedInProfileUrl,
    linkedInPlainForAiContext,
    normalizeWebsiteUrl,
    toPlainRecord,
    websiteEnrichmentForAiContext,
} from '@/modules/leads/utils/enrichment-data.utils';
import { normalizeEnrichmentSources } from '@/modules/leads/utils/enrichment-sources.utils';
import { EnrichmentSummaryService } from './enrichment-summary.service';
import {
    EnrichmentAttemptInput,
    EnrichmentSourceResult,
} from '../interfaces/enrichment-execution.interface';
import { EnrichmentTarget } from '../interfaces/enrichment-target.interface';
import {
    contactToEnrichmentSubject,
    EnrichmentProfileUpdate,
    EnrichmentSubject,
    leadToEnrichmentSubject,
    profileUpdateToContactInput,
    profileUpdateToLeadInput,
    subjectAsLeadLike,
} from '../utils/enrichment-subject.utils';

@Injectable()
export class EnrichmentOrchestrator {
    private readonly logger = new Logger(EnrichmentOrchestrator.name);

    constructor(
        protected readonly prisma: PrismaService,
        protected readonly leadAi: LeadAiService,
        protected readonly linkedInCompany: LinkedInCompanyAdapter,
        protected readonly linkedInProfile: LinkedInProfileAdapter,
        protected readonly websiteCrawler: WebsiteContentCrawlerAdapter,
        protected readonly googleSearch: GoogleSearchAdapter,
        protected readonly gemiService: GemiService,
        protected readonly summaryService: EnrichmentSummaryService,
    ) {}

    async runForLead(
        leadUuid: string,
        sources: EnrichmentSource[],
        opts?: { force?: boolean },
    ): Promise<void> {
        return this.runInternal({ kind: 'lead', uuid: leadUuid }, sources, opts);
    }

    async runForContact(
        contactUuid: string,
        sources: EnrichmentSource[],
        opts?: { force?: boolean },
    ): Promise<void> {
        return this.runInternal({ kind: 'contact', uuid: contactUuid }, sources, opts);
    }

    protected async resolveUserUuidForTarget(target: EnrichmentTarget): Promise<string | null> {
        if (target.kind === 'contact') {
            const contact = await this.prisma.contact.findUnique({
                where: { uuid: target.uuid },
                select: { user_uuid: true },
            });
            return contact?.user_uuid ?? null;
        }
        const contact = await this.prisma.contact.findFirst({
            where: { lead_uuid: target.uuid },
            select: { user_uuid: true },
        });
        return contact?.user_uuid ?? null;
    }

    private async runInternal(
        target: EnrichmentTarget,
        sources: EnrichmentSource[],
        opts?: { force?: boolean },
    ): Promise<void> {
        const force = opts?.force ?? false;
        const ordered = normalizeEnrichmentSources(sources);

        let subject = await this.loadSubject(target);
        if (!subject) {
            this.logger.warn(`${target.kind} ${target.uuid} not found`);
            return;
        }

        for (const src of ordered) {
            subject = (await this.loadSubject(target)) ?? subject;
            if (!subject) {
                return;
            }

            if (!force && (await this.hasSourceEnrichment(target, src))) {
                continue;
            }

            await this.runSource(target, subject, src, force);
        }
    }

    async hasSourceEnrichment(target: EnrichmentTarget, source: EnrichmentSource): Promise<boolean> {
        if (target.kind === 'lead') {
            const row = await this.prisma.leadEnrichment.findFirst({
                where: { lead_uuid: target.uuid, source },
            });
            return Boolean(row);
        }
        const row = await this.prisma.contactEnrichment.findFirst({
            where: { contact_uuid: target.uuid, source },
        });
        return Boolean(row);
    }

    async runSourceLead(
        lead: Parameters<typeof leadToEnrichmentSubject>[0],
        source: EnrichmentSource,
        force: boolean,
    ): Promise<void> {
        const subject = leadToEnrichmentSubject(lead);
        await this.runSource({ kind: 'lead', uuid: lead.uuid }, subject, source, force);
    }

    private async runSource(
        target: EnrichmentTarget,
        subject: EnrichmentSubject,
        source: EnrichmentSource,
        force: boolean,
    ): Promise<void> {
        try {
            const result = await this.executeSource(target, subject, source, force);
            await this.persistAttempt(target, { ...result, status: 'success' });
        } catch (error) {
            this.logger.warn(
                `${target.kind} ${target.uuid} ${source} enrichment failed: ${error instanceof Error ? error.message : error}`,
            );
            await this.persistAttempt(target, this.buildFailedAttempt(subject, source, error));
        }
    }

    async persistAttempt(
        target: EnrichmentTarget,
        data: EnrichmentAttemptInput,
        opts?: { skipSummaryRegen?: boolean },
    ): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const metadata = this.mergeMetadata(data.metadata, { status: data.status });
            if (target.kind === 'lead') {
                await tx.leadEnrichment.create({
                    data: {
                        lead_uuid: target.uuid,
                        source: data.source,
                        source_url: data.source_url,
                        summary: data.summary,
                        payload: data.payload,
                        cost_usd: data.cost_usd ?? null,
                        input_tokens: data.input_tokens ?? null,
                        output_tokens: data.output_tokens ?? null,
                        metadata,
                    },
                });
                if (data.entity_update && Object.keys(data.entity_update).length > 0) {
                    await tx.lead.update({
                        where: { uuid: target.uuid },
                        data: profileUpdateToLeadInput(data.entity_update),
                    });
                }
            } else {
                await tx.contactEnrichment.create({
                    data: {
                        contact_uuid: target.uuid,
                        source: data.source,
                        source_url: data.source_url,
                        summary: data.summary,
                        payload: data.payload,
                        cost_usd: data.cost_usd ?? null,
                        input_tokens: data.input_tokens ?? null,
                        output_tokens: data.output_tokens ?? null,
                        metadata,
                    },
                });
                if (data.entity_update && Object.keys(data.entity_update).length > 0) {
                    await tx.contact.update({
                        where: { uuid: target.uuid },
                        data: profileUpdateToContactInput(data.entity_update),
                    });
                }
            }
        });
        if (!opts?.skipSummaryRegen) {
            await this.summaryService.regenerate(target);
        }
    }

    private async loadSubject(target: EnrichmentTarget): Promise<EnrichmentSubject | null> {
        if (target.kind === 'lead') {
            const lead = await this.prisma.lead.findUnique({ where: { uuid: target.uuid } });
            return lead ? leadToEnrichmentSubject(lead) : null;
        }
        const contact = await this.prisma.contact.findUnique({
            where: { uuid: target.uuid },
            include: { lead: true },
        });
        return contact ? contactToEnrichmentSubject(contact, contact.lead) : null;
    }

    private async executeSource(
        target: EnrichmentTarget,
        subject: EnrichmentSubject,
        source: EnrichmentSource,
        force: boolean,
    ): Promise<EnrichmentSourceResult> {
        switch (source) {
            case EnrichmentSource.LINKEDIN:
                return this.executeLinkedIn(target, subject);
            case EnrichmentSource.WEBSITE:
                return this.executeWebsite(target, subject);
            case EnrichmentSource.GOOGLE_SEARCH:
                return this.executeGoogleSearch(target, subject);
            case EnrichmentSource.AI:
                return this.executeAiSearch(target, subject, force);
            case EnrichmentSource.GEMI:
                return this.executeGemi(subject);
            default: {
                const _e: never = source;
                throw new Error(`Unsupported enrichment source: ${_e}`);
            }
        }
    }

    private async executeLinkedIn(
        target: EnrichmentTarget,
        subject: EnrichmentSubject,
    ): Promise<EnrichmentSourceResult> {
        const url = subject.linkedin_url?.trim();
        if (!url) {
            throw new Error('Entity has no linkedin_url');
        }
        const user_uuid = await this.resolveUserUuidForTarget(target);
        if (!user_uuid) {
            throw new Error('Entity has no user context for Apify');
        }
        const apifyUsage = {
            operation: ApifyUsageOperation.ENRICHMENT_LINKEDIN,
            reference_type: target.kind,
            reference_uuid: target.uuid,
        };
        let plain: Record<string, unknown> | null = null;
        let subtype: 'profile' | 'company' = 'profile';
        if (isLinkedInCompanyUrl(url)) {
            plain = toPlainRecord(await this.linkedInCompany.fetchCompany(user_uuid, url, apifyUsage));
            subtype = 'company';
        } else if (isLinkedInProfileUrl(url)) {
            plain = toPlainRecord(await this.linkedInProfile.fetchProfile(user_uuid, url, apifyUsage));
            subtype = 'profile';
        } else {
            plain = toPlainRecord(await this.linkedInProfile.fetchProfile(user_uuid, url, apifyUsage));
            subtype = 'profile';
        }
        if (!plain) {
            throw new Error('LinkedIn scraper returned no data');
        }
        const li = await this.leadAi.summarizeLinkedInEnrichment(user_uuid, plain, subtype);
        return {
            source: EnrichmentSource.LINKEDIN,
            source_url: url,
            summary: li.summary,
            payload: {
                fetched_at: new Date().toISOString(),
                data: plain,
            } as Prisma.InputJsonValue,
            metadata: { subtype },
            entity_update: this.buildProfileUpdateFromLinkedIn(subject, plain, subtype),
            cost_usd: li.cost_usd,
            input_tokens: li.input_tokens,
            output_tokens: li.output_tokens,
        };
    }

    private buildProfileUpdateFromLinkedIn(
        subject: EnrichmentSubject,
        plain: Record<string, unknown> | null,
        subtype: 'profile' | 'company',
    ): EnrichmentProfileUpdate {
        const data: EnrichmentProfileUpdate = {};
        if (!plain) {
            return data;
        }
        const take = (current: string | null | undefined, next: unknown): string | undefined => {
            if (typeof next !== 'string' || !next.trim()) {
                return undefined;
            }
            if (String(current ?? '').trim()) {
                return undefined;
            }
            return next.trim();
        };
        if (subtype === 'profile') {
            const n = take(subject.name, plain.name);
            if (n) data.name = n;
            const e = take(subject.email, plain.email);
            if (e) data.email = e;
            const ph = take(subject.phone, plain.phone);
            if (ph) data.phone = ph;
            const t = take(subject.title, plain.title);
            if (t) data.title = t;
            const c = take(subject.company, plain.company);
            if (c) data.company = c;
            const w = take(subject.website, plain.website);
            if (w) data.website = w;
            const loc = take(subject.location, plain.location);
            if (loc) data.location = loc;
            const ind = take(subject.industry, plain.industry);
            if (ind) data.industry = ind;
            const li = take(subject.linkedin_url, plain.linkedin_url);
            if (li) data.linkedin_url = li;
            const about =
                typeof plain.about === 'string'
                    ? plain.about
                    : typeof plain.headline === 'string'
                      ? plain.headline
                      : null;
            const desc = take(subject.description, about);
            if (desc) {
                data.description = desc.slice(0, 8000);
            }
        } else {
            const cn = take(subject.company, plain.name);
            if (cn) data.company = cn;
            const w = take(subject.website, plain.website);
            if (w) data.website = w;
            const ind = take(subject.industry, plain.industry);
            if (ind) data.industry = ind;
            const ph = take(subject.phone, plain.phone);
            if (ph) data.phone = ph;
            const e = take(subject.email, plain.email);
            if (e) data.email = e;
            const body =
                typeof plain.description === 'string'
                    ? plain.description
                    : typeof plain.tagline === 'string'
                      ? plain.tagline
                      : null;
            const desc = take(subject.description, body);
            if (desc) {
                data.description = desc.slice(0, 8000);
            }
        }
        return data;
    }

    private async executeWebsite(
        target: EnrichmentTarget,
        subject: EnrichmentSubject,
    ): Promise<EnrichmentSourceResult> {
        const w = subject.website?.trim();
        if (!w) {
            throw new Error('Entity has no website for crawl');
        }
        const url = normalizeWebsiteUrl(w);
        const user_uuid = await this.resolveUserUuidForTarget(target);
        if (!user_uuid) {
            throw new Error('Entity has no user context for Apify');
        }
        const page = await this.websiteCrawler.crawlSinglePage(
            user_uuid,
            url,
            {},
            {
                operation: ApifyUsageOperation.ENRICHMENT_WEBSITE,
                reference_type: target.kind,
                reference_uuid: target.uuid,
            },
        );
        const textFull = page ? plainTextFromCrawledPage(page) : null;
        const textSample = textFull?.slice(0, 12000) ?? null;
        const mdSample = page?.markdown?.slice(0, 12000) ?? null;
        const ws = await this.leadAi.summarizeWebsiteEnrichment(user_uuid, {
            url,
            title: page?.title ?? null,
            textSample,
            markdownSample: mdSample,
        });
        return {
            source: EnrichmentSource.WEBSITE,
            source_url: url,
            summary: ws.summary,
            payload: {
                fetched_at: new Date().toISOString(),
                url,
                title: page?.title ?? null,
                text_sample: textSample,
                markdown_sample: mdSample,
            },
            cost_usd: ws.cost_usd,
            input_tokens: ws.input_tokens,
            output_tokens: ws.output_tokens,
        };
    }

    private async executeGoogleSearch(
        target: EnrichmentTarget,
        subject: EnrichmentSubject,
    ): Promise<EnrichmentSourceResult> {
        const parts = [subject.company, subject.name]
            .filter((x): x is string => Boolean(x?.trim()))
            .map((x) => x.trim());
        const query = parts.join(' ').slice(0, 280);
        if (!query) {
            throw new Error('Entity has no company/name for Google Search');
        }
        const user_uuid = await this.resolveUserUuidForTarget(target);
        if (!user_uuid) {
            throw new Error('Entity has no user context for Apify');
        }
        const raw = await this.googleSearch.fetchRawItems(
            user_uuid,
            {
                queries: query,
                results_per_page: 8,
                max_pages_per_query: 1,
            },
            {
                operation: ApifyUsageOperation.ENRICHMENT_GOOGLE_SEARCH,
                reference_type: target.kind,
                reference_uuid: target.uuid,
            },
        );
        const summaries: { title?: string; url?: string; snippet?: string }[] = [];
        for (const item of raw) {
            const organic = [...(item.organicResults ?? []), ...(item.paidResults ?? [])];
            for (const r of organic) {
                summaries.push({
                    title: r.title,
                    url: r.url,
                    snippet: (r.description ?? r.snippet) as string | undefined,
                });
                if (summaries.length >= 14) {
                    break;
                }
            }
            if (summaries.length >= 14) {
                break;
            }
        }
        const gs = await this.leadAi.summarizeGoogleSearchEnrichment(user_uuid, { query, results: summaries });
        return {
            source: EnrichmentSource.GOOGLE_SEARCH,
            source_url: query,
            summary: gs.summary,
            payload: {
                query,
                fetched_at: new Date().toISOString(),
                results: summaries,
            },
            cost_usd: gs.cost_usd,
            input_tokens: gs.input_tokens,
            output_tokens: gs.output_tokens,
        };
    }

    private async executeAiSearch(
        target: EnrichmentTarget,
        subject: EnrichmentSubject,
        force: boolean,
    ): Promise<EnrichmentSourceResult> {
        const result = await this.leadAi.buildAiEnrichmentResult(subjectAsLeadLike(subject), {
            force,
            historyTarget: target,
        });
        if (!result) {
            throw new Error('AI enrichment returned no result');
        }
        const { lead_update, ...rest } = result as EnrichmentSourceResult & {
            lead_update?: EnrichmentProfileUpdate;
        };
        return {
            ...rest,
            entity_update: lead_update ?? rest.entity_update,
        };
    }

    private async executeGemi(subject: EnrichmentSubject): Promise<EnrichmentSourceResult> {
        const leadLike = subjectAsLeadLike(subject);
        const company = parseGemiCompanyFromLead(leadLike);
        if (!company) {
            throw new Error('Entity has no GEMI company data in raw_data');
        }
        const ar_gemi = extractArGemiFromLead(leadLike);
        if (ar_gemi == null) {
            throw new Error('Entity has no GEMI registry number (arGemi) in raw_data');
        }
        const documents = await this.gemiService.getCompanyDocuments(ar_gemi).catch(() => null);
        const summary = buildGemiDocumentsEnrichmentSummary(company, documents != null);
        const entity_update = this.buildProfileUpdateFromGemi(subject, company);
        return {
            source: EnrichmentSource.GEMI,
            source_url: String(ar_gemi),
            summary,
            payload: {
                fetched_at: new Date().toISOString(),
                ar_gemi,
                company: company as Record<string, unknown>,
                ...(documents ? { documents } : {}),
            } as Prisma.InputJsonValue,
            metadata: {
                legal_type: company.legalType?.descr ?? null,
                status: company.status?.descr ?? null,
                activity_count: company.activities?.length ?? 0,
                active_activity_count:
                    company.activities?.filter(isGemiActivityActive).length ?? 0,
                documents_fetched: documents != null,
            },
            ...(Object.keys(entity_update).length > 0 ? { entity_update } : {}),
        };
    }

    private buildProfileUpdateFromGemi(
        subject: EnrichmentSubject,
        company: GemiCompany,
    ): EnrichmentProfileUpdate {
        const data: EnrichmentProfileUpdate = {};
        const take = (current: string | null | undefined, next: unknown): string | undefined => {
            if (typeof next !== 'string' || !next.trim()) {
                return undefined;
            }
            if (String(current ?? '').trim()) {
                return undefined;
            }
            return next.trim();
        };
        const first_person = company.persons?.find((p) => p.personName);
        const primary_activity =
            company.activities?.find((a) => isGemiActivityActive(a))?.activity ??
            company.activities?.[0]?.activity;
        const location_parts = [company.city, company.prefecture?.descr].filter(Boolean);
        const n = take(subject.name, first_person?.personName);
        if (n) data.name = n;
        const e = take(subject.email, company.email);
        if (e) data.email = e;
        const ph = take(subject.phone, company.phone);
        if (ph) data.phone = ph;
        const c = take(subject.company, company.coNameEl ?? company.coNamesEn?.[0]);
        if (c) data.company = c;
        const w = take(subject.website, company.url);
        if (w) data.website = w;
        const t = take(subject.title, first_person?.role);
        if (t) data.title = t;
        const loc = take(subject.location, location_parts.join(', ') || undefined);
        if (loc) data.location = loc;
        const ind = take(subject.industry, primary_activity?.descr);
        if (ind) data.industry = ind;
        const desc = take(subject.description, company.objective);
        if (desc) {
            data.description = desc.slice(0, 8000);
        }
        return data;
    }

    protected buildFailedAttempt(
        subject: EnrichmentSubject,
        source: EnrichmentSource,
        error: unknown,
    ): EnrichmentAttemptInput {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const name = error instanceof Error ? error.name : 'Error';
        return {
            source,
            source_url: this.sourceUrlForFailure(subject, source),
            summary: `${source} enrichment failed: ${message}`,
            payload: {
                failed_at: new Date().toISOString(),
                error: message,
            },
            metadata: {
                error_name: name,
                error_message: message,
            },
            status: 'failed',
        };
    }

    private sourceUrlForFailure(subject: EnrichmentSubject, source: EnrichmentSource): string | null {
        if (source === EnrichmentSource.LINKEDIN) {
            return subject.linkedin_url?.trim() || null;
        }
        if (source === EnrichmentSource.WEBSITE) {
            return subject.website?.trim() ? normalizeWebsiteUrl(subject.website.trim()) : null;
        }
        if (source === EnrichmentSource.GOOGLE_SEARCH) {
            return [subject.company, subject.name]
                .filter((x): x is string => Boolean(x?.trim()))
                .map((x) => x.trim())
                .join(' ')
                .slice(0, 280) || null;
        }
        if (source === EnrichmentSource.AI) {
            return subject.website?.trim() ? normalizeWebsiteUrl(subject.website.trim()) : null;
        }
        if (source === EnrichmentSource.GEMI) {
            const ar = extractArGemiFromLead(subjectAsLeadLike(subject));
            return ar != null ? String(ar) : null;
        }
        return subject.linkedin_url?.trim() || subject.website?.trim() || null;
    }

    private mergeMetadata(
        metadata: Prisma.InputJsonValue | null | undefined,
        base: Record<string, unknown>,
    ): Prisma.InputJsonValue {
        if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
            return { ...metadata, ...base } as Prisma.InputJsonValue;
        }
        return base as Prisma.InputJsonValue;
    }
}
