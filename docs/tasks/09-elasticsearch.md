# Task: Elasticsearch Integration & Search Module

## Objective

Integrate Elasticsearch for fast full-text search and advanced filtering of leads and contacts. Build an `elasticsearch` integration module that handles client setup, index management, document indexing, and a `search` feature module exposing search endpoints.

## Requirements

- Use the `@elastic/elasticsearch` Node.js client
- Two indices: `leads` and `contacts`
- Index is kept in sync with PostgreSQL via service calls after write operations (eventual consistency — no transaction guarantees needed)
- Search must support: full-text query (name, company, email, description), filter by status/score/sourceType/tags
- Add `ELASTICSEARCH_URL` to env validation

## Subtasks

- [ ] Install: `npm install @elastic/elasticsearch`
- [ ] Add `ELASTICSEARCH_URL` to `api/src/shared/config/env/env.validation.ts` and `.env.template`
- [ ] Create `api/src/integrations/elasticsearch/elasticsearch.module.ts` — provides `ElasticsearchClient` using `@elastic/elasticsearch` `Client`, reads `ELASTICSEARCH_URL` from config; exports the client token
- [ ] Create `api/src/integrations/elasticsearch/elasticsearch.constants.ts`:
  - `ELASTICSEARCH_CLIENT = 'ELASTICSEARCH_CLIENT'`
  - `LEADS_INDEX = 'leads'`
  - `CONTACTS_INDEX = 'contacts'`
- [ ] Create `api/src/integrations/elasticsearch/elasticsearch.service.ts` — `ElasticsearchService`:
  - `indexLead(lead: Lead): Promise<void>` — upsert into `leads` index with `id` as doc ID
  - `indexContact(contact: Contact): Promise<void>` — upsert into `contacts` index
  - `deleteLead(id: number): Promise<void>`
  - `deleteContact(id: number): Promise<void>`
  - `searchLeads(query: SearchDto): Promise<{ hits: any[], total: number }>`
  - `searchContacts(query: SearchDto): Promise<{ hits: any[], total: number }>`
- [ ] Define index mappings for `leads`:
  ```json
  {
    "mappings": {
      "properties": {
        "name": { "type": "text" },
        "email": { "type": "keyword" },
        "company": { "type": "text" },
        "title": { "type": "text" },
        "description": { "type": "text" },
        "status": { "type": "keyword" },
        "score": { "type": "integer" },
        "sourceType": { "type": "keyword" },
        "userId": { "type": "integer" },
        "createdAt": { "type": "date" }
      }
    }
  }
  ```
- [ ] Create an `OnModuleInit` hook in `ElasticsearchService` that calls `client.indices.create` if index doesn't exist (use `client.indices.exists` check first)
- [ ] Create `api/src/modules/search/dto/search.dto.ts`:
  - `q?: string` (full-text query)
  - `status?: LeadStatus | string`
  - `minScore?: number`
  - `sourceType?: string`
  - `tags?: string` (comma-separated for contacts)
  - `page?: number`, `limit?: number`
- [ ] Create `api/src/modules/search/search.service.ts` — delegates to `ElasticsearchService`
- [ ] Create `api/src/modules/search/search.controller.ts`:
  - `GET /search/leads` — `searchLeads`
  - `GET /search/contacts` — `searchContacts`
- [ ] Update `LeadsService` to call `elasticsearchService.indexLead()` after create/update and `deleteLead()` after remove
- [ ] Update `ContactsService` to call `elasticsearchService.indexContact()` / `deleteContact()` similarly
- [ ] Register `ElasticsearchModule` in `app.module.ts`; register `SearchModule`

## Technical Notes

- Upsert via: `client.index({ index: LEADS_INDEX, id: String(lead.id), document: { ...flattenedLead } })`
- ES query structure for `searchLeads`:
  ```js
  {
    query: {
      bool: {
        must: q ? [{ multi_match: { query: q, fields: ['name', 'company', 'description', 'title'] } }] : [{ match_all: {} }],
        filter: [
          ...(status ? [{ term: { status } }] : []),
          ...(userId ? [{ term: { userId } }] : []),
          ...(minScore ? [{ range: { score: { gte: minScore } } }] : []),
        ]
      }
    },
    from: (page - 1) * limit,
    size: limit
  }
  ```
- If Elasticsearch is unavailable at startup, log a warning but do NOT crash the app — make `ELASTICSEARCH_URL` optional with a fallback that disables ES features
- The `search` endpoints fall back to Prisma `findMany` when ES is disabled

## Acceptance Criteria

- [ ] `GET /search/leads?q=startup&minScore=7` returns matched leads from Elasticsearch
- [ ] Creating a new lead via the scrape worker triggers `indexLead()` in ES
- [ ] Deleting a lead removes its ES document
- [ ] Leads index is auto-created on app startup if it doesn't exist
- [ ] App starts successfully even when `ELASTICSEARCH_URL` is not set (ES disabled, fallback to Prisma)
- [ ] `GET /search/contacts?q=john&status=QUALIFIED` returns filtered contacts
