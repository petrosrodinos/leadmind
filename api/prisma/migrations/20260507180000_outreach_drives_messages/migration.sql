-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "generated_message",
DROP COLUMN "ideas";

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "raw_lead_uuid" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Lead_raw_lead_uuid_key" ON "Lead"("raw_lead_uuid");

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_raw_lead_uuid_fkey" FOREIGN KEY ("raw_lead_uuid") REFERENCES "RawLead"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
