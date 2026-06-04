# Leadfinder — 10 Feature Recommendations

**Generated:** June 4, 2026  
**Scope:** Full-stack review (`api/` NestJS + `app/` React) against `docs/specifications.md` and current implementation.

---

## Executive summary

Leadfinder already delivers a strong core: scheduled filters (LinkedIn, Google Maps, GEMI, etc.), AI scoring and enrichment, a contact CRM with pipeline, sender profiles, integrations (BYOK), marketing campaigns (standard + personalized + OpenAI batch), and webhook-driven engagement tracking (opens, clicks, replies, UTM visits).

The biggest opportunities are **closing spec/UI gaps**, **monetization and cost control**, and **sales workflows** (replies, sequences, analytics) that turn discovery into revenue.

---

## 1. Unified reply inbox

| | |
|---|---|
| **Problem** | Replies are recorded (`REPLY_RECEIVED` interactions via Resend webhooks) but there is no single place to read, triage, and respond. Users must open each contact manually. |
| **Evidence** | `api/src/modules/webhooks/services/webhook-event.service.ts`; contact timeline in `app/.../interaction-timeline.tsx` |
| **Proposal** | Add `/dashboard/inbox` with threads grouped by contact: unread replies, last message preview, quick actions (open contact, mark handled, draft reply). Optional: push new replies over the existing websocket client. |
| **Impact** | High — daily workflow for outreach-heavy users; directly supports “Replied → Converted” pipeline. |
| **Effort** | Medium |

---

## 2. Outreach sequences UI (wire up existing API)

| | |
|---|---|
| **Problem** | Backend already supports multi-step sequences with delays (`OutreachSequence`, `createSequence`, `assignSequence` in `outreach.service.ts`), but the app has no screens and `ApiRoutes` only exposes message endpoints—not sequences. |
| **Evidence** | `api/prisma/schema.prisma` (`OutreachSequence`); `docs/specifications.md` §7 “Sequences”; `app/src/config/api/routes.ts` (`outreach` without sequence paths) |
| **Proposal** | Sequence builder (name, steps: channel + delay hours + template), assign to contact(s) or auto-enroll from filter/campaign rules, timeline showing scheduled `PENDING` messages. |
| **Impact** | High — automates follow-up without one-off campaigns; matches product spec. |
| **Effort** | Medium (API mostly done; frontend + optional enrollment rules) |

---

## 3. Usage, credits, and spend dashboard

| | |
|---|---|
| **Problem** | AI costs are tracked per enrichment (`LeadEnrichment.cost_usd`, token fields) and logged in services, but users cannot see spend, set budgets, or be billed. Stripe env keys exist in validation; `credits-usage-practises` skill defines a full financial model that is **not** in Prisma yet. |
| **Evidence** | `.claude/skills/credits-usage-practises/SKILL.md`; `api/src/integrations/stripe/` (webhook handlers largely commented); no `UsageRecord` in schema |
| **Proposal** | Add `UsageRecord` (provider_charge_usd → EUR + app fee per skill), aggregate by user/day/operation (score, enrich, campaign batch). Dashboard card: credits remaining, burn rate, top costly filters. Gate expensive actions when balance is low. Wire Stripe Checkout for top-ups or subscriptions. |
| **Impact** | Critical for SaaS — protects margin on Apify + OpenAI + Resend/Twilio. |
| **Effort** | Large |

---

## 4. Account analytics page (fix orphaned routes)

| | |
|---|---|
| **Problem** | `Routes.dashboard.analytics`, `map`, and `settings` are defined and titled in `dashboard-navbar.tsx`, but **no routes or pages** are registered in `app/src/routes/index.tsx`. Campaign-level analytics exist; account-level does not. |
| **Evidence** | `app/src/routes/routes.ts` vs `app/src/routes/index.tsx`; `campaign-analytics.tsx` only on campaign detail |
| **Proposal** | Analytics page: funnel (contacts by status over time), campaign performance comparison, filter job success rate, enrichment volume, reply rate. Reuse `DashboardService` stats and campaign counters; add time-series API endpoints. Optionally fold “Map search” into filters or a dedicated geo view later. |
| **Impact** | High — “measure results” is a core promise on landing and in `app/PRODUCT.md`. |
| **Effort** | Medium |

---

## 5. LinkedIn message send (complete the channel)

| | |
|---|---|
| **Problem** | `Channel.LINKEDIN` is used for AI drafting (`contact-ai.service.ts`), but `MessageSendService` only sends **EMAIL** and **SMS**; other channels throw `not implemented`. Marketing copy promises LinkedIn outreach. |
| **Evidence** | `api/src/modules/outreach/services/message-send.service.ts` |
| **Proposal** | Phase 1: “Copy to clipboard” + mark as sent + manual interaction log (fast, no ToS risk). Phase 2: official LinkedIn API or approved automation with user-connected accounts. Surface LinkedIn drafts in contact detail and campaigns consistently. |
| **Impact** | High for positioning; medium if Phase 1 only. |
| **Effort** | Medium–Large (depends on integration depth) |

---

## 6. AI “business opportunity” insights per lead

| | |
|---|---|
| **Problem** | Spec §6.3 asks for 2–3 business opportunities per lead; codebase has scoring and enrichment summaries but **no** “ideas” field or UI. |
| **Evidence** | `docs/specifications.md`; landing “ideas” in spec UI §10 — not in app tables |
| **Proposal** | Structured AI output (Zod schema) stored on `Lead` or `Contact` metadata: `{ ideas: [{ title, rationale, suggested_offer }] }`. Show in lead directory, contact drawer, and campaign preview. Optional batch via existing OpenAI batch pipeline. |
| **Impact** | Medium–High — differentiates from generic enrichment; helps non-technical users know *what* to say. |
| **Effort** | Medium |

---

## 7. HubSpot (and CRM) two-way sync

| | |
|---|---|
| **Problem** | `ExternalIntegrationProvider.HUBSPOT`, `HUBSPOT_API_KEY` in `.env.template`, and integrations UI pattern exist, but there is no sync service. Users with existing CRMs duplicate work. |
| **Evidence** | `api/prisma/schema.prisma`; `app/.../integrations/index.tsx` lists providers |
| **Proposal** | Push: new/updated contacts, scores, last interaction. Pull: deal stage, owner, opt-out. Mapping UI in integrations. Start with HubSpot; same adapter pattern for Pipedrive later. |
| **Impact** | High for teams already on HubSpot; unlocks enterprise segment. |
| **Effort** | Large |

---

## 8. Real-time notifications (complete websocket loop)

| | |
|---|---|
| **Problem** | Frontend has `websocket-provider`, store, and subscribe helpers; API has no obvious Socket.IO gateway in `app.module` (GraphQL also commented out). Users refresh to see filter job completion or batch draft readiness. |
| **Evidence** | `app/src/components/providers/websocket-provider.tsx`; `api/src/app.module.ts` |
| **Proposal** | NestJS WebSocket gateway: events `filter_job.completed`, `openai_batch.completed`, `campaign.status_changed`, `inbox.reply_received`. Toast + badge on dashboard; optional sound for replies. |
| **Impact** | Medium — improves perceived speed (`PRODUCT.md` principle “Speed is design”). |
| **Effort** | Medium |

---

## 9. Duplicate detection and lead merge

| | |
|---|---|
| **Problem** | `Lead` is a global pool; `Contact` is per-user. Same person from multiple filters can create duplicate contacts/leads (email, LinkedIn URL, phone). No merge or dedup UX. |
| **Evidence** | `Lead` indexes on `email`, `linkedin_url`; `@@unique([user_uuid, lead_uuid])` on Contact only |
| **Proposal** | On ingest: fuzzy match (email normalize, LinkedIn slug, company+name). UI: “Possible duplicates” panel with merge (keep richest enrichment, reassign interactions). Background job to suggest merges weekly. |
| **Impact** | Medium–High — data quality affects scoring, campaigns, and reporting. |
| **Effort** | Medium |

---

## 10. Saved searches and Elasticsearch-first discovery

| | |
|---|---|
| **Problem** | `SearchService` + `ElasticsearchService` support `searchLeads` / `searchContacts`, and indexing runs on create/update—but primary UIs (leads directory, contacts list) appear Postgres-driven with basic filters. Power users cannot save complex queries. |
| **Evidence** | `api/src/modules/search/`; `api/src/integrations/elasticsearch/elasticsearch.service.ts` |
| **Proposal** | Unified search bar (full-text + filters: score range, tags, source, enrichment status). “Save view” stored per user. Optional: cross-filter search (“all dentists in Attica score ≥ 8”). Export saved view to CSV for offline work. |
| **Impact** | Medium — scales when lead volume grows; aligns with spec §9. |
| **Effort** | Medium |

---

## Suggested implementation order

| Priority | Feature | Why first |
|----------|---------|-----------|
| 1 | Reply inbox | Immediate ROI on existing webhook work |
| 2 | Sequences UI | API ready; unlocks automation |
| 3 | Analytics page | Quick win; routes already stubbed |
| 4 | Usage/credits | Required before public launch / scale |
| 5 | ES saved views | Supports growing data volume |
| 6 | Duplicate merge | Prevents CRM decay |
| 7 | Business ideas AI | Product differentiation |
| 8 | Real-time WS | Polish on async jobs |
| 9 | LinkedIn send | Match marketing; start manual |
| 10 | HubSpot sync | Bigger integration bet |

---

## Honorable mentions (not in top 10)

- **Settings page** — profile, notification prefs, default sender, timezone (route exists, no page).
- **Phone call scripts** — `PHONE_CALL` channel + Twilio voice or script-only workflow.
- **Map search route** — geo exploration if distinct from Google Maps filters.
- **Export contacts CSV** — common enterprise ask; low effort.
- **E2E test suite** — only ~12 API unit specs; add Supertest + Playwright for critical flows.
- **Health checks** — `@nestjs/terminus` for staging/production orchestration.

---

## What is already strong (keep investing)

- Filter → scrape → enrich → score pipeline with BullMQ workers and OpenAI batch for scale.
- Marketing campaigns with UTM analytics, unsubscribe, and engagement webhooks.
- BYOK integrations pattern (OpenAI, Apify, Resend, Twilio).
- Contact CRM: pipeline, tags, notes, interactions, AI compose, bulk score/enrich.
- GEMI + multi-source enrichment orchestration.

---

*This document is a product/engineering backlog suggestion, not a commitment. Re-prioritize based on your launch timeline and ICP (solo SDR vs team vs agency).*
