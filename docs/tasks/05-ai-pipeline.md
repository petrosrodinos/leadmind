# Task: AI Pipeline (Scoring, Enrichment, Ideas, Message Generation)

## Objective

Extend the existing `integrations/ai/` module with four distinct AI operations: lead scoring (1–10), website enrichment (summary from scraping the lead's website), business idea generation (2–3 ideas), and personalized outreach message generation. Also implement the `ai-process` BullMQ worker that runs the full pipeline automatically for new leads.

## Requirements

- Build on the existing `integrations/ai/services/ai.service.ts` — do not replace it
- Use the Vercel AI SDK (`ai` package) with the existing OpenAI provider setup
- Each AI operation must be its own method in a new `LeadAiService`
- Cost tracking must use the existing `ai-cost.ts` utilities
- The `ai-process` worker runs scoring → enrichment → ideas → message generation in sequence for each new lead
- AI operations must be idempotent: skip if result already exists (e.g., don't re-score if `lead.score` is set)
- `aiInstructions` from the lead's parent `Filter` override the default prompt for message generation

## Subtasks

- [ ] Create `api/src/modules/leads/services/lead-ai.service.ts` — `LeadAiService`:
  - Inject `PrismaService`, `AiService` (existing integration)
  - `scoreLead(lead: Lead): Promise<number>` — prompt: given lead data, return a score 1–10 as JSON `{ score: number, reasoning: string }`. Update `lead.score` in DB.
  - `enrichLead(lead: Lead): Promise<object>` — if `lead.website` exists, use `axios.get` to fetch the homepage HTML (max 10KB), pass to AI for summary. Update `lead.enrichmentData` in DB.
  - `generateIdeas(lead: Lead): Promise<string[]>` — prompt: suggest 2–3 business opportunities for this lead. Return as JSON array. Update `lead.ideas` in DB.
  - `generateMessage(lead: Lead, filter?: Filter): Promise<string>` — prompt: generate a personalized outreach message using `filter.aiInstructions` if provided, else default cold email. Use `lead.channel` or `filter.channel` to tailor tone. Update `lead.generatedMessage` and `lead.messageChannel` in DB.
- [ ] Create prompt templates as private constants in `lead-ai.service.ts`:
  - `SCORE_PROMPT`, `ENRICH_PROMPT`, `IDEAS_PROMPT`, `EMAIL_PROMPT`, `SMS_PROMPT`, `CALL_SCRIPT_PROMPT`
- [ ] Use structured output (Zod schema via Vercel AI SDK `generateObject`) for scoring and ideas to avoid parsing errors
- [ ] Create `api/src/workers/ai-process.worker.ts` — `AiProcessWorker`:
  - `@Processor(AI_PROCESS_QUEUE, { concurrency: 5 })`
  - Payload: `{ leadId: number }`
  - Steps: load lead + filter, run `scoreLead` → `enrichLead` → `generateIdeas` → `generateMessage` in sequence
  - Catch errors per step: if one step fails, log and continue to next (partial results are acceptable)
- [ ] Register `AiProcessWorker` in `workers.module.ts`
- [ ] Add `LeadAiService` to a new `api/src/modules/leads/leads.module.ts` (also used by Task 06)

## Technical Notes

- Use `generateObject` from Vercel AI SDK for structured outputs:
  ```ts
  import { generateObject } from 'ai';
  import { z } from 'zod';
  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    schema: z.object({ score: z.number().min(1).max(10), reasoning: z.string() }),
    prompt: `...`,
  });
  ```
- Use `gpt-4o-mini` for scoring/ideas (cost-effective), `gpt-4o` only for message generation
- Website enrichment: fetch HTML → strip tags (use a simple regex or `cheerio` if already available) → truncate to 3000 chars before sending to AI
- Install `cheerio` if not present: `npm install cheerio`
- Scoring prompt must include: lead name, company, title, industry, description, website summary
- Message generation prompt must include: lead data + enrichment summary + ideas + `aiInstructions`
- Default message prompts live in `api/src/shared/config/email/index.ts` — add new constants there

## Acceptance Criteria

- [ ] `LeadAiService.scoreLead()` returns a number 1–10 and persists it to `lead.score`
- [ ] `LeadAiService.enrichLead()` skips leads with no `website` and sets `enrichmentData: null`
- [ ] `LeadAiService.generateIdeas()` returns an array of 2–3 strings and persists to `lead.ideas`
- [ ] `LeadAiService.generateMessage()` uses `filter.aiInstructions` when provided
- [ ] `AiProcessWorker` processes a job from `ai-process` queue end-to-end without throwing
- [ ] A lead with `score` already set is not re-scored (idempotent)
- [ ] Unit test: mock `AiService`, assert `scoreLead` calls AI with correct prompt structure
- [ ] Unit test: assert `generateMessage` includes `aiInstructions` text in the prompt when filter has them
