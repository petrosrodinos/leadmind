# Task: Lead Scrape Workers (BullMQ)

## Objective

Implement the BullMQ worker that processes `filter-scrape` jobs. For each job it must: create a `FilterJob` tracking record, call the correct `ApifyService` adapter, normalize results, **upsert public `Lead` records** (deduped globally by email/linkedin_url), persist `RawLead` records for audit, **create `Contact` records** linking the filter's owner-user to each Lead, and update the `FilterJob` status on completion or failure.

## Domain reminder

- **Lead** is public/global. Dedup is global, not per-user. If two filters from different users discover the same person, they share one Lead row.
- Each Lead is created from a RawLead. The first RawLead to surface a unique person becomes that Lead's `raw_lead_uuid`. Subsequent RawLeads pointing to the same person remain as audit rows but don't update `Lead.raw_lead_uuid`.
- **Contact** is the per-user adoption of a Lead. The scrape worker creates a Contact for the filter's owner; the AI pipeline (Task 05) then writes per-user `score` onto the Contact and creates `OutreachMessage` drafts (one per `filter.channels` entry) when `filter.ai_instructions` is set.

## Requirements

- Worker must be a NestJS `@Processor` class registered in a dedicated workers module
- Each job payload contains `{ filter_uuid: string }` (user is derived from `filter.user_uuid`)
- **Lead deduplication is global**: upsert by `email` (or `linkedin_url` when email is null). Do not key on user.
- **Contact deduplication is per-user**: enforced by `@@unique([user_uuid, lead_uuid])` — use `prisma.contact.upsert` with that compound key
- On failure, update `FilterJob.status = FAILED` and store the error message
- Max concurrency: 3 simultaneous scrape jobs (configure in `@Processor` options)
- After persisting a Contact, enqueue its `contact_uuid` into the `ai-process` queue for the AI pipeline (Task 05 will implement the consumer; this task just enqueues)

## Subtasks

- [ ] Create `api/src/workers/workers.module.ts` that registers all worker processors
- [ ] Create `api/src/workers/filter-scrape.worker.ts`:
  - Class `FilterScrapeWorker` decorated with `@Processor(FILTER_SCRAPE_QUEUE, { concurrency: 3 })`
  - Inject `PrismaService`, `ApifyService`
  - Method `process(job: Job<{ filter_uuid: string }>)` decorated with `@Process()`
  - Steps inside `process()`:
    1. Load `Filter` (with `user_uuid`, `channels`, `ai_instructions`) by `filter_uuid` — throw if not found
    2. Create `FilterJob` record with `status: RUNNING, started_at: now()`
    3. Call `apifyService.scrapeLeads(filter.source_type, filter.query_config)`
    4. For each `NormalizedLead`:
       - Persist `RawLead` (always — for audit/replay)
       - Look up existing public `Lead` by `email` (or `linkedin_url`). If found, skip Lead creation. If not found, create the `Lead` and set `raw_lead_uuid = rawLead.uuid`.
       - Upsert `Contact` keyed on `(user_uuid, lead_uuid)` — sets `filter_uuid` to the discovering filter
       - On `RawLead`, set `processed_at = now()` once the Lead/Contact pair is persisted
    5. Enqueue each newly-created Contact's `contact_uuid` into `AI_PROCESS_QUEUE` with payload `{ contact_uuid }` (the AI worker reads `filter.channels` + `filter.ai_instructions` to decide whether to draft messages)
    6. Update `FilterJob`: `status: COMPLETED, leads_found: <new contact count>, completed_at: now()`
  - On any error: catch, update `FilterJob.status = FAILED, error: err.message`
- [ ] Add `AI_PROCESS_QUEUE = 'ai-process'` constant to `queues.constants.ts`
- [ ] Register `BullModule.registerQueue({ name: AI_PROCESS_QUEUE })` in `queues.module.ts`
- [ ] Register `WorkersModule` in `app.module.ts`
- [ ] Add `WorkersModule` to Bull Board so jobs are visible in the dashboard

## Technical Notes

- Processor file path: `api/src/workers/filter-scrape.worker.ts`
- Lead upsert (global) — `findFirst` + `create`/`update` since `email`/`linkedin_url` are indexed but not unique:
  ```ts
  // Prefer email; fall back to linkedin_url. If both are null, skip.
  const dedupKey = normalized.email
    ? { email: normalized.email }
    : normalized.linkedin_url
      ? { linkedin_url: normalized.linkedin_url }
      : null;
  if (!dedupKey) continue;

  let lead = await prisma.lead.findFirst({ where: dedupKey });
  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        ...mapToLead(normalized),
        source_type: filter.source_type,
        raw_lead_uuid: rawLead.uuid, // set on first creation only
      },
    });
  } else {
    // Refresh public fields with latest scraped data, but DO NOT overwrite raw_lead_uuid.
    lead = await prisma.lead.update({
      where: { uuid: lead.uuid },
      data: mapToLead(normalized),
    });
  }
  ```
- Contact upsert (per-user):
  ```ts
  const contact = await prisma.contact.upsert({
    where: { user_uuid_lead_uuid: { user_uuid: filter.user_uuid, lead_uuid: lead.uuid } },
    create: { user_uuid: filter.user_uuid, lead_uuid: lead.uuid, filter_uuid: filter.uuid },
    update: {}, // don't overwrite user notes/status if it already exists
  });
  ```
  `leads_found` should count Contacts created in this run, not upserted (i.e., new for this user).
- `RawLead.processed_at` is set when the corresponding `Contact` is successfully persisted
- Keep a private `mapToLead(normalized)` helper inside the worker for the `NormalizedLead → Lead` field mapping
- Use `@OnQueueFailed()` decorator as an alternative to try/catch for updating `FilterJob` on failure — either approach is acceptable, but try/catch inside `process()` is simpler

## Acceptance Criteria

- [ ] A job in the `filter-scrape` queue triggers the worker and creates a `FilterJob` record
- [ ] `FilterJob.status` transitions from `PENDING → RUNNING → COMPLETED` on success
- [ ] `FilterJob.leads_found` reflects the number of **new Contacts** created for the filter's owner (not total Leads)
- [ ] Two filters from different users discovering the same person produce **one Lead** and **two Contacts**; `Lead.raw_lead_uuid` is set to the **first** RawLead that produced it (not overwritten on second discovery)
- [ ] Re-running the same filter does not create duplicate Contacts (per-user uniqueness)
- [ ] `RawLead` is persisted for every scraped item, even when the Lead is a duplicate
- [ ] On Apify API failure, `FilterJob.status = FAILED` and `error` is populated
- [ ] New `contact_uuid` values appear in the `ai-process` queue after scraping
- [ ] Bull Board dashboard shows the `filter-scrape` queue
