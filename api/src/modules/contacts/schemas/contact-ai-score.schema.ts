import { z } from 'zod';

export const CONTACT_AI_SCORE_SCHEMA = z.object({
    score: z.number().min(1).max(10),
    reasoning: z.string(),
});

export type ContactAiScoreResult = z.infer<typeof CONTACT_AI_SCORE_SCHEMA>;
