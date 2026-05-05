# Task: Database Schema — Leads, Filters, CRM, Outreach

## Objective

Extend the existing Prisma schema (`api/prisma/schema.prisma`) with all domain models required by the LeadFinder platform: filters, raw leads, leads, contacts, outreach, and job tracking. Run migration and regenerate the Prisma client.

## Requirements

- All new models must follow the existing conventions: `id` (autoincrement Int PK), `uuid` (unique String with `@default(uuid())`), `createdAt`/`updatedAt` (`@default(now())` / `@updatedAt`)
- Use PostgreSQL-native enums declared via Prisma `enum` blocks
- Add `@@index` on frequently-queried foreign keys and status fields
- The existing `User` model must receive relation fields (no new columns needed on User, just relation annotations)

## Subtasks

- [ ] Add enums: `SourceType`, `Channel`, `LeadStatus`, `JobStatus`, `MsgStatus`, `InteractionType`
- [ ] Add `Filter` model with fields: `userId`, `name`, `sourceType`, `queryConfig Json`, `enabled Boolean @default(true)`, `cronSchedule String?`, `channel Channel @default(EMAIL)`, `aiInstructions String?`
- [ ] Add `RawLead` model with fields: `filterId`, `sourceType`, `rawData Json`, `processedAt DateTime?`
- [ ] Add `Lead` model with fields: `userId`, `filterId Int?`, `name/email/phone/company/website/linkedinUrl/title/location/industry/description` all `String?`, `sourceType`, `rawData Json?`, `score Int?`, `enrichmentData Json?`, `ideas Json?`, `generatedMessage String?`, `messageChannel Channel?`, `status LeadStatus @default(NEW)`
- [ ] Add `Contact` model with fields: `userId`, `leadId Int?` (unique, nullable), `firstName/lastName/email/phone/company/website/title/location` all `String?`, `status LeadStatus @default(NEW)`, `notes String?`
- [ ] Add `ContactTag` model: `contactId`, `tag String` — add `@@unique([contactId, tag])`
- [ ] Add `Interaction` model: `contactId`, `userId`, `type InteractionType`, `content String?`, `metadata Json?`
- [ ] Add `OutreachMessage` model: `userId`, `leadId Int?`, `contactId Int?`, `channel Channel`, `subject String?`, `content String`, `status MsgStatus @default(PENDING)`, `scheduledAt DateTime?`, `sentAt DateTime?`, `metadata Json?`
- [ ] Add `OutreachSequence` model: `userId`, `name String`, `steps Json`
- [ ] Add `FilterJob` model: `filterId`, `status JobStatus @default(PENDING)`, `leadsFound Int @default(0)`, `error String?`, `startedAt DateTime @default(now())`, `completedAt DateTime?`
- [ ] Add relation fields on `User` to Filter, Lead, Contact, OutreachMessage, OutreachSequence, Interaction
- [ ] Run `npx prisma migrate dev --name "leads-crm-outreach-schema"` from the `api/` directory
- [ ] Run `npx prisma generate` to regenerate the client
- [ ] Verify migration applied cleanly with `npx prisma studio`

## Technical Notes

- File to edit: `api/prisma/schema.prisma`
- The `queryConfig Json` on Filter stores source-specific search params (e.g., `{ keywords: [], location: "", industry: "" }` for LinkedIn)
- `ideas Json` on Lead stores a `String[]` serialized as JSON
- `steps Json` on OutreachSequence stores `Array<{ delayHours: number, channel: Channel, template: string }>`
- Add `@@index([userId])` on Lead, Contact, Filter
- Add `@@index([status])` on Lead, Contact, OutreachMessage
- Add `@@index([filterId])` on RawLead, FilterJob

## Acceptance Criteria

- [ ] `npx prisma migrate dev` exits 0 with no errors
- [ ] All 10 new models visible in `prisma studio`
- [ ] All enums visible and correctly typed
- [ ] `npx prisma generate` produces updated client in `src/generated/prisma/`
- [ ] Existing `User` model unchanged (no column additions, only relation annotations)
