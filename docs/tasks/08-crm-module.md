# Task: CRM Module (Contacts, Notes, Tags, Interactions, AI Actions)

## Objective

Build the `contacts` NestJS feature module — the **per-user CRM core** of LeadFinder. Contacts own all per-user state: status, AI score, ideas, drafted messages, notes, tags, interactions, and outreach history. Most "lead actions" from the original spec live here, since Lead is now public/global.

## Domain reminder

- **Contact** = `(User × Lead)`. The connection between a user and a public Lead, with `@@unique([user_uuid, lead_uuid])`.
- **A Contact owns:** `status`, `score`, `notes`, plus its `tags` and `interactions`. AI-drafted outreach lives on `OutreachMessage` rows (Task 07), not on Contact.
- **A Contact does NOT own:** the lead's name/email/phone/company/website/etc. (those live on the public Lead). It also does NOT have `ideas` or `generated_message` columns.
- The scrape worker (Task 04) auto-creates Contacts when a filter discovers a Lead. Manual contact creation goes through `POST /contacts` (creates a `MANUAL`-source Lead first if needed).

## Requirements

- All endpoints require JWT auth; contacts are scoped to `user_uuid` from JWT
- All resource lookups use `uuid` in the URL
- Each status change creates an `Interaction` record (`type: NOTE` with `content: "Status changed from X to Y"`, since the schema's `InteractionType` enum is `NOTE | CALL | EMAIL` — there's no STATUS_CHANGE, so use `NOTE` with a structured content prefix)
- Adding a note creates an `Interaction` record of type `NOTE`
- Tags are managed via `ContactTag` table — replace on update (delete all, re-insert)
- AI action endpoints: `score` (writes `Contact.score`) and `draft-messages` (creates `OutreachMessage` rows via `ContactAiService.draftOutreachMessages`). There are **no** `ideas` or `message` endpoints — those columns don't exist.
- Sending outreach is handled by the Outreach module (Task 07): `POST /outreach/messages/:uuid/send`. The CRM module exposes `GET /contacts/:uuid/messages` to list a contact's drafts and sent history, but doesn't own the send flow.

## Subtasks

- [ ] Create `api/src/modules/contacts/dto/create-contact.dto.ts` (manual creation):
  - `name?: string`, `email?: string`, `phone?: string`, `company?: string`, `website?: string`, `title?: string`, `location?: string` (used to build a `MANUAL`-source Lead)
  - `tags?: string[]`
  - `notes?: string`
- [ ] Create `api/src/modules/contacts/dto/update-contact.dto.ts`:
  - `notes?: string` (the only field directly editable on Contact — most "contact info" actually lives on Lead)
- [ ] Create `api/src/modules/contacts/dto/update-status.dto.ts`:
  - `status: LeadStatus`
- [ ] Create `api/src/modules/contacts/dto/add-note.dto.ts`:
  - `content: string` (`@MinLength(1) @MaxLength(5000)`)
- [ ] Create `api/src/modules/contacts/dto/update-tags.dto.ts`:
  - `tags: string[]` (`@IsArray @IsString({ each: true })`)
- [ ] Create `api/src/modules/contacts/contacts.service.ts`:
  - `create(userUuid, dto)` — creates a `MANUAL` Lead from the contact info, then a Contact pointing at it; persists tags + initial NOTE Interaction if `notes` provided
  - `findAll(userUuid, query)` — paginated; filter by `status`, `tags`, `min_score`; text search delegated to Lead fields via `where: { lead: { OR: [...] } }`
  - `findOne(userUuid, uuid)` — includes `tags`, latest 20 `interactions`, full linked `lead`
  - `update(userUuid, uuid, dto)` — updates `notes` only (status and tags use dedicated methods)
  - `remove(userUuid, uuid)`
  - `updateStatus(userUuid, uuid, dto)` — updates `status`, creates `Interaction { type: NOTE, content: "Status changed from {old} to {new}" }`
  - `updateTags(userUuid, uuid, dto)` — deletes all `ContactTag` for contact, re-inserts new tags
  - `addNote(userUuid, uuid, dto)` — creates `Interaction { type: NOTE, content }`
  - `getInteractions(userUuid, uuid)` — returns all interactions ordered by `created_at desc`
  - `convertFromLead(userUuid, leadUuid)` — verify Lead exists, check `findFirst({ where: { user_uuid, lead_uuid: leadUuid } })` for existing Contact (throw `ConflictException` if found), create new Contact with `status: NEW`
  - `triggerScore(userUuid, uuid)` — enqueue `{ contact_uuid: uuid, action: 'score' }` to `ai-process` queue
  - `triggerDraftMessages(userUuid, uuid)` — enqueue `{ contact_uuid: uuid, action: 'draft' }` to `ai-process` queue (delegates to `ContactAiService.draftOutreachMessages`, which uses `filter.ai_instructions` + `filter.channels` to create one PENDING `OutreachMessage` per channel)
  - `listMessages(userUuid, uuid)` — return all `OutreachMessage` rows for this contact (drafts + sent), ordered by `created_at desc`
- [ ] Create `api/src/modules/contacts/contacts.controller.ts` with all routes from ARCHITECTURE.md (Contacts section)
- [ ] Create `api/src/modules/contacts/contacts.module.ts` — imports `PrismaModule`, `OutreachModule`, `BullModule`; exports `ContactsService`
- [ ] Register `ContactsModule` in `app.module.ts`
- [ ] Update the `ai-process.worker.ts` (Task 05) to honor an optional `action` field on `{ contact_uuid }` payloads so manual triggers can run a single AI step

## Technical Notes

- `findAll` tag filtering: use Prisma nested `where: { tags: { some: { tag: { in: tagsArray } } } }`
- `findAll` text search: delegate to lead via `where: { lead: { OR: [{ name: ... }, { email: ... }, { company: ... }] } }`
- `findOne` response shape:
  ```ts
  {
    ...contact,                       // status, score, notes (no ideas/generated_message)
    tags: string[],                   // extracted from ContactTag records
    interactions: Interaction[],      // latest 20
    outreach_messages: OutreachMessage[], // drafts + sent
    lead: Lead                        // full public lead — name, email, phone, company, website, etc.
  }
  ```
- `convertFromLead` uniqueness: rely on the `@@unique([user_uuid, lead_uuid])` index — wrap the create in try/catch on `P2002` to return 409
- Status transition: allow any forward move; do not enforce strict ordering
- `Interaction.content` for status change: `"Status changed from {old} to {new}"` with `type: NOTE`
- The `ai-process` worker payload supports an optional `action?: 'enrich' | 'score' | 'draft'` field that, when set, causes the worker to run only that step instead of the full pipeline

## Acceptance Criteria

- [ ] `POST /contacts` creates a Contact (and a `MANUAL` Lead behind the scenes) with tags and returns the full contact + lead object
- [ ] `POST /contacts/from-lead/:lead_uuid` creates a Contact for the current user and returns 409 on second call
- [ ] `GET /contacts/:uuid` includes `tags`, `interactions`, full linked `lead`, and `outreach_messages` (drafts + sent)
- [ ] `PUT /contacts/:uuid/status` creates an `Interaction` recording the change
- [ ] `POST /contacts/:uuid/notes` creates an `Interaction` of type `NOTE`
- [ ] `PUT /contacts/:uuid/tags` replaces all tags (no duplicates in `ContactTag`)
- [ ] `POST /contacts/:uuid/score` enqueues a single-step AI job (`action: 'score'`) and returns `{ jobId }`
- [ ] `POST /contacts/:uuid/draft-messages` enqueues `action: 'draft'`; on completion, exactly `filter.channels.length` PENDING OutreachMessage rows exist for the contact
- [ ] `GET /contacts/:uuid/messages` returns the contact's OutreachMessage rows ordered by `created_at desc`
- [ ] `GET /contacts/:uuid/interactions` returns history in reverse chronological order
- [ ] Two users with Contacts on the same Lead see independent `score`, `notes`, and OutreachMessage drafts
- [ ] No `/contacts/:uuid/ideas` or `/contacts/:uuid/message` endpoints exist (those concepts were removed)
