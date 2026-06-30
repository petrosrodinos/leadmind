import { Injectable } from '@nestjs/common';
import { ApifyUsageOperation } from '@/generated/prisma';
import { ApifyClient } from '../apify.client';
import { APIFY_ACTORS } from '../apify.constants';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import { ApifyUsageOptions } from '../interfaces/apify-usage.interface';
import { ApifyCredentialsService } from '../services/apify-credentials.service';
import {
    GoogleSearchOrganicResult,
    GoogleSearchQueryConfig,
    GoogleSearchRawItem,
} from './google-search.interfaces';

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const LINKEDIN_REGEX = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|company|pub)\/[A-Za-z0-9_\-%/]+/gi;

@Injectable()
export class GoogleSearchAdapter
    implements ApifyAdapter<GoogleSearchQueryConfig, GoogleSearchRawItem> {

    constructor(
        private readonly apifyClient: ApifyClient,
        private readonly credentials: ApifyCredentialsService,
    ) { }

    buildInput(query_config: GoogleSearchQueryConfig): ApifyRunInput {
        const { queries, results_per_page, max_pages_per_query, country_code, language_code } =
            query_config;

        const queries_string = Array.isArray(queries) ? queries.join('\n') : queries;

        const input: ApifyRunInput = {
            queries: queries_string,
            resultsPerPage: results_per_page ?? 10,
            maxPagesPerQuery: max_pages_per_query ?? 1,
        };

        if (country_code) input.countryCode = country_code;
        if (language_code) input.languageCode = language_code;

        return input;
    }

    async fetchRawItems(
        user_uuid: string,
        query_config: GoogleSearchQueryConfig,
        usage?: ApifyUsageOptions,
    ): Promise<GoogleSearchRawItem[]> {
        const input = this.buildInput(query_config);
        return this.runActorWithUserToken(
            user_uuid,
            APIFY_ACTORS.GOOGLE_SEARCH,
            input,
            usage ?? { operation: ApifyUsageOperation.ENRICHMENT_GOOGLE_SEARCH },
        );
    }

    normalize(raw_items: GoogleSearchRawItem[]): NormalizedLead[] {
        const leads: NormalizedLead[] = [];

        for (const item of raw_items) {
            const results = [...(item.organicResults ?? []), ...(item.paidResults ?? [])];
            for (const result of results) {
                const lead = this.mapResult(result);
                if (lead.email || lead.linkedin_url) leads.push(lead);
            }
        }

        return leads;
    }

    private async runActorWithUserToken<T>(
        user_uuid: string,
        actor_id: string,
        input: ApifyRunInput,
        usage: ApifyUsageOptions,
    ): Promise<T[]> {
        const token = await this.credentials.getApifyApiToken(user_uuid);
        return this.apifyClient.runActor<T>(token, actor_id, input, { user_uuid, ...usage });
    }

    private mapResult(result: GoogleSearchOrganicResult): NormalizedLead {
        const haystack = [result.title, result.description, result.snippet, result.url]
            .filter(Boolean)
            .join(' ');

        const email = haystack.match(EMAIL_REGEX)?.[0];
        const linkedin_url = haystack.match(LINKEDIN_REGEX)?.[0];

        return {
            name: result.title || undefined,
            email,
            linkedin_url,
            website: result.url || undefined,
            description: result.description || result.snippet || undefined,
            raw_data: result,
        };
    }
}
