import { Prisma } from '@/generated/prisma';
import { ContactProfileField } from '../constants/contact-profile-fields.constants';

type ContactProfileColumn =
    | 'email'
    | 'phone'
    | 'website'
    | 'linkedin_url'
    | 'google_maps_url';

const PROFILE_FIELD_COLUMNS: Record<ContactProfileField, ContactProfileColumn> = {
    [ContactProfileField.EMAIL]: 'email',
    [ContactProfileField.PHONE]: 'phone',
    [ContactProfileField.WEBSITE]: 'website',
    [ContactProfileField.LINKEDIN_URL]: 'linkedin_url',
    [ContactProfileField.GOOGLE_MAPS_URL]: 'google_maps_url',
};

export function buildContactProfileFieldWhere(
    field: ContactProfileField,
    hasValue: boolean,
): Prisma.ContactWhereInput {
    const column = PROFILE_FIELD_COLUMNS[field];
    if (hasValue) {
        return {
            AND: [{ [column]: { not: null } }, { NOT: { [column]: '' } }],
        };
    }
    return {
        OR: [{ [column]: null }, { [column]: '' }],
    };
}
