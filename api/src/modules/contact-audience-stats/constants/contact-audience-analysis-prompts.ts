import type { ContactAudienceStats } from '../interfaces/contact-audience-stats.interface';
import type { ContactAudienceAnalysisContent } from '../schemas/contact-audience-analysis.schema';

export const AUDIENCE_ANALYSIS_SYSTEM_PROMPT = `You are a CRM analytics advisor for B2B sales teams.
Analyze audience statistics and produce actionable insights.
Be specific, data-driven, and concise.
Do not invent metrics not present in the data.
Focus on pipeline health, engagement gaps, meeting/call performance, and next steps.
When a previous analysis is provided, add a short comparison of the new run vs the previous run only.`;

export function buildAudienceAnalysisPrompt(
    scopeLabel: 'filter' | 'list',
    audienceName: string,
    stats: ContactAudienceStats,
    previous?: {
        created_at: string;
        stats_snapshot: ContactAudienceStats;
        analysis: ContactAudienceAnalysisContent;
    } | null,
): string {
    const previousBlock = previous
        ? `
Previous run (${previous.created_at}) for comparison only — do not repeat this content in the main sections:
Previous stats JSON:
${JSON.stringify(previous.stats_snapshot, null, 2)}

Previous analysis JSON:
${JSON.stringify(previous.analysis, null, 2)}
`
        : '';

    const comparisonInstructions = previous
        ? `
Also return comparison — a short delta between this new analysis and the previous run above:
- summary: 1-2 sentences on what moved since last run
- changed: only meaningful differences (max 4 short bullets)
- unchanged: only notable patterns that stayed the same (max 3 short bullets, can be empty)
Do not restate the previous analysis. Compare new vs old only.`
        : `
No previous run exists. Omit comparison or set it to null.`;

    return `Analyze this ${scopeLabel} audience named "${audienceName}" using the full historical CRM stats below.
${previousBlock}
Current stats JSON:
${JSON.stringify(stats, null, 2)}

Return:
- summary: 2-4 sentence executive overview of current state
- strengths: what is working well now (bullet points)
- weaknesses: current gaps or underperformance (bullet points)
- recommendations: prioritized next actions now (bullet points)
- risks: potential issues to watch (bullet points, can be empty)
${comparisonInstructions}`;
}
