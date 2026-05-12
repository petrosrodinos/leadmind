import * as crypto from 'crypto';

/**
 * Verify a Resend webhook signature using the standard svix algorithm.
 * Resend signs with HMAC-SHA256(secret, `${svix-id}.${svix-timestamp}.${rawBody}`)
 * and the result is base64-encoded inside the `svix-signature` header as `v1,<sig>`.
 */
export function verifyResendSignature(
    rawBody: string,
    headers: { svixId?: string; svixTimestamp?: string; svixSignature?: string },
    secret: string,
): boolean {
    const { svixId, svixTimestamp, svixSignature } = headers;
    if (!svixId || !svixTimestamp || !svixSignature || !secret) return false;

    const secretBytes = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
    const data = `${svixId}.${svixTimestamp}.${rawBody}`;
    const expected = crypto.createHmac('sha256', secretBytes).update(data).digest('base64');

    return svixSignature
        .split(' ')
        .map((part) => part.split(','))
        .filter(([version]) => version === 'v1')
        .some(([, value]) => {
            if (!value) return false;
            try {
                return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(expected));
            } catch {
                return false;
            }
        });
}
