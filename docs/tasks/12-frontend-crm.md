# Task: Frontend — CRM Contacts UI

## Objective

Build the CRM interface: a contacts list with status pipeline view, a contact detail page with interaction timeline, notes, tags, AI outputs (score, ideas, generated message), outreach history, and status management. Integrates with the Contacts API from Task 08.

## Domain reminder

- A **Contact** owns the user-specific data: `status`, `score`, `notes`, `tags`. Contact info (name, email, phone, company, etc.) is read from the joined `lead` field. There are **no** `ideas` or `generated_message` columns.
- AI re-generation actions: `POST /contacts/:uuid/score` (rescore) and `POST /contacts/:uuid/draft-messages` (regenerate one PENDING `OutreachMessage` per channel listed in the parent filter, using `filter.ai_instructions`).
- Outreach drafts and sent history are `OutreachMessage` rows. List via `GET /contacts/:uuid/messages`. Edit/send/delete an individual message via the Outreach module: `PUT /outreach/messages/:uuid`, `POST /outreach/messages/:uuid/send`, `DELETE /outreach/messages/:uuid`.
- All resource lookups use `uuid`.

## Requirements

- Two views for contacts list: **table view** and **Kanban-style pipeline view** (grouped by status)
- Contact detail page shows a full activity timeline combining all interaction types
- Tags displayed as colored chips with add/remove inline
- Status change via drag-drop in Kanban or dropdown in table view
- Outreach action from contact detail page

## Subtasks

- [ ] Create `app/src/features/contacts/services/contacts.service.ts` — typed API wrappers for all contacts endpoints
- [ ] Create `app/src/features/outreach/services/outreach.service.ts` — typed API wrappers for outreach message edit/send/delete
- [ ] Create `app/src/features/contacts/interfaces/contact.interface.ts` — TypeScript types: `Contact` (status, score, notes), `ContactTag`, `Interaction`, `OutreachMessage`, joined `lead: Lead`
- [ ] Create `app/src/pages/dashboard/pages/contacts/components/contacts-table.tsx`:
  - Columns: Name (`lead.name`), Company (`lead.company`), Email (`lead.email`), Phone (`lead.phone`), Status badge (`contact.status`), Score (`contact.score`), Tags (chip list), Last Interaction date, Actions
  - Row click navigates to `/dashboard/contacts/:uuid`
- [ ] Create `app/src/pages/dashboard/pages/contacts/components/pipeline-view.tsx` — Kanban board:
  - 4 columns matching `LeadStatus`: NEW, CONTACTED, CONVERTED, ARCHIVED
  - Each card: name, company, score (colored), tag chips
  - Drag-and-drop between columns calls `PUT /contacts/:uuid/status` (use `@hello-pangea/dnd` or `dnd-kit`)
- [ ] Install drag-and-drop: `npm install @hello-pangea/dnd`
- [ ] Create `app/src/pages/dashboard/pages/contacts/components/contact-detail.tsx`:
  - Header: name (from `contact.lead.name`), company, title, avatar initials
  - Meta fields (read-only, from `contact.lead`): email, phone, website, location, linkedin_url, industry
  - Per-user section (editable): status badge with dropdown, score (read-only — set by AI), notes textarea
  - Tags section: chip list with inline "Add tag" input (Enter adds, × removes)
  - **Drafted outreach panel:** list of `OutreachMessage` rows where `status: PENDING`, grouped by channel. Each row exposes Edit / Send / Delete (calls `PUT /outreach/messages/:uuid`, `POST /outreach/messages/:uuid/send`, `DELETE /outreach/messages/:uuid`).
  - **Sent history panel:** list of `OutreachMessage` rows where `status` is `SENT` or `FAILED`, ordered by `sent_at desc`.
  - "Rescore" button → `POST /contacts/:uuid/score`
  - "Redraft messages" button → `POST /contacts/:uuid/draft-messages` (regenerates one PENDING message per channel)
- [ ] Create `app/src/pages/dashboard/pages/contacts/components/interaction-timeline.tsx`:
  - Vertical timeline of all interactions (from `GET /contacts/:uuid/interactions`)
  - Each item: icon, timestamp (relative), content preview
  - Type → icon: `EMAIL` → Mail (blue), `CALL` → Phone (purple), `NOTE` → StickyNote (gray)
- [ ] Create `app/src/pages/dashboard/pages/contacts/index.tsx`:
  - View toggle button (Table / Pipeline) — persists to `localStorage`
  - Filter bar: status, tags, min score, search input
- [ ] Create `app/src/pages/dashboard/pages/contacts/pages/detail/index.tsx` (uses `:uuid` route) — composes `ContactDetail` + `InteractionTimeline`
- [ ] Create `app/src/pages/dashboard/pages/contacts/components/new-contact-modal.tsx` — modal for manual creation (creates a `MANUAL`-source Lead + Contact in one call)

## Technical Notes

- Interaction icon mapping (only the 3 enum values):
  ```ts
  const ICONS = { EMAIL: Mail, CALL: Phone, NOTE: StickyNote };
  ```
- Status changes that come back as Interactions of type `NOTE` (per the schema) can be visually distinguished by parsing the `content` prefix `"Status changed from"` — render with an arrow icon if matched.
- Tag add/remove: optimistic update on UI, call `PUT /contacts/:uuid/tags` with full new tag array
- For Kanban DnD, on drop: optimistic local state update, then API; revert on error
- Relative timestamps: use `date-fns` `formatDistanceToNow`
- Install `date-fns` if not present: `npm install date-fns`
- Contact list pagination: same pattern as leads (URL search params)
- Drafted outreach list: filter to `status === 'PENDING'`. Channel chips above the list let the user filter to one channel at a time. Edit opens an inline form or modal that submits via `PUT /outreach/messages/:uuid`.

## Acceptance Criteria

- [ ] Contacts list shows table view by default with all columns including Score
- [ ] Toggle switches to Kanban pipeline view grouped by `NEW | CONTACTED | CONVERTED | ARCHIVED`
- [ ] Dragging a contact card to another column updates `PUT /contacts/:uuid/status`
- [ ] Contact detail page shows Lead meta (read-only) and Contact per-user state (editable)
- [ ] Drafted outreach panel renders one row per PENDING `OutreachMessage`; Edit, Send, and Delete buttons call the right Outreach endpoints
- [ ] Sent history panel renders SENT/FAILED messages in reverse chronological order
- [ ] "Rescore" button hits `POST /contacts/:uuid/score`
- [ ] "Redraft messages" button hits `POST /contacts/:uuid/draft-messages` and produces one PENDING message per channel in the parent filter
- [ ] Adding a note via the notes section appears immediately in the timeline
- [ ] Status change creates a NOTE interaction with `"Status changed from..."` content
- [ ] Tags can be added and removed inline; saved on each change
- [ ] Page transitions between list and detail preserve the active filter state
- [ ] Two users browsing their own CRM never see each other's contacts (server-enforced; verify by switching JWTs)
- [ ] No UI references `contact.ideas` or `contact.generated_message` (those fields are gone)
