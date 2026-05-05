# Task: CRM Module (Contacts, Notes, Tags, Interaction History)

## Objective

Build the `contacts` NestJS feature module implementing full CRM functionality: contact CRUD, status lifecycle management (New → Qualified → Contacted → Replied → Closed), notes, tags, interaction history, and outreach from the contact detail view. Also wire the `POST /leads/:id/convert` stub to actually create a contact from a lead.

## Requirements

- All endpoints require JWT auth; contacts are scoped to `userId`
- Converting a lead to a contact copies all available fields and sets `leadId` on the contact
- Each status change must create an `Interaction` record of type `STATUS_CHANGE`
- Adding a note creates an `Interaction` record of type `NOTE`
- Sending outreach from a contact creates an `OutreachMessage` and an `Interaction` of type `EMAIL/SMS/CALL`
- Tags are managed via `ContactTag` table — replace on update (delete all, re-insert)

## Subtasks

- [ ] Create `api/src/modules/contacts/dto/create-contact.dto.ts`:
  - `firstName/lastName/email/phone/company/website/title/location` all optional strings
  - `tags?: string[]`
  - `notes?: string`
  - `leadId?: number`
- [ ] Create `api/src/modules/contacts/dto/update-contact.dto.ts` — `PartialType(CreateContactDto)` minus `leadId`
- [ ] Create `api/src/modules/contacts/dto/update-status.dto.ts`:
  - `status: LeadStatus`
- [ ] Create `api/src/modules/contacts/dto/add-note.dto.ts`:
  - `content: string` (`@MinLength(1) @MaxLength(5000)`)
- [ ] Create `api/src/modules/contacts/dto/update-tags.dto.ts`:
  - `tags: string[]` (`@IsArray @IsString({ each: true })`)
- [ ] Create `api/src/modules/contacts/contacts.service.ts`:
  - `create(userId, dto)` — creates Contact + ContactTags + initial Interaction (type `NOTE` if notes provided)
  - `findAll(userId, query)` — paginated; filter by `status`, `tags`; text search on name/email/company
  - `findOne(userId, id)` — includes `tags`, latest 20 `interactions`, linked `lead`
  - `update(userId, id, dto)` — updates fields (not status or tags — use dedicated methods)
  - `remove(userId, id)`
  - `updateStatus(userId, id, dto)` — updates `status`, creates `Interaction { type: STATUS_CHANGE, content: 'Status changed to {new}' }`
  - `updateTags(userId, id, dto)` — deletes all `ContactTag` for contact, re-inserts new tags
  - `addNote(userId, id, dto)` — creates `Interaction { type: NOTE, content }`
  - `getInteractions(userId, id)` — returns all interactions ordered by `createdAt desc`
  - `sendOutreach(userId, id, dto: SendOutreachDto)` — delegates to `OutreachService.send()`, creates `Interaction { type: EMAIL/SMS/CALL }`
  - `convertFromLead(userId, leadId)` — check lead exists, check not already converted (`contact.leadId`), create Contact from lead fields, update `Lead.status = CONTACTED`
- [ ] Create `api/src/modules/contacts/contacts.controller.ts` with all routes from ARCHITECTURE.md
- [ ] Create `api/src/modules/contacts/contacts.module.ts` — imports `PrismaModule`, `OutreachModule`; exports `ContactsService`
- [ ] Update `LeadsService.convertToContact()` stub to call `ContactsService.convertFromLead()`
- [ ] Register `ContactsModule` in `app.module.ts`

## Technical Notes

- `findAll` tag filtering: use Prisma nested `where: { tags: { some: { tag: { in: tagsArray } } } }`
- `findOne` response shape:
  ```ts
  {
    ...contact,
    tags: string[],           // extracted from ContactTag records
    interactions: Interaction[],
    lead: { id, score, ideas, generatedMessage } | null
  }
  ```
- The `convertFromLead` method must check `prisma.contact.findFirst({ where: { leadId } })` first — throw `ConflictException` if already converted
- Status transition validation: enforce the sequence `NEW → QUALIFIED → CONTACTED → REPLIED → CLOSED` — reject if the new status is not the next valid step OR allow any forward move (simpler: allow any status change, no strict ordering)
- `Interaction.content` for `STATUS_CHANGE`: `"Status changed from {old} to {new}"`

## Acceptance Criteria

- [ ] `POST /contacts` creates a contact with tags and returns the full contact object
- [ ] `GET /contacts/:id` includes `tags`, `interactions`, and linked lead summary
- [ ] `PUT /contacts/:id/status` creates an `Interaction` record of type `STATUS_CHANGE`
- [ ] `POST /contacts/:id/notes` creates an `Interaction` record of type `NOTE`
- [ ] `PUT /contacts/:id/tags` replaces all tags (no duplicates in `ContactTag`)
- [ ] `POST /leads/:id/convert` creates a `Contact` with `leadId` set and returns the new contact
- [ ] `POST /leads/:id/convert` a second time returns `409 Conflict`
- [ ] `POST /contacts/:id/send` creates an `OutreachMessage` AND an `Interaction`
- [ ] `GET /contacts/:id/interactions` returns history in reverse chronological order
