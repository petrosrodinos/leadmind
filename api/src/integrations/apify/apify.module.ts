import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { IntegrationsModule } from '@/modules/integrations/integrations.module';
import { ApifyUsageModule } from '@/modules/apify-usage/apify-usage.module';
import { ApifyClient } from './apify.client';
import { ApifyService } from './apify.service';
import { ApifyCredentialsService } from './services/apify-credentials.service';
import { LinkedInLeadsAdapter } from './linkedin-leads/linkedin-leads.adapter';
import { GoogleMapsAdapter } from './google-maps/google-maps.adapter';
import { GoogleSearchAdapter } from './google-search/google-search.adapter';
import { GenericLeadFinderAdapter } from './generic-lead-finder/generic-lead-finder.adapter';
import { WebsiteContentCrawlerAdapter } from './website-content-crawler/website-content-crawler.adapter';
import { LinkedInCompanyAdapter } from './linkedin-company/linkedin-company.adapter';
import { LinkedInProfileAdapter } from './linkedin-profile/linkedin-profile.adapter';

@Module({
    imports: [PrismaModule, IntegrationsModule, ApifyUsageModule],
    providers: [
        ApifyClient,
        ApifyCredentialsService,
        LinkedInLeadsAdapter,
        GoogleMapsAdapter,
        GoogleSearchAdapter,
        GenericLeadFinderAdapter,
        WebsiteContentCrawlerAdapter,
        LinkedInCompanyAdapter,
        LinkedInProfileAdapter,
        ApifyService,
    ],
    exports: [
        ApifyService,
        ApifyCredentialsService,
        WebsiteContentCrawlerAdapter,
        LinkedInCompanyAdapter,
        LinkedInProfileAdapter,
        GoogleSearchAdapter,
        ApifyClient,
    ],
})
export class ApifyModule { }
