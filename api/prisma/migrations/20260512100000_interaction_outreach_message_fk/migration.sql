-- Wipe worker-created interactions; their content lives on OutreachMessage already.
DELETE FROM "Interaction" WHERE "metadata" ? 'outreach_message_uuid';

-- AddColumn
ALTER TABLE "Interaction" ADD COLUMN "outreach_message_uuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Interaction_outreach_message_uuid_key" ON "Interaction"("outreach_message_uuid");

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_outreach_message_uuid_fkey" FOREIGN KEY ("outreach_message_uuid") REFERENCES "OutreachMessage"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
