CREATE TYPE "ContactAudienceAnalysisScope" AS ENUM ('FILTER', 'LIST');

CREATE TYPE "ContactAudienceAnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

CREATE TABLE "contact_audience_analyses" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "scope" "ContactAudienceAnalysisScope" NOT NULL,
    "filter_uuid" TEXT,
    "contact_list_uuid" TEXT,
    "audience_name" TEXT NOT NULL,
    "stats_snapshot" JSONB NOT NULL,
    "analysis" JSONB NOT NULL DEFAULT '{}',
    "status" "ContactAudienceAnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "cost_usd" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_audience_analyses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contact_audience_analyses_uuid_key" ON "contact_audience_analyses"("uuid");

CREATE INDEX "contact_audience_analyses_user_uuid_idx" ON "contact_audience_analyses"("user_uuid");

CREATE INDEX "contact_audience_analyses_filter_uuid_idx" ON "contact_audience_analyses"("filter_uuid");

CREATE INDEX "contact_audience_analyses_contact_list_uuid_idx" ON "contact_audience_analyses"("contact_list_uuid");

CREATE INDEX "contact_audience_analyses_scope_idx" ON "contact_audience_analyses"("scope");

ALTER TABLE "contact_audience_analyses" ADD CONSTRAINT "contact_audience_analyses_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_audience_analyses" ADD CONSTRAINT "contact_audience_analyses_filter_uuid_fkey" FOREIGN KEY ("filter_uuid") REFERENCES "Filter"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "contact_audience_analyses" ADD CONSTRAINT "contact_audience_analyses_contact_list_uuid_fkey" FOREIGN KEY ("contact_list_uuid") REFERENCES "contact_lists"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
