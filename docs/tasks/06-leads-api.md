# Task: Leads API Module (public, read-mostly)

## Objective

Build the `leads` NestJS feature module with REST endpoints for the **public** Lead directory. Lead is the global, app-wide record of a person/business — it has no owner. Per-user state (status, score, ideas, generated_message, notes, interactions, outreach) lives on `Contact` (Task 08), not here.

The Leads API is essentially read-only with one write action: triggering AI enrichment, which writes `Lead.enrichment_data` (a public field shared across all users).

## Domain reminder

- **No `userId` filter on Lead queries.** Any authenticated user can browse the global Lead directory.
- The endpoints that used to live here (`/leads/:id/score`, `/ideas`, `/message`, `/send`, `/convert`) have moved to the Contacts API (Task 08). The thinking: those operations write per-user data, which lives on Contact.
- The "convert lead → contact" action is now `POST /contacts/from-lead/:lead_uuid`, defined in Task 08.

## Requirements

- All endpoints require JWT auth (any authenticated user can read)
- All resource lookups use `uuid` in the URL
- List endpoint supports query params for filtering and pagination
- `POST /leads/:uuid/enrich` enqueues an AI enrichment job (writes the public `Lead.enrichment_data`)

## Subtasks

- [ ] Create `api/src/modules/leads/dto/list-leads.dto.ts`:
  - `source_type?: SourceType`
  - `search?: string` (text search on name/company/email/description)
  - `page?: number` (`@IsOptional @Min(1) @Default(1)`)
  - `limit?: number` (`@IsOptional @Min(1) @Max(100) @Default(20)`)
- [ ] Create `api/src/modules/leads/leads.service.ts`:
  - `findAll(query: ListLeadsDto)` — paginated query with Prisma `where` conditions; text search via `OR [{ name: contains }, { email: contains }, { company: contains }, { description: contains }]` with `mode: 'insensitive'`. **No user filter.**
  - `findOne(uuid)` — returns the public Lead by uuid
  - `triggerEnrich(uuid)` — enqueue to `ai-process` queue with `{ lead_uuid, action: 'enrich' }` (operates on public Lead, no user scope)
- [ ] Update `ai-process.worker.ts` to handle two payload shapes:
  - `{ contact_uuid }` (default — full per-user pipeline; from Task 04 + Task 05)
  - `{ lead_uuid, action: 'enrich' }` (lead-only enrichment, no contact involvement)
- [ ] Create `api/src/modules/leads/leads.controller.ts`:
  - `GET /leads` → `findAll`
  - `GET /leads/:uuid` → `findOne`
  - `POST /leads/:uuid/enrich` → `triggerEnrich`
- [ ] Create `api/src/modules/leads/leads.module.ts` — imports `PrismaModule`, `BullModule`, `LeadAiService`; exports `LeadsService`, `LeadAiService`
- [ ] Register `LeadsModule` in `app.module.ts`
- [ ] Add Swagger decorators and `@ApiQuery` annotations for the list endpoint

## Technical Notes

- Pagination response shape:
  ```ts
  { data: Lead[], total: number, page: number, limit: number, totalPages: number }
  ```
- Use Prisma `skip` and `take` for pagination: `skip: (page - 1) * limit, take: limit`
- For the text search, use Prisma `mode: 'insensitive'` with `contains` (PostgreSQL case-insensitive)
- `triggerEnrich` should return `{ jobId: string }` from BullMQ
- Lead create/update endpoints are intentionally absent — Leads are created by the scrape worker (Task 04), not by direct API calls. Manual contact creation goes through Task 08's `POST /contacts` (which creates a `MANUAL` Lead behind the scenes).

## Acceptance Criteria

- [ ] `GET /leads?search=acme&source_type=LINKEDIN&page=1&limit=20` returns paginated public results
- [ ] `GET /leads/:uuid` returns the Lead with `enrichment_data` (no per-user fields)
- [ ] `POST /leads/:uuid/enrich` adds a job to the `ai-process` queue and returns `{ jobId }`
- [ ] No endpoint exposes `score`, `ideas`, `generated_message`, or `status` on the Lead response (those fields don't exist on Lead anymore)
- [ ] Two users get the same response from `GET /leads/:uuid` (no per-user filtering)
- [ ] Swagger documentation shows the 3 endpoints under the `leads` tag
