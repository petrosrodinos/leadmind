import { z } from 'zod';

const EnvSchema = z.object({
    NODE_ENV: z.enum(['local', 'development', 'test', 'staging', 'production']),
    PORT: z.coerce.number().default(3000),
    APP_URL: z.string().url().optional(),
    LANDING_URL: z.string().url().optional(),
    API_URL: z.string().url().optional(),
    DATABASE_URL: z.string().url(),
    REDIS_URL: z.string().optional(),
    CACHE_TTL_SECONDS: z.coerce.number().optional(),
    JWT_SECRET: z.string(),
    JWT_EXPIRATION_TIME: z.string().optional(),
    SENDGRID_API_KEY: z.string().optional(),
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    GOOGLE_MAPS_API_KEY: z.string().optional(),
    GCS_PROJECT_ID: z.string().optional(),
    GCS_BUCKET_NAME: z.string().optional(),
    GCS_FOLDER_NAME: z.string().optional(),
    GCS_CREDENTIALS_PATH: z.string().optional(),
    GCS_CREDENTIALS: z.string().optional(),
    STRIPE_PUBLISHABLE_KEY: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    BULL_BOARD_USER: z.string().optional(),
    BULL_BOARD_PASSWORD: z.string().optional(),
});

export function validateEnv(config: Record<string, unknown>) {
    const parsed = EnvSchema.safeParse(config);

    if (!parsed.success) {
        console.error(parsed.error.format());
        throw new Error('Invalid environment variables');
    }

    return parsed.data;
}

export type EnvConfig = z.infer<typeof EnvSchema>;
