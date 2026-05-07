# LeadFinder — AI-Powered Lead Generation, Enrichment & Outreach Platform

---

## 1. PRODUCT SPECIFICATION

**Product name:** LeadFinder

**Purpose:** An AI-powered platform that automates lead discovery from multiple sources, enriches and scores those leads via AI, and manages personalized outreach — with a built-in CRM for relationship tracking.

**Target users:** Sales teams, growth hackers, B2B founders, freelancers, and marketing agencies who need to find, qualify, and contact prospects at scale.

**Core value proposition:** Replace the manual SDR workflow — from finding contacts, to researching them, to writing personalized outreach — with an automated, AI-driven pipeline running on a schedule.

**Key features:**

- Multi-source lead discovery (LinkedIn via Apify, Google, Gov records, custom)
- Configurable filter system with cron scheduling and per-channel AI instructions
- AI scoring (1–10 relevance), enrichment (website summary), and idea generation
- AI-generated personalized outreach messages (email, SMS, call script)
- Automated outreach via SendGrid (email) and Twilio (SMS + calls)
- Follow-up sequences with configurable delays
- Full CRM: contacts, status tracking, notes, tags, interaction history
- Elasticsearch-powered search and filtering across leads and contacts

**Future features:**

- LinkedIn direct messaging integration
- A/B testing for message templates
- Team collaboration with shared filters
- Lead import via CSV
- Mobile notifications

---

## 2. SYSTEM ARCHITECTURE

### Frontend Stack

- **Framework:** React Vite — located in `app/`
- **UI Components:** Shadcn/ui + Tailwind CSS
- **State:** React Query (TanStack Query) for server state, Zustand for local state
- **Forms:** React Hook Form + Zod
- **Tables:** TanStack Table

### Backend Stack

- **Framework:** NestJS — located in `api/`
- **API style:** REST (Swagger documented)
- **Job processing:** BullMQ (already configured)
- **Scheduler:** `@nestjs/schedule` + BullMQ repeat jobs for cron filters

### Database Design

- **Primary DB:** PostgreSQL via Prisma (already configured)
- **Cache/Queues:** Redis via ioredis (already configured)
- **Search:** Elasticsearch (new — index synced from Prisma on write)

### External Services

| Service                    | Purpose                       | Status |
| -------------------------- | ----------------------------- | ------ |
| Apify                      | LinkedIn & generic scraping   | New    |
| OpenAI (via Vercel AI SDK) | Scoring, enrichment, messages | Exists |
| SendGrid                   | Email outreach                | Exists |
| Twilio                     | SMS + phone call outreach     | Exists |
| Elasticsearch              | Lead/contact search           | New    |
| Stripe                     | Billing (future)              | Exists |

### Auth System

- JWT-based auth (already implemented in `modules/auth/`)
- `@nestjs/passport` + `passport-jwt`
- All lead/contact routes protected via `JwtAuthGuard`

### Deployment

- API: Railway or Render (Docker-ready NestJS)
- Frontend: Vercel
- Postgres + Redis: Railway managed instances
- Elasticsearch: Elastic Cloud (managed) or self-hosted via Docker

### Folder / Module Structure (API additions)

```
api/src/
├── modules/
│   ├── auth/                  (existing)
│   ├── filters/               (NEW) — filter CRUD + cron scheduling
│   ├── leads/                 (NEW) — leads CRUD + status management
│   ├── contacts/              (NEW) — CRM contacts
│   ├── outreach/              (NEW) — message sending + sequences
│   └── search/                (NEW) — Elasticsearch query endpoints
├── integrations/
│   ├── apify/                 (NEW) — Apify HTTP client + source adapters
│   ├── ai/                    (existing, extend) — scoring/enrichment/ideas
│   ├── notifications/         (existing) — SendGrid + Twilio
│   └── elasticsearch/         (NEW) — Elasticsearch client + indexing
├── workers/
│   ├── filter-scrape.worker.ts     (NEW) — runs scrape jobs
│   ├── ai-process.worker.ts        (NEW) — runs AI pipeline per lead
│   └── outreach-send.worker.ts     (NEW) — sends scheduled outreach
└── core/
    └── queues/                (existing, extend with new queue names)
```

---

## 3. DOMAIN MODEL

### Domain boundaries

- **Lead** is the **generic, public, app-wide** record of a person/business. It has no owner. Each Lead is created from a `RawLead` (`raw_lead_uuid` FK) — the audit record of what the scraper returned.
- **Contact** is the **per-user connection to a Lead**. It owns per-user state: `status`, AI `score`, `notes`, plus interactions and outreach history. **No `ideas` or `generated_message` columns** — AI-drafted outreach lives on `OutreachMessage`.
- **OutreachMessage** is where AI-generated messages live. When a Filter has both `ai_instructions` and at least one entry in `channels`, the AI pipeline creates one `OutreachMessage` per `(contact, channel)` with `status: PENDING` — the user reviews and triggers the actual send.
- **All foreign keys reference `uuid`, not `id`.** Tables retain `id` as the autoincrement primary key, but every FK column is `*_uuid String` referencing the parent's `uuid`.
- Column names are **snake_case**.

### End-to-end flow

```
Filter (cron or manual)
  → ApifyService.scrapeLeads (Task 02/04)
    → RawLead inserted (audit)
      → Lead upserted (global, dedup by email/linkedin_url; raw_lead_uuid set on first creation)
        → Contact upserted for filter.user_uuid (per-user view of the lead)
          → ai-process queue: { contact_uuid }
            ├─ LeadAiService.enrichLead (writes Lead.enrichment_data, public)
            ├─ ContactAiService.scoreContact (writes Contact.score, per-user)
            └─ if filter.ai_instructions && filter.channels.length > 0:
               ContactAiService.draftOutreachMessages
                 → for each channel in filter.channels:
                   create OutreachMessage { contact_uuid, channel, content, status: PENDING }
              (user reviews drafts; POST /contacts/:uuid/messages/:uuid/send dispatches via outreach-send queue)
```

### Enums

```
SourceType:   LINKEDIN | GOOGLE_MAPS | MANUAL
Channel:      EMAIL | SMS | LINKEDIN
LeadStatus:   NEW | CONTACTED | CONVERTED | ARCHIVED
JobStatus:    PENDING | RUNNING | COMPLETED | FAILED
MsgStatus:    PENDING | SENT | FAILED
InteractionType: NOTE | CALL | EMAIL
AuthRole:     USER | ADMIN | SUPER_ADMIN | SUPPORT  (existing)
```

### Entities / Tables

**User** (existing — extend with relations only; no new columns)

**Filter**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| user_uuid | String FK→User.uuid | |
| name | String | |
| source_type | SourceType | |
| query_config | Json | source-specific params |
| enabled | Boolean | default true |
| cron_schedule | String? | cron expression |
| channels | Channel[] | default `[EMAIL]` — multi-channel |
| ai_instructions | String? | custom AI prompt |
| created_at / updated_at | DateTime | |

**RawLead**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| filter_uuid | String FK→Filter.uuid | |
| source_type | SourceType | |
| raw_data | Json | original scraped payload |
| processed_at | DateTime? | null until processed into a Lead |
| created_at / updated_at | DateTime | |

**Lead** (public — no owner)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| raw_lead_uuid | String? unique FK→RawLead.uuid | source RawLead (null for MANUAL leads) |
| name | String? | |
| email | String? | indexed for global dedup |
| phone | String? | |
| company | String? | |
| website | String? | |
| linkedin_url | String? | indexed for global dedup |
| title | String? | |
| location | String? | |
| industry | String? | |
| description | String? | |
| source_type | SourceType | |
| raw_data | Json? | |
| enrichment_data | Json? | public — e.g., website summary |
| created_at / updated_at | DateTime | |

**Contact** (per-user view of a Lead — owns per-user state)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| user_uuid | String FK→User.uuid | |
| lead_uuid | String FK→Lead.uuid | |
| filter_uuid | String? FK→Filter.uuid | which filter surfaced this lead for the user |
| status | LeadStatus | default NEW |
| score | Int? | 1–10 — per-user match score |
| notes | String? | user's notes |
| created_at / updated_at | DateTime | |
| `@@unique([user_uuid, lead_uuid])` | | one Contact per (user, lead) |

> AI-drafted messages **do not live on Contact**. They live on `OutreachMessage` rows (one per channel from `filter.channels`).

**ContactTag**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| contact_uuid | String FK→Contact.uuid | |
| tag | String | |
| `@@unique([contact_uuid, tag])` | | |

**Interaction**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| contact_uuid | String FK→Contact.uuid | |
| user_uuid | String FK→User.uuid | |
| type | InteractionType | |
| content | String? | message or note text |
| metadata | Json? | extra data |
| created_at / updated_at | DateTime | |

**OutreachMessage**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| user_uuid | String FK→User.uuid | |
| contact_uuid | String FK→Contact.uuid | required — outreach goes through a Contact |
| channel | Channel | single channel per message |
| subject | String? | email subject |
| content | String | message body |
| status | MsgStatus | default PENDING |
| scheduled_at | DateTime? | for sequences |
| sent_at | DateTime? | |
| metadata | Json? | provider response |
| created_at / updated_at | DateTime | |

**OutreachSequence**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| user_uuid | String FK→User.uuid | |
| name | String | |
| steps | Json | [{delayHours, channel, template}] |
| created_at / updated_at | DateTime | |

**FilterJob**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| filter_uuid | String FK→Filter.uuid | |
| status | JobStatus | |
| leads_found | Int | default 0 |
| error | String? | |
| started_at | DateTime | |
| completed_at | DateTime? | |
| created_at / updated_at | DateTime | |

### Key Relationships

- User → many Filters, Contacts, OutreachMessages, OutreachSequences, Interactions (no direct relation to Lead — leads are public)
- Filter → many RawLeads, FilterJobs, Contacts (the contacts the filter surfaced)
- Lead → many Contacts (one per user who has it in their CRM)
- Contact → many ContactTags, Interactions, OutreachMessages; belongs to exactly one User and one Lead

---

## 4. API DESIGN

All routes under `/api/v1/` and protected by `JwtAuthGuard` unless noted.

### Filters

```
POST   /filters                    — create filter
GET    /filters                    — list (userId scoped)
GET    /filters/:id                — get one
PUT    /filters/:id                — update
DELETE /filters/:id                — delete
POST   /filters/:id/run            — manually trigger scrape job
GET    /filters/:id/jobs           — job history for filter
```

### Leads (public, read-mostly)

Leads are global. Listing/getting a Lead is allowed for any authenticated user; only public fields are returned. Per-user state (status, score, ideas, generated_message) is not exposed here — it lives on Contact.

```
GET    /leads                      — list public leads (search, source filter)
GET    /leads/:uuid                — get one public lead (no per-user state)
POST   /leads/:uuid/enrich         — trigger AI website-enrichment (writes Lead.enrichment_data — public)
```

`POST /leads/:uuid/contacts` — convert a Lead into a Contact for the current user — is exposed under the Contacts API as `POST /contacts/from-lead/:lead_uuid` (see below).

### Contacts (CRM — per-user)

```
GET    /contacts                   — list (status, tags, search)
POST   /contacts                   — create manually (creates a MANUAL Lead first if needed)
POST   /contacts/from-lead/:lead_uuid — adopt a public Lead as a Contact for the current user
GET    /contacts/:uuid             — get with tags, interactions, linked Lead, drafted outreach_messages
PUT    /contacts/:uuid             — update fields (notes)
DELETE /contacts/:uuid             — delete
PUT    /contacts/:uuid/status      — update status
PUT    /contacts/:uuid/tags        — replace tag set
POST   /contacts/:uuid/notes       — add note (creates Interaction)
GET    /contacts/:uuid/interactions — interaction history
POST   /contacts/:uuid/score       — trigger AI scoring (writes Contact.score)
POST   /contacts/:uuid/draft-messages — trigger AI to (re)draft OutreachMessage rows for every channel in the filter (uses filter.ai_instructions)
GET    /contacts/:uuid/messages    — list this contact's OutreachMessage rows (drafts + sent)
```

### Outreach

```
GET    /outreach/messages          — list user's messages (filter by contact_uuid, status)
PUT    /outreach/messages/:uuid    — edit a PENDING (drafted) message (subject/content)
POST   /outreach/messages/:uuid/send — dispatch a PENDING message via the outreach-send queue
DELETE /outreach/messages/:uuid    — delete a draft
POST   /outreach/sequences         — create sequence
GET    /outreach/sequences         — list sequences
POST   /outreach/sequences/:uuid/assign — assign a sequence to a contact
```

### Outreach

```
GET    /outreach/messages          — list sent messages (leadId or contactId filter)
POST   /outreach/sequences         — create sequence
GET    /outreach/sequences         — list sequences
POST   /outreach/sequences/:id/assign  — assign sequence to contact
```

### Search

```
GET    /search/leads               — Elasticsearch full-text + filter
GET    /search/contacts            — Elasticsearch full-text + filter
```

### Internal (admin, no JWT required or uses Basic auth)

```
GET    /internal/filter-jobs       — all running jobs
POST   /internal/leads/bulk-score  — queue AI scoring for all unscored leads
POST   /internal/leads/bulk-enrich — queue enrichment for scored leads
```

---

## 5. IMPLEMENTATION PLAN

### Phase 1 — Database Schema

**Goal:** Define all Prisma models, run migration, generate client.
**Why:** Every other phase depends on the data layer.
**Dependencies:** PostgreSQL running, existing Prisma setup.
**Tasks:** `01-database-schema.md`

---

### Phase 2 — Apify Integration

**Goal:** Build Apify HTTP adapter and source-specific query builders.
**Why:** Apify is the primary lead source; LinkedIn + generic search.
**Dependencies:** Phase 1, Apify API key.
**Tasks:** `02-apify-integration.md`

---

### Phase 3 — Filters Module

**Goal:** Full CRUD for filters + BullMQ cron job scheduling.
**Why:** Filters drive automated scrape runs on a schedule.
**Dependencies:** Phase 1, Phase 2.
**Tasks:** `03-filters-module.md`

---

### Phase 4 — Lead Scrape Workers

**Goal:** BullMQ worker that processes filter jobs: scrape → normalize → persist.
**Why:** Async processing keeps the API responsive; BullMQ provides retries.
**Dependencies:** Phase 2, Phase 3.
**Tasks:** `04-scrape-workers.md`

---

### Phase 5 — AI Pipeline

**Goal:** AI scoring, enrichment, ideas, and message generation as NestJS services.
**Why:** Core differentiator — AI transforms raw lead data into actionable intelligence.
**Dependencies:** Phase 1, existing AI integration.
**Tasks:** `05-ai-pipeline.md`

---

### Phase 6 — Leads API

**Goal:** REST endpoints for lead management + AI action triggers.
**Why:** Exposes lead data and AI actions to the frontend.
**Dependencies:** Phase 1, Phase 5.
**Tasks:** `06-leads-api.md`

---

### Phase 7 — Outreach Module

**Goal:** Send email (SendGrid), SMS (Twilio), call scripts; support sequences.
**Why:** Outreach is the end goal of the pipeline.
**Dependencies:** Phase 1, Phase 6, existing notifications integration.
**Tasks:** `07-outreach-module.md`

---

### Phase 8 — CRM Module

**Goal:** Contacts CRUD with notes, tags, status, interaction history.
**Why:** Converts one-time leads into managed relationships.
**Dependencies:** Phase 1, Phase 7.
**Tasks:** `08-crm-module.md`

---

### Phase 9 — Elasticsearch Search

**Goal:** Index leads and contacts; expose search endpoints.
**Why:** Fast full-text search that Postgres full-text can't match at scale.
**Dependencies:** Phase 1, Phase 6, Phase 8.
**Tasks:** `09-elasticsearch.md`

---

### Phase 10 — Frontend: Leads Table

**Goal:** Table UI showing leads with all data, AI outputs, and action buttons.
**Why:** Primary working surface for users.
**Dependencies:** Phase 6.
**Tasks:** `10-frontend-leads.md`

---

### Phase 11 — Frontend: Filters Management

**Goal:** UI for creating/editing filters, viewing job history, manual run.
**Why:** Users need to configure their lead discovery pipeline.
**Dependencies:** Phase 3.
**Tasks:** `11-frontend-filters.md`

---

### Phase 12 — Frontend: CRM

**Goal:** Contacts list + detail page with timeline, notes, and outreach.
**Why:** Completes the sales workflow within the platform.
**Dependencies:** Phase 8.
**Tasks:** `12-frontend-crm.md`

---

## 6. IMPLEMENTATION RULES FOR AI CODING AGENT

1. Follow tasks in phase order — each task lists its dependencies explicitly
2. Run `prisma migrate dev` after each schema change before writing service code
3. Keep each NestJS module self-contained with its own module file
4. Use `@InjectRepository` pattern via Prisma service, not raw SQL
5. Every new queue worker must be registered in `queues.module.ts`
6. Use existing `integrations/ai/services/ai.service.ts` as the base — extend, don't duplicate
7. All DTOs must use `class-validator` decorators
8. All controllers must use `@ApiTags` and `@ApiBearerAuth` for Swagger
9. Write unit tests for AI service methods (mock the Vercel AI SDK)
10. Small commits per subtask — never batch multiple tasks in one commit
