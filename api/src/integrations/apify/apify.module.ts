import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApifyClient } from './apify.client';
import { ApifyService } from './apify.service';
import { LinkedInLeadsAdapter } from './linkedin-leads/linkedin-leads.adapter';
import { GoogleMapsAdapter } from './google-maps/google-maps.adapter';
import { GoogleSearchAdapter } from './google-search/google-search.adapter';
import { GenericLeadFinderAdapter } from './generic-lead-finder/generic-lead-finder.adapter';
import { WebsiteContentCrawlerAdapter } from './website-content-crawler/website-content-crawler.adapter';
import { LinkedInCompanyAdapter } from './linkedin-company/linkedin-company.adapter';
import { LinkedInProfileAdapter } from './linkedin-profile/linkedin-profile.adapter';

@Module({
    imports: [ConfigModule],
    providers: [
        ApifyClient,
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
        WebsiteContentCrawlerAdapter,
        LinkedInCompanyAdapter,
        LinkedInProfileAdapter,
        GoogleSearchAdapter,
        ApifyClient,
    ],
})
export class ApifyModule { }
