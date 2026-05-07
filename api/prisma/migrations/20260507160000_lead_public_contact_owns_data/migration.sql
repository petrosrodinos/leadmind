-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_user_id_fkey";

-- DropForeignKey
ALTER TABLE "ContactTag" DROP CONSTRAINT "ContactTag_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "Filter" DROP CONSTRAINT "Filter_user_id_fkey";

-- DropForeignKey
ALTER TABLE "FilterJob" DROP CONSTRAINT "FilterJob_filter_id_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "Interaction" DROP CONSTRAINT "Interaction_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_filter_id_fkey";

-- DropForeignKey
ALTER TABLE "Lead" DROP CONSTRAINT "Lead_user_id_fkey";

-- DropForeignKey
ALTER TABLE "OutreachMessage" DROP CONSTRAINT "OutreachMessage_contact_id_fkey";

-- DropForeignKey
ALTER TABLE "OutreachMessage" DROP CONSTRAINT "OutreachMessage_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "OutreachMessage" DROP CONSTRAINT "OutreachMessage_user_id_fkey";

-- DropForeignKey
ALTER TABLE "OutreachSequence" DROP CONSTRAINT "OutreachSequence_user_id_fkey";

-- DropForeignKey
ALTER TABLE "RawLead" DROP CONSTRAINT "RawLead_filter_id_fkey";

-- DropIndex
DROP INDEX "Contact_lead_id_key";

-- DropIndex
DROP INDEX "Contact_user_id_idx";

-- DropIndex
DROP INDEX "Contact_uuid_idx";

-- DropIndex
DROP INDEX "ContactTag_contact_id_idx";

-- DropIndex
DROP INDEX "ContactTag_contact_id_tag_key";

-- DropIndex
DROP INDEX "Filter_user_id_idx";

-- DropIndex
DROP INDEX "Filter_uuid_idx";

-- DropIndex
DROP INDEX "FilterJob_filter_id_idx";

-- DropIndex
DROP INDEX "Interaction_contact_id_idx";

-- DropIndex
DROP INDEX "Interaction_user_id_idx";

-- DropIndex
DROP INDEX "Lead_status_idx";

-- DropIndex
DROP INDEX "Lead_user_id_idx";

-- DropIndex
DROP INDEX "Lead_uuid_idx";

-- DropIndex
DROP INDEX "OutreachMessage_contact_id_idx";

-- DropIndex
DROP INDEX "OutreachMessage_lead_id_idx";

-- DropIndex
DROP INDEX "OutreachMessage_user_id_idx";

-- DropIndex
DROP INDEX "OutreachSequence_user_id_idx";

-- DropIndex
DROP INDEX "RawLead_filter_id_idx";

-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "company",
DROP COLUMN "email",
DROP COLUMN "first_name",
DROP COLUMN "last_name",
DROP COLUMN "lead_id",
DROP COLUMN "location",
DROP COLUMN "phone",
DROP COLUMN "title",
DROP COLUMN "user_id",
DROP COLUMN "website",
ADD COLUMN     "filter_uuid" TEXT,
ADD COLUMN     "generated_message" TEXT,
ADD COLUMN     "ideas" JSONB,
ADD COLUMN     "lead_uuid" TEXT NOT NULL,
ADD COLUMN     "score" INTEGER,
ADD COLUMN     "user_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ContactTag" DROP COLUMN "contact_id",
ADD COLUMN     "contact_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Filter" DROP COLUMN "channel",
DROP COLUMN "user_id",
ADD COLUMN     "channels" "Channel"[] DEFAULT ARRAY['EMAIL']::"Channel"[],
ADD COLUMN     "user_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FilterJob" DROP COLUMN "filter_id",
ADD COLUMN     "filter_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Interaction" DROP COLUMN "contact_id",
DROP COLUMN "user_id",
ADD COLUMN     "contact_uuid" TEXT NOT NULL,
ADD COLUMN     "user_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "filter_id",
DROP COLUMN "generated_message",
DROP COLUMN "ideas",
DROP COLUMN "message_channel",
DROP COLUMN "score",
DROP COLUMN "status",
DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "OutreachMessage" DROP COLUMN "contact_id",
DROP COLUMN "lead_id",
DROP COLUMN "user_id",
ADD COLUMN     "contact_uuid" TEXT NOT NULL,
ADD COLUMN     "user_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OutreachSequence" DROP COLUMN "user_id",
ADD COLUMN     "user_uuid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RawLead" DROP COLUMN "filter_id",
ADD COLUMN     "filter_uuid" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Contact_user_uuid_idx" ON "Contact"("user_uuid");

-- CreateIndex
CREATE INDEX "Contact_lead_uuid_idx" ON "Contact"("lead_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_user_uuid_lead_uuid_key" ON "Contact"("user_uuid", "lead_uuid");

-- CreateIndex
CREATE INDEX "ContactTag_contact_uuid_idx" ON "ContactTag"("contact_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTag_contact_uuid_tag_key" ON "ContactTag"("contact_uuid", "tag");

-- CreateIndex
CREATE INDEX "Filter_user_uuid_idx" ON "Filter"("user_uuid");

-- CreateIndex
CREATE INDEX "FilterJob_filter_uuid_idx" ON "FilterJob"("filter_uuid");

-- CreateIndex
CREATE INDEX "Interaction_contact_uuid_idx" ON "Interaction"("contact_uuid");

-- CreateIndex
CREATE INDEX "Interaction_user_uuid_idx" ON "Interaction"("user_uuid");

-- CreateIndex
CREATE INDEX "Lead_email_idx" ON "Lead"("email");

-- CreateIndex
CREATE INDEX "Lead_linkedin_url_idx" ON "Lead"("linkedin_url");

-- CreateIndex
CREATE INDEX "OutreachMessage_user_uuid_idx" ON "OutreachMessage"("user_uuid");

-- CreateIndex
CREATE INDEX "OutreachMessage_contact_uuid_idx" ON "OutreachMessage"("contact_uuid");

-- CreateIndex
CREATE INDEX "OutreachSequence_user_uuid_idx" ON "OutreachSequence"("user_uuid");

-- CreateIndex
CREATE INDEX "RawLead_filter_uuid_idx" ON "RawLead"("filter_uuid");

-- AddForeignKey
ALTER TABLE "Filter" ADD CONSTRAINT "Filter_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawLead" ADD CONSTRAINT "RawLead_filter_uuid_fkey" FOREIGN KEY ("filter_uuid") REFERENCES "Filter"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_lead_uuid_fkey" FOREIGN KEY ("lead_uuid") REFERENCES "Lead"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_filter_uuid_fkey" FOREIGN KEY ("filter_uuid") REFERENCES "Filter"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTag" ADD CONSTRAINT "ContactTag_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutreachSequence" ADD CONSTRAINT "OutreachSequence_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FilterJob" ADD CONSTRAINT "FilterJob_filter_uuid_fkey" FOREIGN KEY ("filter_uuid") REFERENCES "Filter"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
