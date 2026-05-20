ALTER TABLE "MarketingCampaign" ADD COLUMN "website_visit_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "MarketingCampaign" ADD COLUMN "booking_visit_count" INTEGER NOT NULL DEFAULT 0;

ALTER TYPE "InteractionType" ADD VALUE 'WEBSITE_VISIT';
ALTER TYPE "InteractionType" ADD VALUE 'BOOKING_VISIT';
