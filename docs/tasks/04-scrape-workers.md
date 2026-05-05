# Task: Lead Scrape Workers (BullMQ)

## Objective

Implement the BullMQ worker that processes `filter-scrape` jobs. For each job it must: create a `FilterJob` tracking record, call the correct `ApifyService` adapter, normalize results, deduplicate against existing leads, persist new `RawLead` and `Lead` records, and update the `FilterJob` status on completion or failure.

## Requirements

- Worker must be a NestJS `@Processor` class registered in a dedicated workers module
- Each job payload contains `{ filterId: number, userId: number }`
- Deduplication: skip leads where `email` already exists for this `userId` (check `Lead` table)
- On failure, update `FilterJob.status = FAILED` and store the error message
- Max concurrency: 3 simultaneous scrape jobs (configure in `@Processor` options)
- After persisting leads, enqueue each new `Lead.id` into the `ai-process` queue for AI pipeline (Task 05 will implement the consumer; this task just enqueues)

## Subtasks

- [ ] Create `api/src/workers/workers.module.ts` that registers all worker processors
- [ ] Create `api/src/workers/filter-scrape.worker.ts`:
  - Class `FilterScrapeWorker` decorated with `@Processor(FILTER_SCRAPE_QUEUE, { concurrency: 3 })`
  - Inject `PrismaService`, `ApifyService`
  - Method `process(job: Job<{ filterId: number; userId: number }>)` decorated with `@Process()`
  - Steps inside `process()`:
    1. Load `Filter` from DB by `filterId` — throw if not found
    2. Create `FilterJob` record with `status: RUNNING, startedAt: now()`
    3. Call `apifyService.scrapeLeads(filter.sourceType, filter.queryConfig)`
    4. For each `NormalizedLead`, check if `email` already exists in `Lead` for `userId`
    5. Persist `RawLead` (always, for logging)
    6. Persist new `Lead` records (skip duplicates)
    7. Enqueue each new lead id into `AI_PROCESS_QUEUE` with payload `{ leadId }`
    8. Update `FilterJob`: `status: COMPLETED, leadsFound: count, completedAt: now()`
  - On any error: catch, update `FilterJob.status = FAILED, error: err.message`
- [ ] Add `AI_PROCESS_QUEUE = 'ai-process'` constant to `queues.constants.ts`
- [ ] Register `BullModule.registerQueue({ name: AI_PROCESS_QUEUE })` in `queues.module.ts`
- [ ] Register `WorkersModule` in `app.module.ts`
- [ ] Add `WorkersModule` to Bull Board so jobs are visible in the dashboard

## Technical Notes

- Processor file path: `api/src/workers/filter-scrape.worker.ts`
- Use `@OnQueueFailed()` decorator as an alternative to try/catch for updating `FilterJob` on failure — either approach is acceptable, but try/catch inside `process()` is simpler
- Deduplication query:
  ```ts
  const existing = await prisma.lead.findFirst({
    where: { email: normalized.email, userId },
    select: { id: true },
  });
  ```
- When `email` is null, deduplication falls back to `linkedinUrl` uniqueness per `userId`
- `RawLead.processedAt` is set when the corresponding `Lead` record is successfully created
- Keep the `NormalizedLead → Lead` field mapping in a private `mapToLead(normalized, filterId, userId)` helper inside the worker

## Acceptance Criteria

- [ ] A job in the `filter-scrape` queue triggers the worker and creates a `FilterJob` record
- [ ] `FilterJob.status` transitions from `PENDING → RUNNING → COMPLETED` on success
- [ ] `FilterJob.leadsFound` accurately reflects the number of new `Lead` rows created
- [ ] Duplicate emails for the same user are skipped (no duplicate `Lead` rows)
- [ ] `RawLead` is persisted for every scraped item, even duplicates
- [ ] On Apify API failure, `FilterJob.status = FAILED` and `error` is populated
- [ ] New lead IDs appear in the `ai-process` queue after scraping
- [ ] Bull Board dashboard shows the `filter-scrape` queue
