import { Injectable, Logger } from '@nestjs/common';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import { LINKEDIN_APIFY_LOCATION_VALUES } from './contact-location-allowed.generated';
import { LinkedInLeadsQueryConfig, LinkedInLeadsRawItem } from './linkedin-leads.interfaces';

@Injectable()
export class LinkedInLeadsAdapter
    implements ApifyAdapter<LinkedInLeadsQueryConfig, LinkedInLeadsRawItem> {

    private readonly logger = new Logger(LinkedInLeadsAdapter.name);

    private readonly apifyLocationCanonByLower = new Map<string, string>(
        LINKEDIN_APIFY_LOCATION_VALUES.map((v) => [v.toLowerCase(), v]),
    );

    buildInput(query_config: LinkedInLeadsQueryConfig): ApifyRunInput {
        const {
            keywords,
            seniority,
            departments,
            location,
            companyIndustries,
            company_size,
            company_location,
            company_revenue,
            limit,
            only_with_email,
        } = query_config;

        const input: ApifyRunInput = {
            numberOfLeads: limit ?? 100,
            fastMode: true,
            allEmails: only_with_email ?? true,
        };

        const titleKeywords = this.normalizeKeywords(keywords);
        if (titleKeywords.length) input.contactJobTitle = titleKeywords.slice(0, 3);

        const seniorityList = this.normalizeStringArray(seniority);
        if (seniorityList.length) input.contactSeniority = seniorityList;

        const departmentList = this.normalizeStringArray(departments);
        if (departmentList.length) input.departments = departmentList;

        const locationList = this.normalizeStringArray(location);
        const contactLocations = this.filterToApifyLocations(locationList);
        if (contactLocations.length) input.contactLocation = contactLocations;
        else if (locationList.length) {
            this.logger.warn(
                `LinkedIn Apify actor rejected stored location(s) (not in its enum); running without contactLocation: ${locationList.join('; ')}`,
            );
        }

        const companyIndustryList = this.normalizeStringArray(companyIndustries);
        if (companyIndustryList.length) input.companyIndustries = companyIndustryList;

        const companyRevenueList = this.normalizeStringArray(company_revenue);
        if (companyRevenueList.length) input.companyRevenue = companyRevenueList;

        const companySizeList = this.normalizeStringArray(company_size);
        if (companySizeList.length) input.companySize = companySizeList;

        const companyLocationList = this.normalizeStringArray(company_location);
        const companyLocations = this.filterToApifyLocations(companyLocationList);
        if (companyLocations.length) input.companyLocation = companyLocations;
        else if (companyLocationList.length) {
            this.logger.warn(
                `LinkedIn Apify actor rejected stored company location(s) (not in its enum); running without companyLocation: ${companyLocationList.join('; ')}`,
            );
        }

        return input;
    }

    private filterToApifyLocations(parts: string[]): string[] {
        const seen = new Set<string>();
        const out: string[] = [];
        for (const raw of parts) {
            const t = raw.trim();
            if (!t) continue;
            const canon = this.apifyLocationCanonByLower.get(t.toLowerCase());
            if (canon && !seen.has(canon)) {
                seen.add(canon);
                out.push(canon);
            }
        }
        return out;
    }

    private normalizeKeywords(value: unknown): string[] {
        if (typeof value !== 'string') return [];
        const t = value.trim();
        if (!t) return [];
        return t.split(',').flatMap((part) => {
            const s = part.trim();
            return s ? [s] : [];
        });
    }

    private normalizeStringArray(value: unknown): string[] {
        if (value == null) return [];
        if (!Array.isArray(value)) return [];
        return value
            .filter((x): x is string => typeof x === 'string')
            .map((s) => s.trim())
            .filter(Boolean);
    }

    normalize(raw_items: LinkedInLeadsRawItem[]): NormalizedLead[] {
        const leads = raw_items
            .map((item) => this.mapItem(item))
            .filter((lead) => Boolean(lead.email || lead.linkedin_url));

        if (raw_items.length > 0 && leads.length === 0) {
            this.logger.warn(
                `LinkedIn Apify returned ${raw_items.length} items but none mapped to email or LinkedIn URL`,
            );
        }

        return leads;
    }

    private pickString(item: LinkedInLeadsRawItem, ...keys: string[]): string | undefined {
        for (const key of keys) {
            const value = item[key];
            if (typeof value === 'string' && value.trim()) return value.trim();
        }
        return undefined;
    }

    private mapItem(item: LinkedInLeadsRawItem): NormalizedLead {
        const first = this.pickString(item, 'First Name', 'firstName');
        const last = this.pickString(item, 'Last Name', 'lastName');
        const name =
            this.pickString(item, 'Name', 'fullName', 'name')
            || [first, last].filter(Boolean).join(' ').trim()
            || undefined;

        const email = this.pickString(
            item,
            'Email',
            'email',
            'workEmail',
            'personalEmail',
        );
        const linkedin_url = this.pickString(
            item,
            'LinkedIn',
            'linkedinUrl',
            'linkedinProfileUrl',
            'profileUrl',
        );
        const company_domain = this.pickString(item, 'Company Domain', 'companyDomain');
        const website =
            this.pickString(item, 'companyWebsite', 'website')
            || (company_domain ? `https://${company_domain.replace(/^https?:\/\//, '')}` : undefined);
        const location =
            this.pickString(item, 'location', 'Company Location')
            || [this.pickString(item, 'City', 'city'), this.pickString(item, 'State', 'state'), this.pickString(item, 'Country', 'country')]
                .filter(Boolean)
                .join(', ')
            || undefined;

        return {
            name,
            email,
            phone: this.pickString(item, 'phone', 'phoneNumber') || undefined,
            company: this.pickString(item, 'Company Name', 'company', 'companyName') || undefined,
            website,
            linkedin_url,
            title: this.pickString(item, 'Job Title', 'title', 'jobTitle', 'headline') || undefined,
            location: location || undefined,
            industry:
                this.pickString(item, 'Company Industry', 'industry')
                || undefined,
            description:
                this.pickString(item, 'Company Sub Industry', 'summary', 'headline')
                || undefined,
            raw_data: item,
        };
    }
}
