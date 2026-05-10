ALTER TABLE "Filter" ADD COLUMN "scoring_instructions" TEXT;
ALTER TABLE "Filter" ADD COLUMN "outreach_instructions" TEXT;

UPDATE "Filter" SET "scoring_instructions" = "ai_instructions", "outreach_instructions" = "ai_instructions" WHERE "ai_instructions" IS NOT NULL;

ALTER TABLE "Filter" DROP COLUMN "ai_instructions";
