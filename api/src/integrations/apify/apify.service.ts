import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ApifyUsageOperation, SourceType } from '@/generated/prisma';
import { ApifyClient } from './apify.client';
import { APIFY_ACTORS } from './apify.constants';
import { ApifyAdapter, NormalizedLead } from './interfaces/apify.interfaces';
import { ApifyUsageOptions } from './interfaces/apify-usage.interface';
import { LinkedInLeadsAdapter } from './linkedin-leads/linkedin-leads.adapter';
import { GoogleMapsAdapter } from './google-maps/google-maps.adapter';
import { GoogleSearchAdapter } from './google-search/google-search.adapter';
import { GenericLeadFinderAdapter } from './generic-lead-finder/generic-lead-finder.adapter';
import { WebsiteContentCrawlerAdapter } from './website-content-crawler/website-content-crawler.adapter';
import { ApifyCredentialsService } from './services/apify-credentials.service';

@Injectable()
export class ApifyService {
    private readonly logger = new Logger(ApifyService.name);

    constructor(
        private readonly client: ApifyClient,
        private readonly credentials: ApifyCredentialsService,
        private readonly linkedinLeadsAdapter: LinkedInLeadsAdapter,
        private readonly googleMapsAdapter: GoogleMapsAdapter,
        private readonly googleSearchAdapter: GoogleSearchAdapter,
        private readonly genericLeadFinderAdapter: GenericLeadFinderAdapter,
        private readonly websiteContentCrawlerAdapter: WebsiteContentCrawlerAdapter,
    ) { }

    async scrapeLeads(
        user_uuid: string,
        source_type: SourceType,
        query_config: object,
        usage?: ApifyUsageOptions,
        signal?: AbortSignal,
    ): Promise<NormalizedLead[]> {
        const { adapter, actor_id } = this.resolve(source_type);

        const input = adapter.buildInput(query_config as never);
        this.logger.debug(`Running Apify actor ${actor_id} for source ${source_type}`);

        const token = await this.credentials.getApifyApiToken(user_uuid);
        const raw_items = await this.client.runActor(
            token,
            actor_id,
            input,
            {
                user_uuid,
                operation: usage?.operation ?? ApifyUsageOperation.FILTER_SCRAPE,
                reference_type: usage?.reference_type,
                reference_uuid: usage?.reference_uuid,
                metadata: usage?.metadata,
            },
            signal,
        );
        return adapter.normalize(raw_items);
    }

    private resolve(source_type: SourceType): { adapter: ApifyAdapter; actor_id: string } {
        switch (source_type) {
            case SourceType.LINKEDIN:
                return { adapter: this.linkedinLeadsAdapter, actor_id: APIFY_ACTORS.LINKEDIN_LEADS };
            case SourceType.GOOGLE_MAPS:
                return { adapter: this.googleMapsAdapter, actor_id: APIFY_ACTORS.GOOGLE_MAPS };
            case SourceType.GOOGLE_SEARCH:
                return { adapter: this.googleSearchAdapter, actor_id: APIFY_ACTORS.GOOGLE_SEARCH };
            case SourceType.GENERIC_LEAD:
                return { adapter: this.genericLeadFinderAdapter, actor_id: APIFY_ACTORS.GENERIC_LEAD };
            case SourceType.WEBSITE_CRAWLER:
                return {
                    adapter: this.websiteContentCrawlerAdapter,
                    actor_id: APIFY_ACTORS.WEBSITE_CONTENT_CRAWLER,
                };
            case SourceType.MANUAL:
                throw new BadRequestException(
                    `${SourceType.MANUAL} source type does not invoke Apify`,
                );
            case SourceType.GEMI:
                throw new BadRequestException(
                    `${SourceType.GEMI} source type does not invoke Apify`,
                );
            default: {
                const _exhaustive: never = source_type;
                throw new BadRequestException(`Unsupported source type: ${_exhaustive}`);
            }
        }
    }
}
