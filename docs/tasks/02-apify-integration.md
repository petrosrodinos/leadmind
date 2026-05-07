# Task: Apify Integration Module

## Objective

Build a NestJS integration module at `api/src/integrations/apify/` that provides an Apify HTTP client and source-specific adapters for LinkedIn search and Google Maps lead scraping. The module must be injectable into any other module.

> **Source types in scope:** `LINKEDIN`, `GOOGLE_MAPS` (matches the `SourceType` enum in `schema.prisma`). The `MANUAL` source does not call Apify — it's a marker for hand-entered Contacts.

## Requirements

- Use `axios` (already a dependency) to call the Apify REST API
- Each source adapter takes a `queryConfig` object and returns a normalized `NormalizedLead[]` array
- The module must read `APIFY_API_TOKEN` from the environment (add to `env.validation.ts`)
- No hard-coded actor IDs — store them in a constants file
- Apify actor runs should be synchronous (poll until complete, max 5 minutes) or use Apify webhooks (simpler: use synchronous run endpoint with `waitForFinish=300`)

## Subtasks

- [ ] Add `APIFY_API_TOKEN` to `api/src/shared/config/env/env.validation.ts` (Zod schema) and `api/.env.template`
- [ ] Create `api/src/integrations/apify/apify.constants.ts` with actor IDs:
  ```ts
  export const APIFY_ACTORS = {
    LINKEDIN_SEARCH: 'apify/linkedin-profile-scraper',
    GOOGLE_MAPS_SEARCH: 'compass/google-maps-extractor',
    GOOGLE_SEARCH: 'apify/google-search-scraper',
    GENERIC_LEAD: 'apify/website-content-crawler',
  };
  ```
- [ ] Create `api/src/integrations/apify/interfaces/apify.interfaces.ts` with:
  - `ApifyRunInput` (generic JSON)
  - `NormalizedLead` interface: `{ name?, email?, phone?, company?, website?, linkedin_url?, title?, location?, industry?, description?, raw_data: Record<string, any> }` (use snake_case keys to match the `Lead` schema)
- [ ] Create `api/src/integrations/apify/apify.client.ts` — wraps Axios, exposes:
  - `runActor(actorId: string, input: object): Promise<any[]>` — calls `POST /v2/acts/{actorId}/run-sync-get-dataset-items?token=...&waitForFinish=300`
- [ ] Create `api/src/integrations/apify/adapters/linkedin.adapter.ts` — `LinkedInAdapter`:
  - `buildInput(query_config): ApifyRunInput` — maps `{ keywords, location, industry, limit }` to Apify LinkedIn actor input format
  - `normalize(rawItem): NormalizedLead` — maps LinkedIn profile fields to `NormalizedLead`
- [ ] Create `api/src/integrations/apify/adapters/google-maps.adapter.ts` — `GoogleMapsAdapter`:
  - `buildInput(query_config): ApifyRunInput` — maps `{ query, location, limit }` to the Google Maps actor input
  - `normalize(rawItem): NormalizedLead` — maps Google Maps places to `NormalizedLead` (business name, website, phone, address → location)
- [ ] Create `api/src/integrations/apify/apify.service.ts` — `ApifyService`:
  - `scrapeLeads(source_type: SourceType, query_config: object): Promise<NormalizedLead[]>`
  - Delegates to the correct adapter based on `source_type` (`LINKEDIN` or `GOOGLE_MAPS`); throws for `MANUAL`
- [ ] Create `api/src/integrations/apify/apify.module.ts` — exports `ApifyService`
- [ ] Register `ApifyModule` in `api/src/app.module.ts`

## Technical Notes

- Apify run-sync endpoint: `POST https://api.apify.com/v2/acts/{actorId}/run-sync-get-dataset-items?token={token}&waitForFinish=300`
- Returns an array of items directly — no polling needed with `run-sync-get-dataset-items`
- If Apify returns HTTP 408 (timeout), throw `GatewayTimeoutException`
- Add retry logic: max 2 retries with 5s delay using a simple loop (no additional library)
- LinkedIn actor input shape (for `apify/linkedin-profile-scraper`):
  ```json
  { "searchUrl": "https://www.linkedin.com/search/results/people/?keywords=...", "maxResults": 50 }
  ```
- Google Maps actor input shape (`compass/google-maps-extractor`):
  ```json
  { "searchStringsArray": ["..."], "locationQuery": "...", "maxCrawledPlacesPerSearch": 50 }
  ```

## Acceptance Criteria

- [ ] `ApifyService` is injectable and exported from `ApifyModule`
- [ ] `scrapeLeads('LINKEDIN', { keywords: 'CEO', location: 'NYC', limit: 10 })` returns `NormalizedLead[]` without throwing
- [ ] `scrapeLeads('GOOGLE_MAPS', { query: 'plumbers', location: 'Athens', limit: 10 })` returns `NormalizedLead[]` without throwing
- [ ] `scrapeLeads('MANUAL', ...)` throws (or returns `[]`) — Apify is not invoked for manual filters
- [ ] `APIFY_API_TOKEN` missing from env causes app to fail startup (Zod validation)
- [ ] Each adapter's `normalize()` method filters out items with neither `email` nor `linkedin_url` (don't create empty leads)
- [ ] Unit test: mock `ApifyClient`, assert `scrapeLeads` calls correct adapter per `source_type`
