export const CampaignProfileField = {
    EMAIL: "email",
    PHONE: "phone",
    WEBSITE: "website",
    LINKEDIN_URL: "linkedin_url",
    GOOGLE_MAPS_URL: "google_maps_url",
} as const;

export type CampaignProfileField =
    (typeof CampaignProfileField)[keyof typeof CampaignProfileField];

export const CAMPAIGN_PROFILE_FIELD_OPTIONS: ReadonlyArray<{
    id: CampaignProfileField;
    label: string;
}> = [
    { id: CampaignProfileField.EMAIL, label: "Email" },
    { id: CampaignProfileField.PHONE, label: "SMS / Phone" },
    { id: CampaignProfileField.WEBSITE, label: "Website" },
    { id: CampaignProfileField.LINKEDIN_URL, label: "LinkedIn" },
    { id: CampaignProfileField.GOOGLE_MAPS_URL, label: "Google Maps" },
];
