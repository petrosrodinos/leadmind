ALTER TABLE "marketing_campaigns" ADD COLUMN "website_visit_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "marketing_campaigns" ADD COLUMN "booking_visit_count" INTEGER NOT NULL DEFAULT 0;

ALTER TYPE "InteractionType" ADD VALUE 'WEBSITE_VISIT';
ALTER TYPE "InteractionType" ADD VALUE 'BOOKING_VISIT';
