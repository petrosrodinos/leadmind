# Task: Frontend — Filters Management UI

## Objective

Build the filters management interface in the Next.js frontend: a list of configured filters with their status, a form to create/edit filters (with source-specific query config fields), manual run trigger, and a job history view per filter.

## Requirements

- Form fields adapt dynamically based on selected `sourceType`
- Cron schedule field has a human-readable preview (e.g., "Every day at 9:00 AM")
- Enable/disable toggle updates the filter and shows current state
- Manual run button shows spinner while the job is pending, then shows result
- Job history table per filter with status badges

## Subtasks

- [ ] Create `app/lib/api/filters.ts` — typed API wrappers for all filter endpoints
- [ ] Create `app/lib/types/filter.ts` — TypeScript types for Filter, FilterJob
- [ ] Create `app/components/filters/FilterCard.tsx` — card showing:
  - Filter name, source type badge, channel badge
  - Enabled/disabled toggle (calls `PUT /filters/:id`)
  - Cron schedule in human-readable format
  - "Run Now" button → calls `POST /filters/:id/run`, shows spinner
  - "Edit" and "Delete" buttons
  - Last job status indicator
- [ ] Create `app/components/filters/FilterForm.tsx` — create/edit form:
  - Name input
  - Source type selector (LINKEDIN, GOOGLE, GOV, APIFY_GENERIC, CUSTOM)
  - Dynamic `QueryConfigFields` component that renders different fields per source:
    - LINKEDIN: keywords, location, industry, limit
    - GOOGLE: query string, limit
    - GOV: state, business type, limit
    - APIFY_GENERIC: actor ID, raw JSON input textarea
    - CUSTOM: URL, CSS selector
  - Channel selector (EMAIL, SMS, PHONE_CALL)
  - Cron schedule input with human-readable preview below
  - AI Instructions textarea (optional, with placeholder examples)
  - Enable/disable toggle
- [ ] Install `cronstrue` for human-readable cron: `npm install cronstrue`
- [ ] Create `app/components/filters/JobHistoryTable.tsx`:
  - Columns: Started At, Status badge, Leads Found, Duration, Error (truncated)
  - Auto-refreshes every 5s when any job has `status: RUNNING`
- [ ] Create `app/(dashboard)/filters/page.tsx` — grid of `FilterCard` components
- [ ] Create `app/(dashboard)/filters/new/page.tsx` — new filter form page
- [ ] Create `app/(dashboard)/filters/[id]/edit/page.tsx` — edit form page
- [ ] Create `app/(dashboard)/filters/[id]/jobs/page.tsx` — job history page

## Technical Notes

- Use `react-hook-form` + Zod for form validation — mirror the backend DTO constraints
- Cron preview: `import cronstrue from 'cronstrue'; cronstrue.toString('0 9 * * *')` → `"At 09:00 AM"`
- "Run Now" flow: call `POST /filters/:id/run`, store returned `jobId`, poll `GET /filters/:id/jobs` until the new job status is no longer `RUNNING`
- Use `useWatch` from react-hook-form to reactively show/hide `QueryConfigFields` based on selected `sourceType`
- JSON input for APIFY_GENERIC: use a `<textarea>` with validation that parses as valid JSON on submit

## Acceptance Criteria

- [ ] Filters page shows all user filters as cards with correct metadata
- [ ] Toggling enable/disable on a card updates immediately and persists to API
- [ ] "Run Now" shows a spinner then displays the number of leads found on completion
- [ ] New filter form shows correct fields when source type is changed
- [ ] Cron schedule field shows human-readable preview beneath the input
- [ ] AI Instructions field persists and displays correctly
- [ ] Job history page shows all past jobs for a filter with status and lead count
- [ ] Edit form pre-fills all fields including dynamic query config fields
