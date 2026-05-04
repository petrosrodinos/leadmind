export interface CreateSms {
    from?: string;
    to: string;
    body: string;
}

export interface ShortCode {
    appointly: ShortCodeType;
}

export const ShortCodeTypes = {
    appointly: 'APPOINTLY',
} as const;

export type ShortCodeType = (typeof ShortCodeTypes)[keyof typeof ShortCodeTypes];