import { Injectable } from '@nestjs/common';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import {
    GenericLeadFinderQueryConfig,
    GenericLeadFinderRawItem,
} from './generic-lead-finder.interfaces';

@Injectable()
export class GenericLeadFinderAdapter
    implements ApifyAdapter<GenericLeadFinderQueryConfig, GenericLeadFinderRawItem> {

    buildInput(query_config: GenericLeadFinderQueryConfig): ApifyRunInput {
        const {
            titles,
            seniority,
            departments,
            company_size,
            industries,
            industry_keywords,
            revenue,
            person_country,
            person_state,
            company_country,
            company_state,
            company_domains,
            business_model,
            first_name,
            last_name,
            limit,
        } = query_config;

        const input: ApifyRunInput = {
            maxResults: Math.max(limit ?? 100, 100),
            contactEmailStatus: 'verified',
        };

        if (first_name) input.firstName = first_name;
        if (last_name) input.lastName = last_name;
        if (titles?.length) input.personTitle = titles.slice(0, 100);
        if (seniority?.length) input.seniority = seniority;
        if (departments?.length) input.functional = departments;
        if (company_size?.length) input.companyEmployeeSize = company_size;
        if (industries?.length) input.industry = industries;
        if (industry_keywords?.length) input.industryKeywords = industry_keywords;
        if (revenue?.length) input.revenue = revenue;
        if (person_country?.length) input.personCountry = person_country;
        if (person_state?.length) input.personState = person_state;
        if (company_country?.length) input.companyCountry = company_country;
        if (company_state?.length) input.companyState = company_state;
        if (company_domains?.length) input.companyDomain = company_domains.slice(0, 10);
        if (business_model?.length) input.businessModel = business_model;

        return input;
    }

    normalize(raw_items: GenericLeadFinderRawItem[]): NormalizedLead[] {
        return raw_items
            .map((item) => this.mapItem(item))
            .filter((lead) => Boolean(lead.email || lead.linkedin_url));
    }

    private mapItem(item: GenericLeadFinderRawItem): NormalizedLead {
        const name = item.fullName
            || item.name
            || [item.firstName, item.lastName].filter(Boolean).join(' ').trim()
            || undefined;

        const email = item.email || item.workEmail || item.personalEmail || undefined;
        const linkedin_url = item.linkedinUrl || item.personLinkedinUrl || undefined;
        const website = item.companyWebsite
            || item.website
            || (item.companyDomain ? `https://${item.companyDomain}` : undefined);
        const location = item.location
            || [item.city, item.state, item.country].filter(Boolean).join(', ')
            || undefined;

        return {
            name,
            email,
            phone: item.phone || item.phoneNumber || undefined,
            company: item.company || item.companyName || item.organizationName || undefined,
            website,
            linkedin_url,
            title: item.title || item.jobTitle || undefined,
            location: location || undefined,
            industry: item.industry || undefined,
            description: undefined,
            raw_data: item,
        };
    }
}
