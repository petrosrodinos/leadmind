-- CreateEnum
CREATE TYPE "ApifyUsageOperation" AS ENUM ('FILTER_SCRAPE', 'ENRICHMENT_LINKEDIN', 'ENRICHMENT_WEBSITE', 'ENRICHMENT_GOOGLE_SEARCH', 'CONTACT_EMAIL_SCRAPE', 'AI_WEBSITE_CONTEXT', 'OTHER');

-- CreateEnum
CREATE TYPE "ApifyUsageStatus" AS ENUM ('SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "apify_usage_logs" (
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "operation" "ApifyUsageOperation" NOT NULL,
    "status" "ApifyUsageStatus" NOT NULL,
    "result_count" INTEGER,
    "duration_ms" INTEGER,
    "compute_units" DECIMAL(12,6),
    "total_cost_usd" DECIMAL(12,8),
    "run_id" TEXT,
    "reference_type" TEXT,
    "reference_uuid" TEXT,
    "error_message" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "apify_usage_logs_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "apify_usage_logs_user_uuid_created_at_idx" ON "apify_usage_logs"("user_uuid", "created_at");

-- CreateIndex
CREATE INDEX "apify_usage_logs_user_uuid_operation_idx" ON "apify_usage_logs"("user_uuid", "operation");

-- CreateIndex
CREATE INDEX "apify_usage_logs_user_uuid_actor_id_idx" ON "apify_usage_logs"("user_uuid", "actor_id");

-- CreateIndex
CREATE INDEX "apify_usage_logs_run_id_idx" ON "apify_usage_logs"("run_id");

-- AddForeignKey
ALTER TABLE "apify_usage_logs" ADD CONSTRAINT "apify_usage_logs_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
