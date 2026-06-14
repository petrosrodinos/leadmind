ALTER TABLE "Contact" ADD COLUMN "enrichment_summary" TEXT;
ALTER TABLE "Contact" ADD COLUMN "enrichment_metadata" JSONB;

CREATE TABLE "contact_enrichments" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "contact_uuid" TEXT NOT NULL,
    "source" "EnrichmentSource" NOT NULL,
    "source_url" TEXT,
    "summary" TEXT,
    "payload" JSONB,
    "cost_usd" DECIMAL(12,6),
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_enrichments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contact_enrichments_uuid_key" ON "contact_enrichments"("uuid");
CREATE INDEX "contact_enrichments_contact_uuid_idx" ON "contact_enrichments"("contact_uuid");
CREATE INDEX "contact_enrichments_contact_uuid_source_idx" ON "contact_enrichments"("contact_uuid", "source");

ALTER TABLE "contact_enrichments" ADD CONSTRAINT "contact_enrichments_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
