export const ContactProfileField = {
    EMAIL: "email",
    PHONE: "phone",
    WEBSITE: "website",
    LINKEDIN_URL: "linkedin_url",
    GOOGLE_MAPS_URL: "google_maps_url",
} as const;

export type ContactProfileField =
    (typeof ContactProfileField)[keyof typeof ContactProfileField];

export const CONTACT_PROFILE_FIELD_KEYS = Object.values(ContactProfileField);

export const CONTACT_PROFILE_FIELD_OPTIONS: ReadonlyArray<{
    id: ContactProfileField;
    label: string;
}> = [
    { id: ContactProfileField.EMAIL, label: "Email" },
    { id: ContactProfileField.PHONE, label: "SMS / Phone" },
    { id: ContactProfileField.WEBSITE, label: "Website" },
    { id: ContactProfileField.LINKEDIN_URL, label: "LinkedIn" },
    { id: ContactProfileField.GOOGLE_MAPS_URL, label: "Google Maps" },
];

export function isContactProfileField(value: string | null): value is ContactProfileField {
    return !!value && (CONTACT_PROFILE_FIELD_KEYS as string[]).includes(value);
}
