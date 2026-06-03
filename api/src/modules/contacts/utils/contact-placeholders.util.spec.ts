import { contactToPlaceholders } from './contact-placeholders.util';

describe('contactToPlaceholders', () => {
    it('maps contact fields to placeholder vars', () => {
        expect(
            contactToPlaceholders({
                name: 'Jane Doe',
                company: 'Acme Corp',
                title: 'CEO',
            } as any),
        ).toEqual({
            contact_first_name: 'Jane',
            contact_last_name: 'Doe',
            contact_name: 'Jane Doe',
            contact_company: 'Acme Corp',
            contact_title: 'CEO',
        });
    });

    it('handles missing optional fields', () => {
        expect(contactToPlaceholders({ name: 'Jane' } as any)).toEqual({
            contact_first_name: 'Jane',
            contact_last_name: '',
            contact_name: 'Jane',
            contact_company: '',
            contact_title: '',
        });
    });
});
