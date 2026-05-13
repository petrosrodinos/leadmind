-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('STANDARD', 'PERSONALIZED');

-- AlterEnum
ALTER TYPE "CampaignStatus" ADD VALUE 'DRAFTS_READY';

-- AlterTable
ALTER TABLE "marketing_campaigns" ADD COLUMN     "ai_prompt" TEXT,
ADD COLUMN     "campaign_type" "CampaignType" NOT NULL DEFAULT 'STANDARD';
