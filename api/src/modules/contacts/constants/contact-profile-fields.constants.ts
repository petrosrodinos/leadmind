export const ContactProfileField = {
    EMAIL: 'email',
    PHONE: 'phone',
    WEBSITE: 'website',
    LINKEDIN_URL: 'linkedin_url',
    GOOGLE_MAPS_URL: 'google_maps_url',
} as const;

export type ContactProfileField =
    (typeof ContactProfileField)[keyof typeof ContactProfileField];

export const CONTACT_PROFILE_FIELD_KEYS = Object.values(ContactProfileField);
