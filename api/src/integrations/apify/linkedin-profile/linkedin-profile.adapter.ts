import { Injectable } from '@nestjs/common';
import { ApifyClient } from '../apify.client';
import { APIFY_ACTORS } from '../apify.constants';
import { ApifyAdapter, ApifyRunInput, NormalizedLead } from '../interfaces/apify.interfaces';
import {
    LinkedInProfileExperience,
    LinkedInProfileQueryConfig,
    LinkedInProfileRawItem,
    NormalizedProfile,
} from './linkedin-profile.interfaces';

const LINKEDIN_PROFILE_URL_PREFIX = 'https://www.linkedin.com/in/';

@Injectable()
export class LinkedInProfileAdapter
    implements ApifyAdapter<LinkedInProfileQueryConfig, LinkedInProfileRawItem> {

    constructor(private readonly apifyClient: ApifyClient) { }

    buildInput(query_config: LinkedInProfileQueryConfig): ApifyRunInput {
        const urls = query_config.start_urls
            .map((entry) => this.toProfileUrl(entry))
            .filter((url): url is string => Boolean(url));

        const input: ApifyRunInput = {
            urls,
            proxyConfiguration: query_config.proxy_configuration ?? { useApifyProxy: true },
        };

        if (query_config.extract_similar_profiles !== undefined) {
            input.extractSimilarProfiles = query_config.extract_similar_profiles;
        }
        if (query_config.extract_projects !== undefined) {
            input.extractProjects = query_config.extract_projects;
        }
        if (query_config.extract_recommendations !== undefined) {
            input.extractRecommendations = query_config.extract_recommendations;
        }

        return input;
    }

    /**
     * Implements ApifyAdapter for symmetry. Profiles map naturally to leads —
     * we drop entries with no LinkedIn URL/email so empty leads aren't created.
     */
    normalize(raw_items: LinkedInProfileRawItem[]): NormalizedLead[] {
        return raw_items
            .map((item, index) => this.toNormalizedLead(item, index))
            .filter((lead) => Boolean(lead.email || lead.linkedin_url));
    }

    /** Run the actor and return the unmodified dataset items. */
    async run(query_config: LinkedInProfileQueryConfig): Promise<LinkedInProfileRawItem[]> {
        const input = this.buildInput(query_config);
        return this.apifyClient.runActor<LinkedInProfileRawItem>(
            APIFY_ACTORS.LINKEDIN_PROFILE,
            input,
        );
    }

    /** Run the actor and return typed `NormalizedProfile` records. */
    async fetchProfiles(query_config: LinkedInProfileQueryConfig): Promise<NormalizedProfile[]> {
        const items = await this.run(query_config);
        const resolved_urls = query_config.start_urls
            .map((entry) => this.toProfileUrl(entry))
            .filter((url): url is string => Boolean(url));
        return items.map((item, index) =>
            this.toNormalizedProfile(item, resolved_urls[index]),
        );
    }

    /** Convenience: fetch a single profile by URL or username. */
    async fetchProfile(url_or_username: string): Promise<NormalizedProfile | null> {
        const profiles = await this.fetchProfiles({ start_urls: [url_or_username] });
        return profiles[0] ?? null;
    }

    private toNormalizedProfile(
        item: LinkedInProfileRawItem,
        source_url?: string,
    ): NormalizedProfile {
        const linkedin_url = item.url || source_url;
        const linkedin_username =
            item.publicIdentifier || item.username || this.extractUsername(linkedin_url);

        const current = this.currentExperience(item.experience);
        const headline = item.headline || this.deriveHeadline(current);
        const { first_name, last_name } = this.splitName(item.name);

        return {
            name: item.name || undefined,
            first_name,
            last_name,
            headline,
            title: current?.title || undefined,
            company: current?.company || undefined,
            company_linkedin_url: current?.companyUrl || undefined,
            linkedin_url,
            linkedin_username,
            location: item.location || undefined,
            industry: item.industry || undefined,
            about: item.about || item.summary || undefined,
            image_url: item.image || item.avatar || undefined,
            cover_image_url: item.coverImage || undefined,
            followers: item.followers,
            connections: this.parseConnections(item.connections),
            email: item.email || undefined,
            phone: item.phone || undefined,
            website: item.website || undefined,
            locale: item.locale || item.language || undefined,
            experience: item.experience,
            education: item.education,
            projects: item.projects,
            recommendations: item.recommendations,
            similar_profiles: item.similarProfiles,
            recent_posts: item.recentPosts,
            articles: item.articles,
            activity: item.activity,
            publications: item.publications,
            skills: item.skills,
            success: item.success !== false,
            error: item.error || undefined,
            raw_data: item,
        };
    }

    private toNormalizedLead(item: LinkedInProfileRawItem, index: number): NormalizedLead {
        const profile = this.toNormalizedProfile(item, undefined);
        return {
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            company: profile.company,
            website: profile.website,
            linkedin_url: profile.linkedin_url,
            title: profile.title,
            location: profile.location,
            industry: profile.industry,
            description: profile.about || profile.headline,
            raw_data: { ...item, _index: index },
        };
    }

    private toProfileUrl(entry: string): string | null {
        const trimmed = entry?.trim();
        if (!trimmed) return null;
        if (/^https?:\/\//i.test(trimmed)) return trimmed;
        const slug = trimmed.replace(/^\/+|\/+$/g, '').replace(/^in\//i, '');
        if (!slug) return null;
        return `${LINKEDIN_PROFILE_URL_PREFIX}${slug}`;
    }

    private extractUsername(url?: string): string | undefined {
        if (!url) return undefined;
        const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
        return match ? decodeURIComponent(match[1]) : undefined;
    }

    private currentExperience(
        experience?: LinkedInProfileExperience[],
    ): LinkedInProfileExperience | undefined {
        if (!experience?.length) return undefined;
        const present = experience.find((e) => !e.endDate || /present/i.test(e.endDate));
        return present ?? experience[0];
    }

    private deriveHeadline(current?: LinkedInProfileExperience): string | undefined {
        if (!current) return undefined;
        if (current.title && current.company) return `${current.title} at ${current.company}`;
        return current.title || current.company || undefined;
    }

    private splitName(name?: string): { first_name?: string; last_name?: string } {
        if (!name) return {};
        const parts = name.trim().split(/\s+/);
        if (parts.length === 0) return {};
        if (parts.length === 1) return { first_name: parts[0] };
        return { first_name: parts[0], last_name: parts.slice(1).join(' ') };
    }

    private parseConnections(value?: string | number): number | undefined {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
        const match = value.match(/\d[\d,]*/);
        if (!match) return undefined;
        const parsed = parseInt(match[0].replace(/,/g, ''), 10);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
}
