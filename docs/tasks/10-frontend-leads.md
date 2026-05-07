# Task: Frontend — Public Leads Directory + "My Leads" (Contacts) Table

## Objective

Build two related lead-facing surfaces in the frontend (`app/`):

1. **Public Leads Directory** (`/leads`) — browse the global Lead catalog. Read-only with one action: "Add to my CRM" (creates a Contact for the current user via `POST /contacts/from-lead/:uuid`).
2. **My Leads** (`/dashboard/leads` or `/contacts`) — the user's CRM Contacts shown as a table with all per-user data (status, AI score, ideas, generated message). This is the primary working surface.

The Contact-side table is what the original spec called the "leads table" — most user actions (status, regenerate AI, send outreach, edit notes) operate on Contact, not on Lead.

## Domain reminder

- The **table that has scores, status badges, and AI actions is the Contacts table.** Lead is the public directory.
- Per-contact AI actions: `POST /contacts/:uuid/score` (rescore) and `POST /contacts/:uuid/draft-messages` (regenerate outreach drafts using `filter.ai_instructions` for every channel in `filter.channels`). There is **no** `/ideas` and no `/message` endpoint.
- AI-drafted outreach lives on **OutreachMessage** rows (one per channel), not on Contact. List with `GET /contacts/:uuid/messages` or `GET /outreach/messages?contact_uuid=...`.
- Sending: `POST /outreach/messages/:uuid/send` (after optional edit via `PUT /outreach/messages/:uuid`).
- Lead has a single AI action: `POST /leads/:uuid/enrich` (writes the public website summary).

## Requirements

- Tables support pagination, column sorting, and filter controls
- Row expansion or side drawer to show full data
- Use TanStack Table for both data tables
- Use TanStack Query for API calls with auto-refetch every 30s while AI processing is in flight
- Optimistic UI for status changes on Contacts

## Subtasks

### Public Leads Directory

- [ ] Create `app/src/features/leads/services/leads.service.ts` — typed API wrappers: `listLeads`, `getLead`, `enrichLead`
- [ ] Create `app/src/features/leads/interfaces/lead.interface.ts` — TypeScript types matching the public Lead model (no per-user fields)
- [ ] Create `app/src/pages/dashboard/pages/leads-directory/index.tsx`:
  - Table columns: Name, Company, Email, Title, Source, Location, Actions
  - Action: "Add to my CRM" button per row → `POST /contacts/from-lead/:uuid` (disable + show check on success/409)
  - Filter bar: search, source type
  - Lead drawer/dialog on row click: shows all fields + `enrichment_data` summary

### My Leads (Contacts) table

- [ ] Create `app/src/features/contacts/services/contacts.service.ts` — typed API wrappers
- [ ] Create `app/src/features/contacts/interfaces/contact.interface.ts` — TypeScript types: `Contact` (status, score, notes — no ideas, no generated_message), `OutreachMessage`, joined `lead: Lead`, `tags: string[]`
- [ ] Create `app/src/pages/dashboard/pages/leads/components/leads-table.tsx`:
  - Columns: Checkbox, Name (from `lead.name`), Company (from `lead.company`), Email (from `lead.email`), Score (colored badge 1–10 from `contact.score`), Source (from `lead.source_type`), Status (dropdown editing `contact.status`), Drafts (count badge — number of PENDING `outreach_messages`), Actions
  - Score badge colors: red (1–3), yellow (4–6), green (7–10)
  - Status column: inline `<Select>` that calls `PUT /contacts/:uuid/status` on change
- [ ] Create `app/src/pages/dashboard/pages/leads/components/lead-drawer.tsx` — side sheet:
  - Full Lead details (name, company, email, phone, website, linkedin_url, etc.) — read-only, sourced from `contact.lead`
  - Public enrichment summary (`contact.lead.enrichment_data`)
  - Per-user section: status badge, score (read-only — set by AI), notes editor
  - **Drafted outreach panel:** list of `outreach_messages` filtered to `status: PENDING`, grouped by channel. Each item shows subject (email only) + content preview, with inline Edit / Send / Delete actions calling the Outreach endpoints.
  - **Sent history panel:** list of `outreach_messages` with `status: SENT | FAILED`, ordered by `sent_at desc`.
  - "Rescore" button → `POST /contacts/:uuid/score`
  - "Redraft messages" button → `POST /contacts/:uuid/draft-messages` (regenerates PENDING drafts for every channel in the filter)
- [ ] Create `app/src/pages/dashboard/pages/leads/components/edit-message-modal.tsx`:
  - Used to edit a single PENDING `OutreachMessage` (subject if email, content)
  - Save → `PUT /outreach/messages/:uuid`
  - Send → `POST /outreach/messages/:uuid/send`
- [ ] Create `app/src/pages/dashboard/pages/leads/components/lead-filters.tsx`:
  - Status multi-select
  - Min score slider (1–10)
  - Source type filter (passes through to `lead.source_type`)
  - Tag multi-select (from user's existing tags)
  - Search input (debounced 300ms — searches across `lead.name`, `lead.company`, `lead.email`)
- [ ] Create `app/src/pages/dashboard/pages/leads/index.tsx` — page composing all components, query state in URL search params
- [ ] Add loading skeleton, empty state

## Technical Notes

- All "lead-like" actions in the UI hit Contacts or Outreach endpoints — the only Lead endpoints called are `GET /leads`, `GET /leads/:uuid`, `POST /leads/:uuid/enrich`
- Use `useQuery` from TanStack Query keyed on `['contacts', filters]` — refetch interval 30s while any contact has a pending AI job (detect via no `score` yet, or via the existence of recent jobs)
- `useMutation` for status change, message edit/send/delete, rescore, redraft — invalidate `['contacts']` and `['outreach-messages', contact_uuid]` on success
- Score badge: `cn('badge', score >= 7 ? 'bg-green-100' : score >= 4 ? 'bg-yellow-100' : 'bg-red-100')`
- "Drafts" column count: `contact.outreach_messages?.filter(m => m.status === 'PENDING').length ?? 0`
- Pagination: URL params `?page=1&limit=20`
- Table virtualization not needed for MVP

## Acceptance Criteria

- [ ] Public Leads Directory renders with all columns and read-only fields
- [ ] "Add to my CRM" creates a Contact and shows a success toast (or 409 if already added)
- [ ] My Leads (Contacts) table renders with score, status, and a Drafts count badge
- [ ] Clicking a row opens the drawer with full Lead, score/notes, and a list of drafted/sent OutreachMessages
- [ ] Status dropdown change persists to `PUT /contacts/:uuid/status` and reflects optimistically
- [ ] "Rescore" button hits `POST /contacts/:uuid/score`; "Redraft messages" hits `POST /contacts/:uuid/draft-messages`
- [ ] Each PENDING message in the drawer has working Edit/Send/Delete actions hitting the Outreach module
- [ ] Send action transitions the message to SENT (or FAILED) — UI reflects the new status without refresh
- [ ] Pagination works on both directories
- [ ] Empty states render correctly when no leads/contacts match filters
- [ ] No UI references `contact.ideas` or `contact.generated_message` (those fields are gone)
