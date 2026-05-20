import { senderProfileToPlaceholders } from './sender-profile-placeholders.util';

describe('senderProfileToPlaceholders', () => {
    it('appends website and booking utm params to placeholder urls', () => {
        const vars = senderProfileToPlaceholders({
            id: 1,
            uuid: 'profile-1',
            user_uuid: 'user-1',
            name: 'Acme',
            company_name: null,
            title: null,
            first_name: null,
            last_name: null,
            email: null,
            phone: null,
            website: 'acme.com',
            website_utm: { source: 'email', medium: 'outreach' },
            address: null,
            city: null,
            country: null,
            logo_url: null,
            booking_url: 'https://cal.com/acme',
            booking_utm: { campaign: 'spring' },
            sender_id: null,
            signature: null,
            business_description: null,
            is_default: false,
            created_at: new Date(),
            updated_at: new Date(),
        });

        expect(vars.website).toContain('utm_source=email');
        expect(vars.website).toContain('utm_medium=outreach');
        expect(vars.booking_url).toContain('utm_campaign=spring');
    });
});
