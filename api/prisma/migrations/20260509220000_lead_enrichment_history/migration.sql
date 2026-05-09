CREATE TABLE "lead_enrichments" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "lead_uuid" TEXT NOT NULL,
    "source" "EnrichmentSource" NOT NULL,
    "source_url" TEXT,
    "summary" TEXT,
    "payload" JSONB,
    "cost_usd" DECIMAL(12,6),
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lead_enrichments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "lead_enrichments_uuid_key" ON "lead_enrichments"("uuid");

CREATE INDEX "lead_enrichments_lead_uuid_idx" ON "lead_enrichments"("lead_uuid");

CREATE INDEX "lead_enrichments_lead_uuid_source_idx" ON "lead_enrichments"("lead_uuid", "source");

ALTER TABLE "lead_enrichments" ADD CONSTRAINT "lead_enrichments_lead_uuid_fkey" FOREIGN KEY ("lead_uuid") REFERENCES "Lead"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lead" DROP COLUMN "enrichment_data";

ALTER TABLE "Lead" ADD COLUMN "enrichment_summary" TEXT;
