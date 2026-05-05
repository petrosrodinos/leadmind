# Task: Frontend — Leads Table & AI Actions

## Objective

Build the primary leads interface in the Next.js frontend (`app/`): a data table showing all leads with their AI outputs (score, ideas, generated message), status badges, and action buttons (edit, send, regenerate, add to contacts). Integrate with the Leads API from Task 06.

## Requirements

- Table must support pagination, column sorting, and filter controls (status, score, source)
- Row expansion or side drawer to show full AI data (enrichment, ideas, message)
- Actions: change status, trigger AI re-generation, send outreach, convert to contact
- Optimistic UI for status changes
- Use TanStack Table for the data table
- Use TanStack Query for API calls with auto-refetch every 30 seconds (for processing leads)

## Subtasks

- [ ] Set up API client: create `app/lib/api/leads.ts` with typed fetch wrappers for all leads endpoints (use `fetch` with auth token from session)
- [ ] Create `app/lib/types/lead.ts` — TypeScript types mirroring the Prisma Lead model + AI fields
- [ ] Create `app/components/leads/LeadsTable.tsx` using TanStack Table:
  - Columns: Checkbox, Name, Company, Email, Score (colored badge 1–10), Source, Status (dropdown), Ideas (count badge), Message (preview icon), Actions
  - Score badge colors: red (1–3), yellow (4–6), green (7–10)
  - Status column: inline `<Select>` that calls `PUT /leads/:id` on change
- [ ] Create `app/components/leads/LeadDrawer.tsx` — side sheet showing:
  - Full lead details (all fields)
  - Enrichment summary (from `enrichmentData`)
  - Business ideas list
  - Generated message with copy button
  - "Regenerate" buttons for each AI output (calls trigger endpoints)
  - "Send" button → opens `SendOutreachModal`
  - "Convert to Contact" button
- [ ] Create `app/components/leads/SendOutreachModal.tsx`:
  - Channel selector (Email / SMS / Call)
  - Subject field (email only)
  - Message textarea (pre-filled with `generatedMessage`)
  - Send button → calls `POST /leads/:id/send`
- [ ] Create `app/components/leads/LeadFilters.tsx` — filter bar:
  - Status multi-select
  - Min score slider (1–10)
  - Source type filter
  - Search input (debounced 300ms, updates query param)
- [ ] Create `app/(dashboard)/leads/page.tsx` — page that composes all components, manages query state in URL search params (page, filters)
- [ ] Add loading skeleton for table rows while fetching
- [ ] Add empty state illustration when no leads found

## Technical Notes

- Use `useQuery` from TanStack Query keyed on `['leads', filters]` — refetch interval 30s
- `useMutation` for status change, send, convert — invalidate `['leads']` on success
- Score badge: `cn('badge', score >= 7 ? 'bg-green-100' : score >= 4 ? 'bg-yellow-100' : 'bg-red-100')`
- Pagination: URL params `?page=1&limit=20` — use `useSearchParams` from Next.js
- Table virtualization not needed for MVP (max ~100 rows per page)
- The "Regenerate" button for any AI field calls the corresponding trigger endpoint and shows a spinner on that field until the next refetch detects a new value

## Acceptance Criteria

- [ ] Leads table renders with all columns and correct data from the API
- [ ] Filtering by status/score/source updates the table without full page reload
- [ ] Clicking a row opens the drawer with full AI data
- [ ] Status dropdown change persists to the API and reflects immediately (optimistic)
- [ ] "Send" button opens modal, pre-fills message, and submits outreach
- [ ] "Convert to Contact" button shows success toast and disables itself after conversion
- [ ] Pagination controls work (next/prev/page numbers)
- [ ] Empty state shown when no leads match filters
- [ ] Page loads with skeleton while data is fetching
