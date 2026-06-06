import type { UpdateContactDto } from '../dto/update-contact.dto';

export const CONTACT_PROFILE_UPDATE_KEYS = [
    'name',
    'email',
    'phone',
    'company',
    'website',
    'google_maps_url',
    'linkedin_url',
    'title',
    'location',
    'industry',
    'description',
] as const satisfies readonly (keyof UpdateContactDto)[];
