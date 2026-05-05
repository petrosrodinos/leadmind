# Task: Frontend — CRM Contacts UI

## Objective

Build the CRM interface: a contacts list with status pipeline view, a contact detail page with interaction timeline, notes, tags, outreach history, and status management. Integrates with the Contacts API from Task 08.

## Requirements

- Two views for contacts list: table view and Kanban-style pipeline view (grouped by status)
- Contact detail page shows a full activity timeline combining all interaction types
- Tags displayed as colored chips with add/remove inline
- Status change via drag-drop in Kanban or dropdown in table view
- Outreach action from contact detail page

## Subtasks

- [ ] Create `app/lib/api/contacts.ts` — typed API wrappers for all contacts endpoints
- [ ] Create `app/lib/types/contact.ts` — TypeScript types for Contact, ContactTag, Interaction
- [ ] Create `app/components/contacts/ContactsTable.tsx`:
  - Columns: Name, Company, Email, Phone, Status badge, Tags (chip list), Last Interaction date, Actions
  - Row click navigates to `/contacts/:id`
- [ ] Create `app/components/contacts/PipelineView.tsx` — Kanban board:
  - 5 columns: New, Qualified, Contacted, Replied, Closed
  - Each column shows a card per contact with name, company, score (if from a lead), and tag chips
  - Drag-and-drop between columns calls `PUT /contacts/:id/status` (use `@hello-pangea/dnd` or `dnd-kit`)
- [ ] Install drag-and-drop: `npm install @hello-pangea/dnd`
- [ ] Create `app/components/contacts/ContactDetail.tsx` — detail view:
  - Header: name, company, title, avatar initials
  - Meta fields: email, phone, website, location
  - Status badge with dropdown to change status
  - Tags section: chip list with inline "Add tag" input (pressing Enter adds, clicking × removes)
  - Notes section: text input to add note, list of notes below
  - "Send Outreach" button → opens `SendOutreachModal` (reuse from Task 10)
  - Linked lead section: if contact was converted from a lead, show score + ideas
- [ ] Create `app/components/contacts/InteractionTimeline.tsx`:
  - Renders a vertical timeline of all interactions
  - Each item: icon (email/sms/call/note/status), timestamp (relative), content preview
  - Colors: EMAIL=blue, SMS=green, CALL=purple, NOTE=gray, STATUS_CHANGE=orange
- [ ] Create `app/(dashboard)/contacts/page.tsx`:
  - View toggle button (Table / Pipeline)
  - Persists view preference to `localStorage`
  - Filter bar: status, tags, search input
- [ ] Create `app/(dashboard)/contacts/[id]/page.tsx` — contact detail with `ContactDetail` + `InteractionTimeline`
- [ ] Create `app/components/contacts/NewContactModal.tsx` — modal form for creating a contact manually

## Technical Notes

- Interaction icon mapping:
  ```ts
  const ICONS = { EMAIL: Mail, SMS: MessageSquare, CALL: Phone, NOTE: StickyNote, STATUS_CHANGE: ArrowRight }
  ```
- Tag add/remove: optimistic update on UI, call `PUT /contacts/:id/tags` with full new tag array
- For Kanban DnD, on drop: immediately update local state (optimistic), then call API; revert on error
- Relative timestamps: use `date-fns` `formatDistanceToNow`
- Install `date-fns` if not present: `npm install date-fns`
- Contact list pagination: same pattern as leads (URL search params)

## Acceptance Criteria

- [ ] Contacts list shows table view by default with all columns
- [ ] Toggle switches to Kanban pipeline view grouped by status
- [ ] Dragging a contact card to another column updates the status via API
- [ ] Contact detail page shows all meta fields and tags
- [ ] Adding a note via the notes section appears immediately in the interaction timeline
- [ ] Status change via dropdown creates a STATUS_CHANGE entry in the timeline
- [ ] "Send Outreach" opens the modal, submits, and adds interaction entry
- [ ] Tags can be added and removed inline; saved on each change
- [ ] Contacts created from leads show the linked lead's score and ideas
- [ ] Page transitions between list and detail preserve the active filter state
