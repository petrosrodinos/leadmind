export const ELASTICSEARCH_CLIENT = 'ELASTICSEARCH_CLIENT';
export const LEADS_INDEX = 'leads';
export const CONTACTS_INDEX = 'contacts';

export const EMBEDDING_DIMS = 1536;

const VECTOR_FIELD = {
    type: 'dense_vector',
    dims: EMBEDDING_DIMS,
    index: true,
    similarity: 'cosine',
} as const;

export const LEADS_MAPPING = {
    properties: {
        uuid: { type: 'keyword' },
        name: { type: 'text' },
        email: { type: 'keyword' },
        company: { type: 'text' },
        title: { type: 'text' },
        industry: { type: 'keyword' },
        location: { type: 'text' },
        description: { type: 'text' },
        source_type: { type: 'keyword' },
        linkedin_url: { type: 'keyword' },
        metadata: { type: 'text' },
        embedding: VECTOR_FIELD,
        created_at: { type: 'date' },
    },
} as const;

export const CONTACTS_MAPPING = {
    properties: {
        uuid: { type: 'keyword' },
        user_uuid: { type: 'keyword' },
        lead_uuid: { type: 'keyword' },
        status: { type: 'keyword' },
        score: { type: 'integer' },
        tags: { type: 'keyword' },
        name: { type: 'text' },
        email: { type: 'keyword' },
        company: { type: 'text' },
        title: { type: 'text' },
        industry: { type: 'keyword' },
        location: { type: 'text' },
        description: { type: 'text' },
        metadata: { type: 'text' },
        embedding: VECTOR_FIELD,
        created_at: { type: 'date' },
    },
} as const;
