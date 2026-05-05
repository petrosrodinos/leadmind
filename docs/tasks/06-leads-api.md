# Task: Leads API Module

## Objective

Build the `leads` NestJS feature module with REST endpoints for lead management, status updates, and manual AI action triggers. All operations are scoped to the authenticated user.

## Requirements

- All endpoints require JWT auth
- `leadId` ownership always validated against `userId` from JWT
- List endpoint supports query params for filtering and pagination
- AI action endpoints (score, enrich, ideas, message) enqueue jobs rather than running inline (non-blocking)
- `send` endpoint triggers immediate outreach (delegates to OutreachService from Task 07 — stub it for now)
- `convert` endpoint creates a `Contact` record from the lead (delegates to ContactsService from Task 08 — stub for now)

## Subtasks

- [ ] Create `api/src/modules/leads/dto/list-leads.dto.ts`:
  - `status?: LeadStatus`
  - `sourceType?: SourceType`
  - `minScore?: number` (1–10)
  - `search?: string` (text search on name/company/email)
  - `page?: number` (`@IsOptional @Min(1) @Default(1)`)
  - `limit?: number` (`@IsOptional @Min(1) @Max(100) @Default(20)`)
- [ ] Create `api/src/modules/leads/dto/update-lead.dto.ts`:
  - `status?: LeadStatus`
  - `name/email/phone/company/website/title/location/industry/description` all optional strings
  - `score?: number` (manual override)
- [ ] Create `api/src/modules/leads/dto/send-message.dto.ts`:
  - `channel: Channel`
  - `message: string`
  - `subject?: string` (for email)
- [ ] Create `api/src/modules/leads/leads.service.ts`:
  - `findAll(userId, query: ListLeadsDto)` — paginated query with Prisma `where` conditions; text search via `OR [{ name: contains }, { email: contains }, { company: contains }]`
  - `findOne(userId, id)` — with `filter` relation included
  - `update(userId, id, dto)`
  - `remove(userId, id)`
  - `triggerScore(userId, id)` — enqueue to `ai-process` queue with `{ leadId, action: 'score' }`
  - `triggerEnrich(userId, id)` — enqueue to `ai-process` queue with `{ leadId, action: 'enrich' }`
  - `triggerIdeas(userId, id)` — enqueue to `ai-process` queue with `{ leadId, action: 'ideas' }`
  - `triggerMessage(userId, id)` — enqueue to `ai-process` queue with `{ leadId, action: 'message' }`
  - `sendMessage(userId, id, dto)` — stub: return `{ queued: true }` (Task 07 fills this)
  - `convertToContact(userId, id)` — stub: return `{ converted: true }` (Task 08 fills this)
- [ ] Update `ai-process.worker.ts` to read the `action` field from job payload and run only the requested step (or full pipeline if `action` is absent)
- [ ] Create `api/src/modules/leads/leads.controller.ts` with all routes listed in ARCHITECTURE.md API Design section
- [ ] Create `api/src/modules/leads/leads.module.ts` — imports `PrismaModule`, `BullModule`, `LeadAiService`; exports `LeadsService`
- [ ] Register `LeadsModule` in `app.module.ts`
- [ ] Add Swagger decorators and `@ApiQuery` annotations for list endpoint

## Technical Notes

- Pagination response shape:
  ```ts
  { data: Lead[], total: number, page: number, limit: number, totalPages: number }
  ```
- Use Prisma `skip` and `take` for pagination: `skip: (page - 1) * limit, take: limit`
- `findAll` returns leads with nested `filter: { select: { name, sourceType, channel } }` for display
- For the text search, use Prisma `mode: 'insensitive'` with `contains` (PostgreSQL case-insensitive)
- `triggerScore/Enrich/Ideas/Message` should return `{ jobId: string }` from BullMQ job

## Acceptance Criteria

- [ ] `GET /leads?status=NEW&minScore=7&page=1&limit=20` returns paginated results
- [ ] `GET /leads/:id` returns full lead including `enrichmentData`, `ideas`, `generatedMessage`
- [ ] `PUT /leads/:id` returns 404 for leads not belonging to the current user
- [ ] `POST /leads/:id/score` adds a job to the `ai-process` queue and returns `{ jobId }`
- [ ] `POST /leads/:id/convert` returns `{ converted: true }` (stub — no error)
- [ ] Swagger documentation shows all 10 endpoints under `leads` tag with query param descriptions
