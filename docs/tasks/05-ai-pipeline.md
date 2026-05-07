# Task: AI Pipeline (Enrichment, Scoring, Outreach Drafting)

## Objective

using the existing `integrations/ai/` module, create three AI operations at shared/services/ai and place each at the right scope:

| Operation                       | Scope    | Persists to                                                  |
| ------------------------------- | -------- | ------------------------------------------------------------ |
| Website enrichment              | public   | `Lead.enrichment_data`                                       |
| Scoring (1–10)                  | per-user | `Contact.score`                                              |
| Outreach drafting (per channel) | per-user | New `OutreachMessage` rows (one per `filter.channels` entry) |

Also implement the `ai-process` BullMQ worker that runs the full pipeline for each new Contact created by Task 04.

> **Important:** there is no `Contact.ideas` and no `Contact.generated_message` in the schema. AI-drafted outreach lives **only** on `OutreachMessage` rows — one per channel listed in the parent Filter's `channels` array, generated using `filter.ai_instructions`.

## Domain reminder

- **Enrichment is global** — a website summary is the same regardless of which user is interested. It lives on Lead.
- **Scoring is per-user** — depends on the user's filter context (`ai_instructions`). It lives on Contact.
- **Outreach drafting is per-user, per-channel** — produces one `OutreachMessage { status: PENDING, content, channel }` for each channel in `filter.channels`. The message is a draft awaiting user review; the user dispatches it via `POST /outreach/messages/:uuid/send` (Task 07), which transitions `PENDING → SENT` via the `outreach-send` worker.

## Requirements

- Build on the existing `integrations/ai/services/ai.service.ts` — do not replace it
- Use the Vercel AI SDK (`ai` package) with the existing OpenAI provider setup
- Each AI operation is a method on either `LeadAiService` (enrichment, public) or `ContactAiService` (per-user)
- Cost tracking must use the existing `ai-cost.ts` utilities
- The `ai-process` worker runs `enrichLead` (if needed) → `scoreContact` → `draftOutreachMessages` (only when `filter.ai_instructions` is set and `filter.channels.length > 0`)
- AI operations must be idempotent:
  - `enrichLead`: skip if `lead.enrichment_data` already set
  - `scoreContact`: skip if `contact.score` already set
  - `draftOutreachMessages`: skip per-channel if a `PENDING` `OutreachMessage` for `(contact, channel)` already exists (don't overwrite the user's edits)
- `ai_instructions` from the parent `Filter` is the primary input to both scoring and message drafting

## Subtasks

- [ ] Create `api/src/modules/leads/services/lead-ai.service.ts` — `LeadAiService` (public-scope AI):
  - Inject `PrismaService`, `AiService`
  - `enrichLead(lead: Lead): Promise<object | null>` — if `lead.website` exists, fetch homepage HTML (max 10KB), pass to AI for summary. Update `lead.enrichment_data`. Idempotent.
- [ ] Create `api/src/modules/contacts/services/contact-ai.service.ts` — `ContactAiService` (per-user AI):
  - Inject `PrismaService`, `AiService`
  - `scoreContact(contact, lead, filter): Promise<number>` — prompt uses lead data + `filter.ai_instructions`. Returns `{ score, reasoning }`. Updates `contact.score`. Idempotent.
  - `draftOutreachMessages(contact, lead, filter): Promise<OutreachMessage[]>`:
    1. If `!filter.ai_instructions || filter.channels.length === 0` → return `[]` (no-op)
    2. For each `channel` in `filter.channels`:
       - Skip if a `PENDING` OutreachMessage already exists for `(contact_uuid, channel)`
       - Generate channel-appropriate content using `filter.ai_instructions` + lead data + `lead.enrichment_data`
       - Create `OutreachMessage { user_uuid: contact.user_uuid, contact_uuid: contact.uuid, channel, subject?: string, content: string, status: PENDING }`
    3. Return the created rows
- [ ] Create prompt templates as private constants:
  - `ENRICH_PROMPT` (in `LeadAiService`)
  - `SCORE_PROMPT`, `EMAIL_PROMPT`, `SMS_PROMPT`, `LINKEDIN_PROMPT` (in `ContactAiService`)
- [ ] Use structured output (Zod schema via Vercel AI SDK `generateObject`) for scoring to avoid parsing errors
- [ ] Create `api/src/workers/ai-process.worker.ts` — `AiProcessWorker`:
  - `@Processor(AI_PROCESS_QUEUE, { concurrency: 5 })`
  - Payload (default): `{ contact_uuid: string, action?: 'enrich' | 'score' | 'draft' }`
  - Payload (lead-only enrichment from Task 06): `{ lead_uuid: string, action: 'enrich' }`
  - When `contact_uuid` is provided: load Contact (include `lead`, `filter`); if `action` is omitted run all three steps in sequence (enrich → score → draft); if `action` is provided, run only that step
  - Catch errors per step: log and continue to next (partial results are acceptable)
- [ ] Register `AiProcessWorker` in `workers.module.ts`
- [ ] Add `LeadAiService` to `LeadsModule`; add `ContactAiService` to `ContactsModule`

## Technical Notes

- Use `generateObject` from Vercel AI SDK for the scoring step:
  ```ts
  import { generateObject } from "ai";
  import { z } from "zod";
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: z.object({ score: z.number().min(1).max(10), reasoning: z.string() }),
    prompt: SCORE_PROMPT(lead, filter.ai_instructions),
  });
  ```
- For `draftOutreachMessages`, use `generateText` (free-form) per channel; channel-specific prompt templates control tone and length:
  - `EMAIL` — formal, may include a subject line; populate `OutreachMessage.subject`
  - `SMS` — brief (≤160 chars ideally), no subject
  - `LINKEDIN` — conversational, no subject
- Use `gpt-4o-mini` for scoring (cost-effective), `gpt-4o` for drafting messages
- Website enrichment: fetch HTML → strip tags (regex or `cheerio`) → truncate to 3000 chars before sending to AI
- Install `cheerio` if not present: `npm install cheerio`
- Scoring prompt must include: lead name, company, title, industry, description, website summary (`lead.enrichment_data`), and `filter.ai_instructions` (the user's targeting criteria)
- Drafting prompt must include: lead data + enrichment summary + `filter.ai_instructions`
- Default message prompts live in `api/src/shared/config/email/index.ts` — add new constants there
- The "skip if PENDING already exists" check: `prisma.outreachMessage.findFirst({ where: { contact_uuid, channel, status: 'PENDING' } })` — if present, don't redraft (preserves user edits)

## Acceptance Criteria

- [ ] `LeadAiService.enrichLead()` skips leads with no `website` and returns `null`
- [ ] `LeadAiService.enrichLead()` is a no-op when `lead.enrichment_data` is already set
- [ ] `ContactAiService.scoreContact()` returns a number 1–10 and persists it to `contact.score`; second call is a no-op
- [ ] `ContactAiService.draftOutreachMessages()` creates one `OutreachMessage` row per channel in `filter.channels` with `status: PENDING`
- [ ] `draftOutreachMessages` is a no-op when `filter.ai_instructions` is empty or `filter.channels` is empty
- [ ] Re-running `draftOutreachMessages` does not duplicate PENDING drafts for channels that already have one
- [ ] `AiProcessWorker` processes a `{ contact_uuid }` job end-to-end without throwing — for a contact whose filter has `ai_instructions: "..."` and `channels: [EMAIL, SMS]`, it produces 2 OutreachMessage rows
- [ ] Two users with Contacts on the same Lead get independent `score` and independent OutreachMessage drafts; the Lead's `enrichment_data` is shared
- [ ] No code path writes to `Contact.ideas` or `Contact.generated_message` (those columns no longer exist)
- [ ] Unit test: mock `AiService`, assert `scoreContact` calls AI with `filter.ai_instructions` in the prompt
- [ ] Unit test: assert `draftOutreachMessages` produces exactly `filter.channels.length` OutreachMessage rows
