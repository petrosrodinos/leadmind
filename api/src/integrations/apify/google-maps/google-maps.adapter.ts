import { Injectable, Logger } from '@nestjs/common';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import { GoogleMapsQueryConfig, GoogleMapsRawItem } from './google-maps.interfaces';

@Injectable()
export class GoogleMapsAdapter
    implements ApifyAdapter<GoogleMapsQueryConfig, GoogleMapsRawItem> {

    private readonly logger = new Logger(GoogleMapsAdapter.name);

    buildInput(query_config: GoogleMapsQueryConfig): ApifyRunInput {
        const { query, location, limit, language, categories } = query_config;

        const input: ApifyRunInput = {
            searchStringsArray: Array.isArray(query) ? query : [query],
            language: language ?? 'en',
            maxCrawledPlacesPerSearch: limit ?? 50,
        };

        if (location) input.locationQuery = location;
        if (categories?.length) input.categoryFilterWords = categories;

        return input;
    }

    normalize(raw_items: GoogleMapsRawItem[]): NormalizedLead[] {
        const leads = raw_items
            .map((item) => this.mapItem(item))
            .filter((lead) => Boolean(lead.email || lead.phone || lead.linkedin_url));

        if (raw_items.length > 0 && leads.length === 0) {
            this.logger.warn(
                `Google Maps Apify returned ${raw_items.length} items but none mapped to email, phone, or LinkedIn URL`,
            );
        }

        return leads;
    }

    private mapItem(item: GoogleMapsRawItem): NormalizedLead {
        const email = item.email || item.emails?.[0] || undefined;
        const phone = item.phone || item.phoneUnformatted || undefined;
        const location = item.address
            || [item.street, item.city, item.state, item.postalCode, item.countryCode]
                .filter(Boolean)
                .join(', ')
            || undefined;
        const industry = item.categoryName || item.categories?.[0] || undefined;

        return {
            name: item.title || item.name || undefined,
            email,
            phone,
            company: item.title || item.name || undefined,
            website: item.website || item.url || undefined,
            linkedin_url: undefined,
            title: undefined,
            location: location || undefined,
            industry,
            description: item.description || undefined,
            raw_data: item,
        };
    }
}
