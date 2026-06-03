ALTER TABLE "marketing_campaigns" ADD COLUMN "use_openai_batch" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "marketing_campaigns" ADD COLUMN "draft_batch_id" TEXT;
