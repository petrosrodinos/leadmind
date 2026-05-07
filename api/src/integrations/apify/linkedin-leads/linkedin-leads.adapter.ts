import { Injectable } from '@nestjs/common';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import { LinkedInLeadsQueryConfig, LinkedInLeadsRawItem } from './linkedin-leads.interfaces';

@Injectable()
export class LinkedInLeadsAdapter
    implements ApifyAdapter<LinkedInLeadsQueryConfig, LinkedInLeadsRawItem> {

    buildInput(query_config: LinkedInLeadsQueryConfig): ApifyRunInput {
        const {
            keywords,
            seniority,
            departments,
            location,
            industries,
            company_size,
            company_location,
            limit,
            only_with_email,
        } = query_config;

        const input: ApifyRunInput = {
            numberOfLeads: limit ?? 100,
            fastMode: true,
            allEmails: only_with_email ?? true,
        };

        if (keywords?.length) input.contactJobTitle = keywords.slice(0, 3);
        if (seniority?.length) input.contactSeniority = seniority;
        if (departments?.length) input.departments = departments;
        if (location?.length) input.contactLocation = location;
        if (industries?.length) input.industries = industries;
        if (company_size?.length) input.companySize = company_size;
        if (company_location?.length) input.companyLocation = company_location;

        return input;
    }

    normalize(raw_items: LinkedInLeadsRawItem[]): NormalizedLead[] {
        return raw_items
            .map((item) => this.mapItem(item))
            .filter((lead) => Boolean(lead.email || lead.linkedin_url));
    }

    private mapItem(item: LinkedInLeadsRawItem): NormalizedLead {
        const name = item.fullName
            || item.name
            || [item.firstName, item.lastName].filter(Boolean).join(' ').trim()
            || undefined;

        const email = item.email || item.workEmail || item.personalEmail || undefined;
        const linkedin_url = item.linkedinUrl || item.linkedinProfileUrl || item.profileUrl || undefined;
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
            company: item.company || item.companyName || undefined,
            website,
            linkedin_url,
            title: item.title || item.jobTitle || item.headline || undefined,
            location: location || undefined,
            industry: item.industry || undefined,
            description: item.summary || item.headline || undefined,
            raw_data: item,
        };
    }
}
