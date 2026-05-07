# Task: Database Schema — Leads, Filters, CRM, Outreach

## Objective

Extend the existing Prisma schema (`api/prisma/schema.prisma`) with all domain models required by the LeadFinder platform: filters, raw leads, leads (public), contacts (user-scoped CRM connection), outreach, and job tracking. Run migration and regenerate the Prisma client.

## Domain Boundaries (read first)

- **Lead** is the **generic, public, app-wide** record of a person/business — _no owner_. Each Lead is created from a `RawLead` (the audit row of what was scraped) and tracks it via `raw_lead_uuid`. Public fields: name, email, company, website, linkedin_url, industry, description, `enrichment_data`.
- **Contact** is the **user's connection to a Lead**. It owns per-user state only: `status`, AI `score`, `notes`. **No `ideas` or `generated_message` columns** — AI-drafted outreach lives on `OutreachMessage` rows. A user has at most one Contact per Lead (`@@unique([user_uuid, lead_uuid])`).
- **OutreachMessage** holds AI-drafted messages. When the AI pipeline runs and the parent Filter has both `ai_instructions` and at least one channel in `channels`, it creates one `OutreachMessage` per (contact, channel) with `status: PENDING` (a draft). The user reviews and explicitly sends.
- **Foreign keys reference `uuid`, not `id`.** Tables keep `id` as the autoincrement primary key, but every FK column is `*_uuid String` referencing the parent's `uuid`.
- **Filter supports multiple channels** (`channels Channel[]` — Postgres array), defaulting to `[EMAIL]`.
- Column names are **snake_case** (matches existing `User` model convention).

## Requirements

- All new models must follow the existing conventions: `id` (autoincrement Int PK), `uuid` (unique String with `@default(uuid())`), `created_at`/`updated_at` (`@default(now())` / `@updatedAt`)
- Use PostgreSQL-native enums declared via Prisma `enum` blocks
- Add `@@index` on frequently-queried foreign keys and status fields
- The existing `User` model must receive relation fields (no new columns needed on User, just relation annotations)
- All foreign keys reference the parent's `uuid` column (not `id`)

## Subtasks

- [ ] Add enums: `SourceType`, `Channel`, `LeadStatus`, `JobStatus`, `MsgStatus`, `InteractionType`
- [ ] Add `Filter` model: `user_uuid` (FK→User.uuid), `name`, `source_type`, `query_config Json`, `enabled Boolean @default(true)`, `cron_schedule String?`, `channels Channel[] @default([EMAIL])`, `ai_instructions String?`
- [ ] Add `RawLead` model: `filter_uuid` (FK→Filter.uuid), `source_type`, `raw_data Json`, `processed_at DateTime?`. Add inverse relation `lead Lead?` (one RawLead can spawn at most one Lead — see `Lead.raw_lead_uuid` below).
- [ ] Add `Lead` model (public, no owner): `raw_lead_uuid String?` (unique FK→RawLead.uuid; null for MANUAL leads), `name/email/phone/company/website/linkedin_url/title/location/industry/description` all `String?`, `source_type`, `raw_data Json?`, `enrichment_data Json?`. **No** user_uuid, status, score, ideas, generated_message, message_channel. Use `onDelete: SetNull` on the RawLead FK.
- [ ] Add `Contact` model (user-scoped lead view): `user_uuid` (FK→User.uuid), `lead_uuid` (FK→Lead.uuid), `filter_uuid String?` (FK→Filter.uuid, the filter that surfaced this lead for the user), `status LeadStatus @default(NEW)`, `score Int?`, `notes String?`. **No** `ideas` or `generated_message` columns. Add `@@unique([user_uuid, lead_uuid])`.
- [ ] Add `ContactTag` model: `contact_uuid`, `tag String` — add `@@unique([contact_uuid, tag])`
- [ ] Add `Interaction` model: `contact_uuid`, `user_uuid`, `type InteractionType`, `content String?`, `metadata Json?`
- [ ] Add `OutreachMessage` model: `user_uuid`, `contact_uuid` (required — outreach goes through a Contact), `channel Channel`, `subject String?`, `content String`, `status MsgStatus @default(PENDING)`, `scheduled_at DateTime?`, `sent_at DateTime?`, `metadata Json?`
- [ ] Add `OutreachSequence` model: `user_uuid`, `name String`, `steps Json`
- [ ] Add `FilterJob` model: `filter_uuid`, `status JobStatus @default(PENDING)`, `leads_found Int @default(0)`, `error String?`, `started_at DateTime @default(now())`, `completed_at DateTime?`
- [ ] Add relation fields on `User` to Filter, Contact, OutreachMessage, OutreachSequence, Interaction (note: User has **no direct relation to Lead** — leads are public)
- [ ] Run `npm run migrate:staging` and `npm run migrate:prod` from the `api/` directory
- [ ] Verify migration applied cleanly with `npm run studio:staging`

## Technical Notes

- File to edit: `api/prisma/schema.prisma`
- The `query_config Json` on Filter stores source-specific search params (e.g., `{ keywords: [], location: "", industry: "" }` for LinkedIn)
- `steps Json` on OutreachSequence stores `Array<{ delayHours: number, channel: Channel, template: string }>`
- Add `@@index([user_uuid])` on Contact, Filter; `@@index([status])` on Contact, OutreachMessage, FilterJob
- Add `@@index([filter_uuid])` on RawLead, FilterJob, Contact (via filter_uuid)
- Add `@@index([lead_uuid])` on Contact; `@@index([email])` and `@@index([linkedin_url])` on Lead (for global dedup on scrape)
- FK column type is `String` (not `Int`) since they reference `uuid`. Example: `user_uuid String` with `user User @relation(fields: [user_uuid], references: [uuid], onDelete: Cascade)`
- Cascade rules: child of user/contact/lead/filter → `onDelete: Cascade`. Optional FK (e.g., `Contact.filter_uuid`) → `onDelete: SetNull`.

## Acceptance Criteria

- [ ] `npx prisma validate` passes; migration applies on staging and prod with no errors
- [ ] All 10 new models visible in `prisma studio`
- [ ] All enums visible and correctly typed; `Channel[]` on Filter is a Postgres array
- [ ] `npx prisma generate` produces updated client in `src/generated/prisma/`
- [ ] Existing `User` model unchanged (no column additions, only relation annotations)
- [ ] `Lead` table has no `user_uuid`, `filter_uuid`, `status`, `score`, `ideas`, `generated_message`, or `message_channel` columns
- [ ] `Lead.raw_lead_uuid` is a unique nullable FK to `RawLead.uuid`
- [ ] `Contact` table has only `status`, `score`, `notes` as per-user state (no `ideas`, no `generated_message`)
- [ ] `Contact` table has a `@@unique([user_uuid, lead_uuid])` constraint
- [ ] All FK columns are named `*_uuid` (e.g., `user_uuid`, `lead_uuid`, `filter_uuid`, `contact_uuid`, `raw_lead_uuid`) and reference the parent's `uuid`
