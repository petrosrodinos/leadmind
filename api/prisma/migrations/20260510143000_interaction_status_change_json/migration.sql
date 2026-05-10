ALTER TYPE "InteractionType" ADD VALUE 'STATUS_CHANGE';

ALTER TABLE "Interaction" ADD COLUMN "status_change" JSONB;
