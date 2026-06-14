import { z } from 'zod';

export const AUDIENCE_ANALYSIS_COMPARISON_SCHEMA = z.object({
    summary: z.string(),
    changed: z.array(z.string()),
    unchanged: z.array(z.string()),
});

export const CONTACT_AUDIENCE_ANALYSIS_SCHEMA = z.object({
    summary: z.string(),
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    recommendations: z.array(z.string()),
    risks: z.array(z.string()).optional().default([]),
    comparison: AUDIENCE_ANALYSIS_COMPARISON_SCHEMA.nullable().optional(),
});

export type AudienceAnalysisComparison = z.infer<typeof AUDIENCE_ANALYSIS_COMPARISON_SCHEMA>;
export type ContactAudienceAnalysisContent = z.infer<typeof CONTACT_AUDIENCE_ANALYSIS_SCHEMA>;
