CREATE TYPE "EnrichmentSource" AS ENUM ('LINKEDIN', 'WEBSITE', 'GOOGLE_SEARCH', 'AI');

ALTER TABLE "Filter" ADD COLUMN "enrichment_sources" "EnrichmentSource"[] NOT NULL DEFAULT ARRAY['LINKEDIN', 'WEBSITE', 'GOOGLE_SEARCH', 'AI']::"EnrichmentSource"[];
