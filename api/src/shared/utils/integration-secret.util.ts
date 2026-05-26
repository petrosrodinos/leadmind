import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const SCRYPT_SALT = 'leadfinder-integration-secrets';

function deriveKey(encryptionKey: string): Buffer {
    return scryptSync(encryptionKey, SCRYPT_SALT, 32);
}

export function encryptIntegrationSecret(
    plaintext: string,
    encryptionKey: string,
): string {
    const iv = randomBytes(IV_LENGTH);
    const key = deriveKey(encryptionKey);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptIntegrationSecret(
    ciphertext: string,
    encryptionKey: string,
): string {
    const buf = Buffer.from(ciphertext, 'base64');
    const iv = buf.subarray(0, IV_LENGTH);
    const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);
    const key = deriveKey(encryptionKey);
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([
        decipher.update(encrypted),
        decipher.final(),
    ]).toString('utf8');
}

export function secretLast4(secret: string): string | null {
    const trimmed = secret.trim();
    if (trimmed.length < 4) {
        return trimmed.length > 0 ? trimmed : null;
    }
    return trimmed.slice(-4);
}
