import { GoogleMapsAdapter } from './google-maps.adapter';

describe('GoogleMapsAdapter', () => {
    const adapter = new GoogleMapsAdapter();

    it('keeps places with a phone number even when email is missing', () => {
        const leads = adapter.normalize([
            {
                title: 'Heraklion Law Office',
                phone: '+30 281 0123456',
                address: 'Heraklion, Greece',
                categoryName: 'Lawyer',
            },
        ]);

        expect(leads).toHaveLength(1);
        expect(leads[0]).toMatchObject({
            name: 'Heraklion Law Office',
            phone: '+30 281 0123456',
            company: 'Heraklion Law Office',
            industry: 'Lawyer',
        });
    });

    it('derives website from business email when no website is listed', () => {
        const leads = adapter.normalize([
            {
                title: 'Logiq Dev',
                email: 'info@logiqdev.com',
                phone: '+30 281 0000000',
            },
        ]);

        expect(leads).toHaveLength(1);
        expect(leads[0].website).toBe('https://logiqdev.com');
    });

    it('stores Google Maps listing URL separately from business website', () => {
        const leads = adapter.normalize([
            {
                title: 'Heraklion Cafe',
                phone: '+30 281 0123456',
                website: 'https://cafe.example.com',
                url: 'https://www.google.com/maps/place/Heraklion+Cafe',
            },
        ]);

        expect(leads).toHaveLength(1);
        expect(leads[0]).toMatchObject({
            website: 'https://cafe.example.com',
            google_maps_url: 'https://www.google.com/maps/place/Heraklion+Cafe',
        });
    });

    it('drops places with no email, phone, or LinkedIn URL', () => {
        const leads = adapter.normalize([
            {
                title: 'Anonymous Listing',
                website: 'https://example.com',
            },
        ]);

        expect(leads).toHaveLength(0);
    });

    it('builds Apify input from query config', () => {
        const input = adapter.buildInput({
            query: 'lawyers in heraklio',
            location: 'Heraklion, Greece',
            limit: 100,
        });

        expect(input).toEqual({
            searchStringsArray: ['lawyers in heraklio'],
            language: 'en',
            maxCrawledPlacesPerSearch: 100,
            locationQuery: 'Heraklion, Greece',
        });
    });
});
