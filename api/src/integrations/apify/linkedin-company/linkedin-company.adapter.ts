import { Injectable } from '@nestjs/common';
import { ApifyClient } from '../apify.client';
import { APIFY_ACTORS } from '../apify.constants';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import {
    LinkedInCompanyHeadquarters,
    LinkedInCompanyLocation,
    LinkedInCompanyQueryConfig,
    LinkedInCompanyRawItem,
    NormalizedCompany,
} from './linkedin-company.interfaces';

const LINKEDIN_COMPANY_URL_PREFIX = 'https://www.linkedin.com/company/';

@Injectable()
export class LinkedInCompanyAdapter
    implements ApifyAdapter<LinkedInCompanyQueryConfig, LinkedInCompanyRawItem> {

    constructor(private readonly apifyClient: ApifyClient) { }

    buildInput(query_config: LinkedInCompanyQueryConfig): ApifyRunInput {
        const input: ApifyRunInput = {};
        if (query_config.company_urls?.length) {
            const companies = query_config.company_urls
                .map((entry) => this.toCompanyUrl(entry))
                .filter((url): url is string => Boolean(url));
            if (companies.length) input.companies = companies;
        }
        if (query_config.searches?.length) {
            const searches = query_config.searches
                .map((s) => s?.trim())
                .filter((s): s is string => Boolean(s));
            if (searches.length) input.searches = searches;
        }
        return input;
    }

    /**
     * Implements ApifyAdapter for symmetry. Companies aren't leads on their own,
     * but we surface phone/email/website if the actor returns them so they can
     * flow through the generic lead pipeline if needed.
     */
    normalize(raw_items: LinkedInCompanyRawItem[]): NormalizedLead[] {
        return raw_items
            .map((item) => this.toNormalizedLead(item))
            .filter((lead) => Boolean(lead.email || lead.linkedin_url || lead.website));
    }

    /** Run the actor and return the unmodified dataset items. */
    async run(query_config: LinkedInCompanyQueryConfig): Promise<LinkedInCompanyRawItem[]> {
        const input = this.buildInput(query_config);
        return this.apifyClient.runActor<LinkedInCompanyRawItem>(
            APIFY_ACTORS.LINKEDIN_COMPANY,
            input,
        );
    }

    /** Run the actor and return typed `NormalizedCompany` records. */
    async fetchCompanies(query_config: LinkedInCompanyQueryConfig): Promise<NormalizedCompany[]> {
        const items = await this.run(query_config);
        return items.map((item) => this.toNormalizedCompany(item));
    }

    /** Convenience: fetch a single company by URL or username. */
    async fetchCompany(url_or_username: string): Promise<NormalizedCompany | null> {
        const companies = await this.fetchCompanies({ company_urls: [url_or_username] });
        return companies[0] ?? null;
    }

    private toNormalizedCompany(item: LinkedInCompanyRawItem): NormalizedCompany {
        const name = item.name || item.companyName || undefined;
        const linkedin_username = item.universalName || item.username || undefined;
        const linkedin_url =
            item.url ||
            (linkedin_username ? `${LINKEDIN_COMPANY_URL_PREFIX}${linkedin_username}` : undefined);

        const industry = item.industry || item.industries?.[0] || undefined;
        const headquarters = this.formatHeadquarters(item.headquarters);
        const locations = item.locations
            ?.map((loc) => this.formatLocation(loc))
            .filter((s): s is string => Boolean(s));

        const founded_year =
            item.foundedYear ??
            (item.founded ? this.parseYear(item.founded) : undefined);

        return {
            name,
            linkedin_url,
            linkedin_username,
            website: item.website || undefined,
            description: item.description || item.about || undefined,
            tagline: item.tagline || undefined,
            industry,
            industries: item.industries,
            specialties: item.specialties,
            company_size: item.companySize || item.employeeCountRange || undefined,
            employee_count: item.employeeCount,
            follower_count: item.followerCount,
            founded_year,
            company_type: item.companyType || item.type || undefined,
            headquarters,
            locations: locations?.length ? locations : undefined,
            logo_url: item.logoUrl || item.logo || undefined,
            cover_image_url: item.coverImageUrl || item.coverImage || undefined,
            phone: item.phone || undefined,
            email: item.email || undefined,
            raw_data: item,
        };
    }

    private toNormalizedLead(item: LinkedInCompanyRawItem): NormalizedLead {
        const company = this.toNormalizedCompany(item);
        return {
            name: company.name,
            email: company.email,
            phone: company.phone,
            company: company.name,
            website: company.website,
            linkedin_url: company.linkedin_url,
            title: undefined,
            location: company.headquarters,
            industry: company.industry,
            description: company.description || company.tagline,
            raw_data: item,
        };
    }

    private toCompanyUrl(entry: string): string | null {
        const trimmed = entry?.trim();
        if (!trimmed) return null;
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        const slug = trimmed.replace(/^\/+|\/+$/g, '');
        if (!slug) return null;
        return `${LINKEDIN_COMPANY_URL_PREFIX}${slug}`;
    }

    private formatHeadquarters(hq?: LinkedInCompanyHeadquarters): string | undefined {
        if (!hq) return undefined;
        return [hq.line1, hq.line2, hq.city, hq.geographicArea, hq.postalCode, hq.country]
            .filter(Boolean)
            .join(', ') || undefined;
    }

    private formatLocation(loc: LinkedInCompanyLocation): string | undefined {
        return [loc.line1, loc.line2, loc.city, loc.geographicArea, loc.postalCode, loc.country]
            .filter(Boolean)
            .join(', ') || undefined;
    }

    private parseYear(value: string): number | undefined {
        const match = value.match(/\d{4}/);
        if (!match) return undefined;
        const year = parseInt(match[0], 10);
        return Number.isFinite(year) ? year : undefined;
    }
}
