# Task: Filters Module (CRUD + Cron Scheduling)

## Objective

Build the `filters` NestJS feature module providing full CRUD for filter configuration, plus a cron-based scheduling system that enqueues scrape jobs for enabled filters on their configured schedule. Filters belong to the authenticated user.

## Requirements

- All endpoints require JWT authentication (`JwtAuthGuard`)
- Filter ownership is enforced via `user_uuid` taken from the JWT payload — never from the request body
- `cron_schedule` must be a valid cron expression (validate with `cron-validator` or manual regex)
- When a filter is created/updated with a `cron_schedule` and `enabled: true`, register a BullMQ repeatable job
- When a filter is disabled or deleted, remove the repeatable job
- The "manual run" endpoint (`POST /filters/:uuid/run`) enqueues a one-shot job immediately
- All resource lookups use `uuid` as the URL parameter (FKs use uuid throughout the schema)

## Subtasks

- [ ] Install `cron-validator` package: `npm install cron-validator`
- [ ] Create `api/src/modules/filters/dto/create-filter.dto.ts` with class-validator decorators:
  - `name: string` (`@IsString`, `@MaxLength(100)`)
  - `source_type: SourceType` (`@IsEnum`)
  - `query_config: object` (`@IsObject`)
  - `enabled?: boolean` (`@IsOptional`, `@IsBoolean`)
  - `cron_schedule?: string` (`@IsOptional`, `@IsString`, custom `@IsCronExpression` validator)
  - `channels: Channel[]` (`@IsArray`, `@IsEnum(Channel, { each: true })`, `@ArrayMinSize(1)`) — at least one channel
  - `ai_instructions?: string` (`@IsOptional`, `@IsString`, `@MaxLength(2000)`)
- [ ] Create `api/src/modules/filters/dto/update-filter.dto.ts` — `PartialType(CreateFilterDto)`
- [ ] Create `api/src/modules/filters/filters.service.ts` with methods:
  - `create(userUuid, dto)` — persists filter, registers BullMQ job if applicable
  - `findAll(userUuid)` — list all filters for user
  - `findOne(userUuid, uuid)` — get by uuid, throw `NotFoundException` if not found or wrong user
  - `update(userUuid, uuid, dto)` — update, re-register BullMQ job if schedule changed
  - `remove(userUuid, uuid)` — delete, remove BullMQ repeatable job
  - `manualRun(userUuid, uuid)` — enqueue one-shot job, return `FilterJob` record
- [ ] Create `api/src/modules/filters/filters.controller.ts` with routes:
  - `POST /filters` → `create`
  - `GET /filters` → `findAll`
  - `GET /filters/:uuid` → `findOne`
  - `PUT /filters/:uuid` → `update`
  - `DELETE /filters/:uuid` → `remove`
  - `POST /filters/:uuid/run` → `manualRun`
  - `GET /filters/:uuid/jobs` → `findJobs` (paginated list of FilterJob records for this filter)
- [ ] Create BullMQ queue constant `FILTER_SCRAPE_QUEUE = 'filter-scrape'` in `core/queues/queues.constants.ts`
- [ ] Register `BullModule.registerQueue({ name: FILTER_SCRAPE_QUEUE })` in `queues.module.ts`
- [ ] In `filters.service.ts`, inject `@InjectQueue(FILTER_SCRAPE_QUEUE) private scrapeQueue: Queue`
- [ ] Repeatable job name pattern: `filter-scrape:{filter_uuid}` with `repeat: { pattern: cron_schedule }`
- [ ] Create `api/src/modules/filters/filters.module.ts` — imports `PrismaModule`, `BullModule`, exports `FiltersService`
- [ ] Register `FiltersModule` in `app.module.ts`
- [ ] Add Swagger decorators (`@ApiTags('filters')`, `@ApiBearerAuth()`) to controller

## Technical Notes

- Use `prismaService.filter.findFirst({ where: { uuid, user_uuid } })` to enforce ownership
- BullMQ repeatable job removal: `queue.removeRepeatableByKey(jobKey)` — store the key in the `FilterJob` or derive it from `filter-scrape:{filter_uuid}`
- `query_config` shape per `source_type`:
  - `LINKEDIN`: `{ keywords: string, location?: string, industry?: string, limit?: number }`
  - `GOOGLE_MAPS`: `{ query: string, location?: string, limit?: number }`
  - `MANUAL`: `{}` (manual filters don't auto-scrape; they exist for grouping manually-added contacts)
- `channels` is a Postgres array on the Filter model — multiple channels per filter (e.g., `[EMAIL, SMS]`). The AI message generator uses this list to produce one drafted message per channel.
- The `FilterJob` record is created by the worker (Task 04), not here — `manualRun` only enqueues; the worker creates the job record on pickup

## Acceptance Criteria

- [ ] `POST /filters` creates a filter scoped to the authenticated user with `channels` as an array
- [ ] `GET /filters` returns only filters belonging to the current user
- [ ] `DELETE /filters/:uuid` returns 404 when uuid belongs to another user
- [ ] `POST /filters/:uuid/run` adds a job to the `filter-scrape` BullMQ queue
- [ ] Creating a filter with `cron_schedule: "0 9 * * *"` adds a repeatable BullMQ job
- [ ] Updating `enabled: false` removes the repeatable job from BullMQ
- [ ] Setting `channels: [EMAIL, SMS]` persists both values; passing an empty array fails validation
- [ ] Swagger shows all 7 endpoints under the `filters` tag
