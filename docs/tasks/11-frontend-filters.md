# Task: Frontend — Filters Management UI

## Objective

Build the filters management interface in the frontend (`app/`): a list of configured filters with their status, a form to create/edit filters (with source-specific query config fields and **multi-channel** selection), manual run trigger, and a job history view per filter.

## Domain reminder

- A filter has **`channels: Channel[]`** — pick one or more from `EMAIL | SMS | LINKEDIN`. The form uses a multi-select; default is `[EMAIL]`.
- Resource lookups use `uuid` in URLs (`/filters/:uuid/...`).

## Requirements

- Form fields adapt dynamically based on selected `source_type`
- Cron schedule field has a human-readable preview (e.g., "Every day at 9:00 AM")
- Enable/disable toggle updates the filter and shows current state
- Manual run button shows spinner while the job is pending, then shows result
- Job history table per filter with status badges
- Channel selector is **multi-select**; submitting requires at least one channel

## Subtasks

- [ ] Create `app/src/features/filters/services/filters.service.ts` — typed API wrappers for all filter endpoints
- [ ] Create `app/src/features/filters/interfaces/filter.interface.ts` — TypeScript types: `Filter` (with `channels: Channel[]`), `FilterJob`
- [ ] Create `app/src/pages/dashboard/pages/filters/components/filter-card.tsx`:
  - Filter name, source type badge
  - **Channel chips** — one chip per channel in `filter.channels`
  - Enabled/disabled toggle (calls `PUT /filters/:uuid`)
  - Cron schedule in human-readable format
  - "Run Now" button → calls `POST /filters/:uuid/run`, shows spinner
  - "Edit" and "Delete" buttons
  - Last job status indicator
- [ ] Create `app/src/pages/dashboard/pages/filters/components/filter-form.tsx`:
  - Name input
  - Source type selector (`LINKEDIN`, `GOOGLE_MAPS`, `MANUAL`)
  - Dynamic `QueryConfigFields` rendered per source:
    - LINKEDIN: keywords, location, industry, limit
    - GOOGLE_MAPS: query string, location, limit
    - MANUAL: no query config (filter exists only for grouping manually-created contacts)
  - **Channels multi-select** (chips/tags input or shadcn `MultiSelect`) — at least one required
  - Cron schedule input with human-readable preview below (hidden when source_type is `MANUAL`)
  - AI Instructions textarea (optional)
  - Enable/disable toggle
- [ ] Install `cronstrue` for human-readable cron: `npm install cronstrue`
- [ ] Create `app/src/pages/dashboard/pages/filters/components/job-history-table.tsx`:
  - Columns: Started At, Status badge, Leads Found, Duration, Error (truncated)
  - Auto-refreshes every 5s when any job has `status: RUNNING`
- [ ] Create `app/src/pages/dashboard/pages/filters/index.tsx` — grid of `FilterCard` components
- [ ] Create `app/src/pages/dashboard/pages/filters/pages/new/index.tsx` — new filter form page
- [ ] Create `app/src/pages/dashboard/pages/filters/pages/edit/index.tsx` — edit form page (uses `:uuid` route param)
- [ ] Create `app/src/pages/dashboard/pages/filters/pages/jobs/index.tsx` — job history page (uses `:uuid` route param)

## Technical Notes

- Use `react-hook-form` + Zod for form validation; the Zod schema for `channels` is `z.array(z.enum(['EMAIL', 'SMS', 'LINKEDIN'])).min(1)`
- Cron preview: `import cronstrue from 'cronstrue'; cronstrue.toString('0 9 * * *')` → `"At 09:00 AM"`
- "Run Now" flow: call `POST /filters/:uuid/run`, store returned `jobId`, poll `GET /filters/:uuid/jobs` until the new job status is no longer `RUNNING`
- Use `useWatch` from react-hook-form to reactively show/hide `QueryConfigFields` based on selected `source_type`
- Channel multi-select: render selected channels as removable chips; clicking a non-selected option adds it

## Acceptance Criteria

- [ ] Filters page shows all user filters as cards with channel chips for every channel in the array
- [ ] Toggling enable/disable on a card updates immediately and persists to API
- [ ] "Run Now" shows a spinner then displays the number of leads found on completion
- [ ] New filter form shows correct fields when source type is changed
- [ ] Channels multi-select: selecting `EMAIL` and `SMS` saves both; submitting with zero channels shows a validation error
- [ ] Cron schedule field shows human-readable preview beneath the input
- [ ] AI Instructions field persists and displays correctly
- [ ] Job history page shows all past jobs for a filter with status and lead count
- [ ] Edit form pre-fills all fields including the channels multi-select with the current array
