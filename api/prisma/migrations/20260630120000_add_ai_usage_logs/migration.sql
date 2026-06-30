-- CreateEnum
CREATE TYPE "AiUsageOperation" AS ENUM ('LEAD_ENRICH', 'CONTACT_SCORE', 'CONTACT_DRAFT', 'CAMPAIGN_DRAFT', 'ENRICHMENT_SUMMARY', 'AUDIENCE_ANALYSIS', 'EMBEDDING', 'ADMIN_GENERATE', 'BATCH_JOB', 'OTHER');

-- CreateEnum
CREATE TYPE "AiUsageRequestMode" AS ENUM ('SYNC', 'BATCH', 'STREAM');

-- CreateEnum
CREATE TYPE "AiUsageStatus" AS ENUM ('SUCCESS', 'ERROR');

-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "operation" "AiUsageOperation" NOT NULL,
    "request_mode" "AiUsageRequestMode" NOT NULL DEFAULT 'SYNC',
    "status" "AiUsageStatus" NOT NULL,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "total_tokens" INTEGER,
    "input_cost_usd" DECIMAL(12,8),
    "output_cost_usd" DECIMAL(12,8),
    "total_cost_usd" DECIMAL(12,8),
    "duration_ms" INTEGER,
    "reference_type" TEXT,
    "reference_uuid" TEXT,
    "batch_id" TEXT,
    "custom_id" TEXT,
    "error_message" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE INDEX "ai_usage_logs_user_uuid_created_at_idx" ON "ai_usage_logs"("user_uuid", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_logs_user_uuid_provider_idx" ON "ai_usage_logs"("user_uuid", "provider");

-- CreateIndex
CREATE INDEX "ai_usage_logs_batch_id_idx" ON "ai_usage_logs"("batch_id");

-- AddForeignKey
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
