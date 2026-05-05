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

### Enums

```
SourceType:   LINKEDIN | GOOGLE | GOV | APIFY_GENERIC | CUSTOM
Channel:      EMAIL | SMS | PHONE_CALL
LeadStatus:   NEW | QUALIFIED | CONTACTED | REPLIED | CLOSED
JobStatus:    PENDING | RUNNING | COMPLETED | FAILED
MsgStatus:    PENDING | SENT | FAILED | DELIVERED | OPENED | REPLIED
InteractionType: EMAIL | SMS | CALL | NOTE | STATUS_CHANGE
UserRole:     USER | ADMIN | SUPER_ADMIN | SUPPORT  (existing)
```

### Entities / Tables

**User** (existing — extend with relations)

**Filter**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| userId | Int FK→User | |
| name | String | |
| sourceType | SourceType | |
| queryConfig | Json | source-specific params |
| enabled | Boolean | default true |
| cronSchedule | String? | cron expression |
| channel | Channel | default EMAIL |
| aiInstructions | String? | custom AI prompt |
| createdAt / updatedAt | DateTime | |

**RawLead**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| filterId | Int FK→Filter | |
| sourceType | SourceType | |
| rawData | Json | original scraped payload |
| processedAt | DateTime? | null until processed |
| createdAt | DateTime | |

**Lead**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| userId | Int FK→User | |
| filterId | Int? FK→Filter | |
| name | String? | |
| email | String? | |
| phone | String? | |
| company | String? | |
| website | String? | |
| linkedinUrl | String? | |
| title | String? | |
| location | String? | |
| industry | String? | |
| description | String? | |
| sourceType | SourceType | |
| rawData | Json? | |
| score | Int? | 1–10 |
| enrichmentData | Json? | website summary etc. |
| ideas | Json? | String[] |
| generatedMessage | String? | |
| messageChannel | Channel? | |
| status | LeadStatus | default NEW |
| createdAt / updatedAt | DateTime | |

**Contact** (CRM)
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| userId | Int FK→User | |
| leadId | Int? FK→Lead | source lead |
| firstName | String? | |
| lastName | String? | |
| email | String? | |
| phone | String? | |
| company | String? | |
| website | String? | |
| title | String? | |
| location | String? | |
| status | LeadStatus | default NEW |
| notes | String? | |
| createdAt / updatedAt | DateTime | |

**ContactTag**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| contactId | Int FK→Contact | |
| tag | String | |

**Interaction**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| contactId | Int FK→Contact | |
| userId | Int FK→User | |
| type | InteractionType | |
| content | String? | message or note text |
| metadata | Json? | extra data |
| createdAt | DateTime | |

**OutreachMessage**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| userId | Int FK→User | |
| leadId | Int? FK→Lead | |
| contactId | Int? FK→Contact | |
| channel | Channel | |
| subject | String? | email subject |
| content | String | message body |
| status | MsgStatus | default PENDING |
| scheduledAt | DateTime? | for sequences |
| sentAt | DateTime? | |
| metadata | Json? | provider response |
| createdAt | DateTime | |

**OutreachSequence**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| userId | Int FK→User | |
| name | String | |
| steps | Json | [{delayHours, channel, template}] |
| createdAt | DateTime | |

**FilterJob**
| Field | Type | Notes |
|-------|------|-------|
| id | Int PK | |
| uuid | String unique | |
| filterId | Int FK→Filter | |
| status | JobStatus | |
| leadsFound | Int | default 0 |
| error | String? | |
| startedAt | DateTime | |
| completedAt | DateTime? | |
| createdAt | DateTime | |

### Key Relationships

- User → many Filters, Leads, Contacts, OutreachMessages
- Filter → many RawLeads, Leads, FilterJobs
- Lead → many OutreachMessages; optionally becomes one Contact
- Contact → many ContactTags, Interactions, OutreachMessages

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

### Leads

```
GET    /leads                      — list (score, status, source, search query params)
GET    /leads/:id                  — get one with full AI data
PUT    /leads/:id                  — update (status, manual edits)
DELETE /leads/:id                  — delete
POST   /leads/:id/score            — trigger AI scoring
POST   /leads/:id/enrich           — trigger AI enrichment
POST   /leads/:id/ideas            — trigger AI idea generation
POST   /leads/:id/message          — generate AI outreach message
POST   /leads/:id/send             — send outreach message immediately
POST   /leads/:id/convert          — convert lead → contact
```

### Contacts (CRM)

```
GET    /contacts                   — list (status, tags, search)
POST   /contacts                   — create manually
GET    /contacts/:id               — get with tags + interactions
PUT    /contacts/:id               — update fields
DELETE /contacts/:id               — delete
PUT    /contacts/:id/status        — update status
PUT    /contacts/:id/tags          — replace tag set
POST   /contacts/:id/notes         — add note (creates Interaction)
GET    /contacts/:id/interactions  — interaction history
POST   /contacts/:id/send          — send outreach
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
