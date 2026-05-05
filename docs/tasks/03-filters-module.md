# Task: Filters Module (CRUD + Cron Scheduling)

## Objective

Build the `filters` NestJS feature module providing full CRUD for filter configuration, plus a cron-based scheduling system that enqueues scrape jobs for enabled filters on their configured schedule. Filters belong to the authenticated user.

## Requirements

- All endpoints require JWT authentication (`JwtAuthGuard`)
- Filter `userId` is always taken from the JWT payload — never from the request body
- `cronSchedule` must be a valid cron expression (validate with `cron-validator` or manual regex)
- When a filter is created/updated with a `cronSchedule` and `enabled: true`, register a BullMQ repeatable job
- When a filter is disabled or deleted, remove the repeatable job
- The "manual run" endpoint (`POST /filters/:id/run`) enqueues a one-shot job immediately

## Subtasks

- [ ] Install `cron-validator` package: `npm install cron-validator`
- [ ] Create `api/src/modules/filters/dto/create-filter.dto.ts` with class-validator decorators:
  - `name: string` (`@IsString`, `@MaxLength(100)`)
  - `sourceType: SourceType` (`@IsEnum`)
  - `queryConfig: object` (`@IsObject`)
  - `enabled?: boolean` (`@IsOptional`, `@IsBoolean`)
  - `cronSchedule?: string` (`@IsOptional`, `@IsString`, custom `@IsCronExpression` validator)
  - `channel: Channel` (`@IsEnum`)
  - `aiInstructions?: string` (`@IsOptional`, `@IsString`, `@MaxLength(2000)`)
- [ ] Create `api/src/modules/filters/dto/update-filter.dto.ts` — `PartialType(CreateFilterDto)`
- [ ] Create `api/src/modules/filters/filters.service.ts` with methods:
  - `create(userId, dto)` — persists filter, registers BullMQ job if applicable
  - `findAll(userId)` — list all filters for user
  - `findOne(userId, id)` — get by id, throw `NotFoundException` if not found or wrong user
  - `update(userId, id, dto)` — update, re-register BullMQ job if schedule changed
  - `remove(userId, id)` — delete, remove BullMQ repeatable job
  - `manualRun(userId, id)` — enqueue one-shot job, return `FilterJob` record
- [ ] Create `api/src/modules/filters/filters.controller.ts` with routes:
  - `POST /filters` → `create`
  - `GET /filters` → `findAll`
  - `GET /filters/:id` → `findOne`
  - `PUT /filters/:id` → `update`
  - `DELETE /filters/:id` → `remove`
  - `POST /filters/:id/run` → `manualRun`
  - `GET /filters/:id/jobs` → `findJobs` (paginated list of FilterJob records for this filter)
- [ ] Create BullMQ queue constant `FILTER_SCRAPE_QUEUE = 'filter-scrape'` in `core/queues/queues.constants.ts`
- [ ] Register `BullModule.registerQueue({ name: FILTER_SCRAPE_QUEUE })` in `queues.module.ts`
- [ ] In `filters.service.ts`, inject `@InjectQueue(FILTER_SCRAPE_QUEUE) private scrapeQueue: Queue`
- [ ] Repeatable job name pattern: `filter-scrape:{filterId}` with `repeat: { pattern: cronSchedule }`
- [ ] Create `api/src/modules/filters/filters.module.ts` — imports `PrismaModule`, `BullModule`, exports `FiltersService`
- [ ] Register `FiltersModule` in `app.module.ts`
- [ ] Add Swagger decorators (`@ApiTags('filters')`, `@ApiBearerAuth()`) to controller

## Technical Notes

- Use `prismaService.filter.findFirst({ where: { id, userId } })` to enforce ownership
- BullMQ repeatable job removal: `queue.removeRepeatableByKey(jobKey)` — store the key in the `FilterJob` or derive it from `filter-scrape:{filterId}`
- `queryConfig` shape per `sourceType`:
  - `LINKEDIN`: `{ keywords: string, location?: string, industry?: string, limit?: number }`
  - `GOOGLE`: `{ query: string, limit?: number }`
  - `GOV`: `{ state?: string, businessType?: string, limit?: number }`
  - `APIFY_GENERIC`: `{ actorId: string, input: object }`
  - `CUSTOM`: `{ url: string, selector?: string }`
- The `FilterJob` record is created by the worker (Task 04), not here — `manualRun` only enqueues; the worker creates the job record on pickup

## Acceptance Criteria

- [ ] `POST /filters` creates a filter scoped to the authenticated user
- [ ] `GET /filters` returns only filters belonging to the current user
- [ ] `DELETE /filters/:id` returns 404 when id belongs to another user
- [ ] `POST /filters/:id/run` adds a job to the `filter-scrape` BullMQ queue
- [ ] Creating a filter with `cronSchedule: "0 9 * * *"` adds a repeatable BullMQ job
- [ ] Updating `enabled: false` removes the repeatable job from BullMQ
- [ ] Swagger shows all 7 endpoints under the `filters` tag
