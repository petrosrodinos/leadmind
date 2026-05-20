import { appendUtmParams, normalizeUtmParamsInput, parseUtmParams } from './utm-params.util';

describe('utm-params.util', () => {
    it('parses stored utm json', () => {
        expect(
            parseUtmParams({
                source: 'email',
                medium: 'outreach',
                campaign: 'spring',
            }),
        ).toEqual({
            source: 'email',
            medium: 'outreach',
            campaign: 'spring',
        });
    });

    it('appends utm query params to urls', () => {
        const result = appendUtmParams('https://acme.com/pricing', {
            source: 'email',
            medium: 'campaign',
            campaign: 'q1',
        });
        const url = new URL(result);
        expect(url.searchParams.get('utm_source')).toBe('email');
        expect(url.searchParams.get('utm_medium')).toBe('campaign');
        expect(url.searchParams.get('utm_campaign')).toBe('q1');
    });

    it('preserves existing query params', () => {
        const result = appendUtmParams('https://acme.com?ref=newsletter', {
            source: 'email',
        });
        const url = new URL(result);
        expect(url.searchParams.get('ref')).toBe('newsletter');
        expect(url.searchParams.get('utm_source')).toBe('email');
    });

    it('normalizes empty utm input to null', () => {
        expect(
            normalizeUtmParamsInput({
                source: '  ',
                medium: '',
            }),
        ).toBeNull();
    });
});
