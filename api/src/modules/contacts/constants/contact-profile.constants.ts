import type { UpdateContactDto } from '../dto/update-contact.dto';

export const CONTACT_PROFILE_UPDATE_KEYS = [
    'name',
    'email',
    'phone',
    'company',
    'website',
    'linkedin_url',
    'title',
    'location',
    'industry',
    'description',
] as const satisfies readonly (keyof UpdateContactDto)[];
