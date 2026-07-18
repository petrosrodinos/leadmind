import { Injectable, Logger } from '@nestjs/common';
import { GemiClient } from './gemi.client';
import { GEMI_DEFAULT_MAX_LEADS, GEMI_MAX_PAGE_SIZE } from './gemi.constants';
import {
    GemiActivity,
    GemiAssemblySubject,
    GemiCompany,
    GemiCompanyDocumentSet,
    GemiCompanyStatus,
    GemiLegalType,
    GemiMunicipality,
    GemiOffice,
    GemiPrefecture,
    GemiQueryConfig,
    NormalizedLead,
} from './gemi.interfaces';

@Injectable()
export class GemiService {
    private readonly logger = new Logger(GemiService.name);

    constructor(private readonly client: GemiClient) {}

    // ── Companies ─────────────────────────────────────────────────────────────

    getCompanyByArGemi(ar_gemi: number): Promise<GemiCompany> {
        return this.client.getCompanyByArGemi(ar_gemi);
    }

    async scrapeLeads(query_config: object, signal?: AbortSignal): Promise<NormalizedLead[]> {
        const query = query_config as GemiQueryConfig;
        const max_leads = query.maxLeads ?? GEMI_DEFAULT_MAX_LEADS;
        const all_companies: GemiCompany[] = [];
        let offset = 0;
        let total_count: number | undefined;

        while (all_companies.length < max_leads) {
            if (signal?.aborted) {
                throw new Error('Filter scrape aborted');
            }
            const page_size = Math.min(GEMI_MAX_PAGE_SIZE, max_leads - all_companies.length);
            const response = await this.client.searchCompanies(query, offset, page_size);
            const { searchResults, searchMetadata } = response;

            if (!searchResults?.length) break;

            total_count = searchMetadata.totalCount;
            const remaining = Math.min(
                max_leads - all_companies.length,
                total_count - all_companies.length,
            );
            const page_companies = searchResults.slice(0, Math.max(0, remaining));
            all_companies.push(...page_companies);

            this.logger.debug(
                `GEMI page offset=${offset}: got ${page_companies.length}, total=${total_count}`,
            );

            if (all_companies.length >= total_count || page_companies.length < searchResults.length) {
                break;
            }

            offset += searchResults.length;
        }

        const total = total_count ?? all_companies.length;
        this.logger.log(
            `GEMI scrape complete — ${all_companies.length} of ${total} matching companies fetched`,
        );
        return all_companies.map(GemiService.normalize);
    }

    getCompanyDocuments(ar_gemi: number): Promise<GemiCompanyDocumentSet> {
        return this.client.getCompanyDocuments(ar_gemi);
    }

    // ── Metadata ──────────────────────────────────────────────────────────────

    getActivities(): Promise<GemiActivity[]> {
        return this.client.getActivities();
    }

    getPrefectures(): Promise<GemiPrefecture[]> {
        return this.client.getPrefectures();
    }

    getMunicipalities(): Promise<GemiMunicipality[]> {
        return this.client.getMunicipalities();
    }

    getCompanyStatuses(): Promise<GemiCompanyStatus[]> {
        return this.client.getCompanyStatuses();
    }

    getLegalTypes(): Promise<GemiLegalType[]> {
        return this.client.getLegalTypes();
    }

    getGemiOffices(): Promise<GemiOffice[]> {
        return this.client.getGemiOffices();
    }

    getAssemblySubjects(): Promise<GemiAssemblySubject[]> {
        return this.client.getAssemblySubjects();
    }

    // ── Files & misc ──────────────────────────────────────────────────────────

    downloadFile(key: string, element_id: number): Promise<Buffer> {
        return this.client.downloadFile(key, element_id);
    }

    health(): Promise<boolean> {
        return this.client.health();
    }

    // ── Normalization ─────────────────────────────────────────────────────────

    private static normalize(company: GemiCompany): NormalizedLead {
        const first_person = company.persons?.find((p) => p.personName);
        const primary_activity = company.activities?.[0]?.activity;
        const location_parts = [company.city, company.prefecture?.descr].filter(Boolean);

        return {
            name: first_person?.personName,
            email: company.email,
            company: company.coNameEl ?? company.coNamesEn?.[0],
            website: company.url,
            title: first_person?.role,
            location: location_parts.join(', ') || undefined,
            industry: primary_activity?.descr,
            description: company.objective,
            raw_data: company as Record<string, any>,
        };
    }
}
