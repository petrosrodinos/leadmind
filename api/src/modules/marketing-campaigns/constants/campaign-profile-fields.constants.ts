export const CampaignProfileField = {
    EMAIL: 'email',
    PHONE: 'phone',
    WEBSITE: 'website',
    LINKEDIN_URL: 'linkedin_url',
    GOOGLE_MAPS_URL: 'google_maps_url',
} as const;

export type CampaignProfileField =
    (typeof CampaignProfileField)[keyof typeof CampaignProfileField];

export const CAMPAIGN_PROFILE_FIELD_KEYS = Object.values(CampaignProfileField);
