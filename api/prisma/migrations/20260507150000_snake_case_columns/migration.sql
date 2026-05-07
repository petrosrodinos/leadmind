-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_leadId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_userId_fkey";

-- DropForeignKey
ALTER TABLE "ContactTag" DROP CONSTRAINT "ContactTag_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Filter" DROP CONSTRAINT "Filter_userId_fkey";

-- DropForeignKey
ALTER TABLE "FilterJob" DROP CONSTRAINT "FilterJob_filterId_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_filterId_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_userId_fkey";

-- DropForeignKey
ALTER TABLE "OutreachMessage" DROP CONSTRAINT "OutreachMessage_contactId_fkey";

-- DropForeignKey
ALTER TABLE "OutreachMessage" DROP CONSTRAINT "OutreachMessage_leadId_fkey";

-- DropForeignKey
ALTER TABLE "OutreachMessage" DROP CONSTRAINT "OutreachMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "OutreachSequence" DROP CONSTRAINT "OutreachSequence_userId_fkey";

-- DropForeignKey
ALTER TABLE "RawLead" DROP CONSTRAINT "RawLead_filterId_fkey";

-- DropIndex
DROP INDEX "Contact_leadId_key";

-- DropIndex
DROP INDEX "Contact_userId_idx";

-- DropIndex
DROP INDEX "ContactTag_contactId_idx";

-- DropIndex
DROP INDEX "ContactTag_contactId_tag_key";

-- DropIndex
DROP INDEX "Filter_userId_idx";

-- DropIndex
DROP INDEX "FilterJob_filterId_idx";

-- DropIndex
DROP INDEX "Interaction_contactId_idx";

-- DropIndex
DROP INDEX "Interaction_userId_idx";

-- DropIndex
DROP INDEX "Lead_userId_idx";

-- DropIndex
DROP INDEX "OutreachMessage_contactId_idx";

-- DropIndex
DROP INDEX "OutreachMessage_leadId_idx";

-- DropIndex
DROP INDEX "OutreachMessage_userId_idx";

-- DropIndex
DROP INDEX "OutreachSequence_userId_idx";

-- DropIndex
DROP INDEX "RawLead_filterId_idx";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "createdAt",
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "leadId",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "first_name" TEXT,
ADD COLUMN     "last_name" TEXT,
ADD COLUMN     "lead_id" INTEGER,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ContactTag" DROP COLUMN "contactId",
DROP COLUMN "createdAt",
ADD COLUMN     "contact_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Filter" DROP COLUMN "aiInstructions",
DROP COLUMN "createdAt",
DROP COLUMN "cronSchedule",
DROP COLUMN "queryConfig",
DROP COLUMN "sourceType",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "ai_instructions" TEXT,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "cron_schedule" TEXT,
ADD COLUMN     "query_config" JSONB NOT NULL,
ADD COLUMN     "source_type" "SourceType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "FilterJob" DROP COLUMN "completedAt",
DROP COLUMN "createdAt",
DROP COLUMN "filterId",
DROP COLUMN "leadsFound",
DROP COLUMN "startedAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filter_id" INTEGER NOT NULL,
ADD COLUMN     "leads_found" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "contactId",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "contact_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "createdAt",
DROP COLUMN "enrichmentData",
DROP COLUMN "filterId",
DROP COLUMN "generatedMessage",
DROP COLUMN "linkedinUrl",
DROP COLUMN "messageChannel",
DROP COLUMN "rawData",
DROP COLUMN "sourceType",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enrichment_data" JSONB,
ADD COLUMN     "filter_id" INTEGER,
ADD COLUMN     "generated_message" TEXT,
ADD COLUMN     "linkedin_url" TEXT,
ADD COLUMN     "message_channel" "Channel",
ADD COLUMN     "raw_data" JSONB,
ADD COLUMN     "source_type" "SourceType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OutreachMessage" DROP COLUMN "contactId",
DROP COLUMN "createdAt",
DROP COLUMN "leadId",
DROP COLUMN "scheduledAt",
DROP COLUMN "sentAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "contact_id" INTEGER,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lead_id" INTEGER,
ADD COLUMN     "scheduled_at" TIMESTAMP(3),
ADD COLUMN     "sent_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OutreachSequence" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "RawLead" DROP COLUMN "createdAt",
DROP COLUMN "filterId",
DROP COLUMN "processedAt",
DROP COLUMN "rawData",
DROP COLUMN "sourceType",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "filter_id" INTEGER NOT NULL,
ADD COLUMN     "processed_at" TIMESTAMP(3),
ADD COLUMN     "raw_data" JSONB NOT NULL,
ADD COLUMN     "source_type" "SourceType" NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Contact_lead_id_key" ON "Contact"("lead_id");

-- CreateIndex
CREATE INDEX "Contact_user_id_idx" ON "Contact"("user_id");

-- CreateIndex
CREATE INDEX "ContactTag_contact_id_idx" ON "ContactTag"("contact_id");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTag_contact_id_tag_key" ON "ContactTag"("contact_id", "tag");

-- CreateIndex
CREATE INDEX "Filter_user_id_idx" ON "Filter"("user_id");

-- CreateIndex
CREATE INDEX "FilterJob_filter_id_idx" ON "FilterJob"("filter_id");

-- CreateIndex
CREATE INDEX "Interaction_contact_id_idx" ON "Interaction"("contact_id");

-- CreateIndex
CREATE INDEX "Interaction_user_id_idx" ON "Interaction"("user_id");

-- CreateIndex
CREATE INDEX "Lead_user_id_idx" ON "Lead"("user_id");

-- CreateIndex
CREATE INDEX "OutreachMessage_user_id_idx" ON "OutreachMessage"("user_id");

-- CreateIndex
CREATE INDEX "OutreachMessage_lead_id_idx" ON "OutreachMessage"("lead_id");

-- CreateIndex
CREATE INDEX "OutreachMessage_contact_id_idx" ON "OutreachMessage"("contact_id");

-- CreateIndex
CREATE INDEX "OutreachSequence_user_id_idx" ON "OutreachSequence"("user_id");

-- CreateIndex
CREATE INDEX "RawLead_filter_id_idx" ON "RawLead"("filter_id");

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawLead" ADD CONSTRAINT "RawLead_filter_id_fkey" FOREIGN KEY ("filter_id") REFERENCES "Filter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_filter_id_fkey" FOREIGN KEY ("filter_id") REFERENCES "Filter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTag" ADD CONSTRAINT "ContactTag_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachSequence" ADD CONSTRAINT "OutreachSequence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterJob" ADD CONSTRAINT "FilterJob_filter_id_fkey" FOREIGN KEY ("filter_id") REFERENCES "Filter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
