import { mergeOutboundUtmParams, utmParamsMatch, utmParamsFromRecord } from './utm-params.util';

describe('mergeOutboundUtmParams', () => {
    it('injects campaign uuid into profile utm at send time', () => {
        expect(
            mergeOutboundUtmParams(
                { source: 'email', medium: 'outreach', campaign: 'old-name' },
                '11111111-1111-4111-8111-111111111111',
            ),
        ).toEqual({
            source: 'email',
            medium: 'outreach',
            campaign: '11111111-1111-4111-8111-111111111111',
        });
    });

    it('creates campaign-only utm when profile has no utm config', () => {
        expect(
            mergeOutboundUtmParams(null, '11111111-1111-4111-8111-111111111111'),
        ).toEqual({ campaign: '11111111-1111-4111-8111-111111111111' });
    });
});

describe('utmParamsMatch', () => {
    it('matches when all configured stored params equal incoming', () => {
        expect(
            utmParamsMatch(
                { source: 'email', medium: 'outreach', campaign: 'spring' },
                { source: 'email', medium: 'outreach', campaign: 'spring', term: 'extra' },
            ),
        ).toBe(true);
    });

    it('rejects when a stored param differs', () => {
        expect(
            utmParamsMatch(
                { source: 'email', campaign: 'spring' },
                { source: 'sms', campaign: 'spring' },
            ),
        ).toBe(false);
    });

    it('parses utm query aliases from a flat record', () => {
        expect(
            utmParamsFromRecord({
                utm_source: 'email',
                utm_campaign: 'abc-123',
            }),
        ).toEqual({ source: 'email', campaign: 'abc-123' });
    });
});
