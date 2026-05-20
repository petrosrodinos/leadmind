import { resolveLeadWebsite, websiteFromBusinessEmail } from './lead-website.utils';

describe('websiteFromBusinessEmail', () => {
    it('derives https URL from business email domain', () => {
        expect(websiteFromBusinessEmail('info@logiqdev.com')).toBe('https://logiqdev.com');
    });

    it('returns undefined for consumer email domains', () => {
        expect(websiteFromBusinessEmail('user@gmail.com')).toBeUndefined();
    });

    it('returns undefined for invalid email', () => {
        expect(websiteFromBusinessEmail('not-an-email')).toBeUndefined();
        expect(websiteFromBusinessEmail(undefined)).toBeUndefined();
    });
});

describe('resolveLeadWebsite', () => {
    it('prefers explicit website over email domain', () => {
        expect(resolveLeadWebsite('https://example.com', 'info@logiqdev.com')).toBe(
            'https://example.com',
        );
    });

    it('falls back to email domain when website is missing', () => {
        expect(resolveLeadWebsite(null, 'info@logiqdev.com')).toBe('https://logiqdev.com');
    });
});
