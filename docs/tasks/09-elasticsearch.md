# Task: Elasticsearch Integration & Search Module

## Objective

Integrate Elasticsearch for fast full-text search and advanced filtering. Index two datasets:

- **`leads`** — public Lead records (no per-user data, shared index)
- **`contacts`** — per-user Contact records (filtered by `user_uuid` at query time, joined with Lead fields for searchability)

Build an `elasticsearch` integration module (client setup, index management, indexing) and a `search` feature module exposing search endpoints.

## Domain reminder

- Searching the **public Lead directory** is unscoped — every authenticated user sees the same results.
- Searching **Contacts** is scoped to `user_uuid` from JWT — never expose another user's contacts.
- A Contact document in ES should denormalize fields from its linked Lead (name, email, company, etc.) so a single query covers both the user's per-contact state (status, score, tags) and the lead's public attributes.

## Requirements

- Use the `@elastic/elasticsearch` Node.js client
- Two indices: `leads` (public) and `contacts` (per-user, denormalized with lead fields)
- Index is kept in sync with PostgreSQL via service calls after write operations (eventual consistency — no transaction guarantees needed)
- Lead search: full-text on name/company/email/description; filter by source_type
- Contact search: full-text on name/company/email/description (from denormalized lead fields); filter by status/score/tags; **always filtered by `user_uuid`**
- Add `ELASTICSEARCH_URL` to env validation; missing env disables ES and falls back to Prisma

## Subtasks

- [ ] Install: `npm install @elastic/elasticsearch`
- [ ] Add `ELASTICSEARCH_URL` to `api/src/shared/config/env/env.validation.ts` (Zod schema) and `api/.env.template`
- [ ] Create `api/src/integrations/elasticsearch/elasticsearch.module.ts` — provides `ElasticsearchClient` using `@elastic/elasticsearch` `Client`, reads `ELASTICSEARCH_URL` from config; exports the client token
- [ ] Create `api/src/integrations/elasticsearch/elasticsearch.constants.ts`:
  - `ELASTICSEARCH_CLIENT = 'ELASTICSEARCH_CLIENT'`
  - `LEADS_INDEX = 'leads'`
  - `CONTACTS_INDEX = 'contacts'`
- [ ] Create `api/src/integrations/elasticsearch/elasticsearch.service.ts` — `ElasticsearchService`:
  - `indexLead(lead: Lead): Promise<void>` — upsert into `leads` index with `lead.uuid` as doc ID
  - `indexContact(contact: Contact & { lead: Lead, tags: ContactTag[] }): Promise<void>` — upsert into `contacts` index with `contact.uuid` as doc ID; flatten lead fields into the document
  - `deleteLead(uuid: string): Promise<void>`
  - `deleteContact(uuid: string): Promise<void>`
  - `searchLeads(query: SearchDto): Promise<{ hits: any[], total: number }>`
  - `searchContacts(userUuid: string, query: SearchDto): Promise<{ hits: any[], total: number }>` — always adds `user_uuid` filter
- [ ] Define index mappings:
  - `leads`:
    ```json
    {
      "mappings": {
        "properties": {
          "uuid": { "type": "keyword" },
          "name": { "type": "text" },
          "email": { "type": "keyword" },
          "company": { "type": "text" },
          "title": { "type": "text" },
          "description": { "type": "text" },
          "source_type": { "type": "keyword" },
          "linkedin_url": { "type": "keyword" },
          "created_at": { "type": "date" }
        }
      }
    }
    ```
  - `contacts` (denormalized — per-user state + lead fields):
    ```json
    {
      "mappings": {
        "properties": {
          "uuid": { "type": "keyword" },
          "user_uuid": { "type": "keyword" },
          "lead_uuid": { "type": "keyword" },
          "status": { "type": "keyword" },
          "score": { "type": "integer" },
          "tags": { "type": "keyword" },
          "name": { "type": "text" },
          "email": { "type": "keyword" },
          "company": { "type": "text" },
          "title": { "type": "text" },
          "description": { "type": "text" },
          "created_at": { "type": "date" }
        }
      }
    }
    ```
- [ ] Create an `OnModuleInit` hook in `ElasticsearchService` that calls `client.indices.create` if index doesn't exist (use `client.indices.exists` check first)
- [ ] Create `api/src/modules/search/dto/search.dto.ts`:
  - `q?: string` (full-text query)
  - `status?: LeadStatus` (contacts only)
  - `min_score?: number` (contacts only)
  - `source_type?: string`
  - `tags?: string` (comma-separated, contacts only)
  - `page?: number`, `limit?: number`
- [ ] Create `api/src/modules/search/search.service.ts` — delegates to `ElasticsearchService`
- [ ] Create `api/src/modules/search/search.controller.ts`:
  - `GET /search/leads` — public Lead search (no user scope)
  - `GET /search/contacts` — Contact search, scoped to JWT `user_uuid`
- [ ] Update `LeadsService` to call `elasticsearchService.indexLead()` after the scrape worker creates/updates a Lead, and `deleteLead()` if a Lead is removed
- [ ] Update `ContactsService` to call `elasticsearchService.indexContact()` / `deleteContact()` after writes (also re-index when the underlying Lead is updated, so denormalized fields stay fresh)
- [ ] Register `ElasticsearchModule` in `app.module.ts`; register `SearchModule`

## Technical Notes

- Upsert: `client.index({ index: LEADS_INDEX, id: lead.uuid, document: { ...flattened } })`
- ES contact query (with mandatory `user_uuid` filter):
  ```js
  {
    query: {
      bool: {
        must: q ? [{ multi_match: { query: q, fields: ['name', 'company', 'description', 'title'] } }] : [{ match_all: {} }],
        filter: [
          { term: { user_uuid } },                      // ALWAYS present
          ...(status ? [{ term: { status } }] : []),
          ...(min_score ? [{ range: { score: { gte: min_score } } }] : []),
          ...(tags ? [{ terms: { tags: tagsArray } }] : []),
        ]
      }
    },
    from: (page - 1) * limit,
    size: limit
  }
  ```
- If Elasticsearch is unavailable at startup, log a warning but do NOT crash the app — make `ELASTICSEARCH_URL` optional with a fallback that disables ES features
- The `search` endpoints fall back to Prisma `findMany` when ES is disabled
- Re-indexing on Lead update: enqueue a background task that finds all Contacts pointing to that Lead and re-indexes them so denormalized fields stay current. Acceptable to do this synchronously in the request handler for now; convert to a queue if it becomes slow.

## Acceptance Criteria

- [ ] `GET /search/leads?q=startup&source_type=LINKEDIN` returns matched public Leads from Elasticsearch
- [ ] `GET /search/contacts?q=john&status=NEW&min_score=7` returns the **current user's** matched Contacts
- [ ] A user cannot retrieve another user's Contacts via search (always filtered by JWT `user_uuid`)
- [ ] Creating a new Lead via the scrape worker triggers `indexLead()` in ES
- [ ] Creating a new Contact triggers `indexContact()` with denormalized Lead fields
- [ ] Deleting a Lead removes its ES document; deleting a Contact removes its ES document
- [ ] Both indices are auto-created on app startup if they don't exist
- [ ] App starts successfully even when `ELASTICSEARCH_URL` is not set (ES disabled, fallback to Prisma)
