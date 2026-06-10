-- CreateEnum
CREATE TYPE "ReminderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "reminders" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "contact_uuid" TEXT NOT NULL,
    "title" TEXT,
    "notes" TEXT,
    "remind_at" TIMESTAMP(3) NOT NULL,
    "status" "ReminderStatus" NOT NULL DEFAULT 'PENDING',
    "job_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reminders_uuid_key" ON "reminders"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "reminders_job_id_key" ON "reminders"("job_id");

-- CreateIndex
CREATE INDEX "reminders_user_uuid_idx" ON "reminders"("user_uuid");

-- CreateIndex
CREATE INDEX "reminders_contact_uuid_idx" ON "reminders"("contact_uuid");

-- CreateIndex
CREATE INDEX "reminders_remind_at_idx" ON "reminders"("remind_at");

-- CreateIndex
CREATE INDEX "reminders_status_idx" ON "reminders"("status");

-- CreateIndex
CREATE INDEX "reminders_user_uuid_status_idx" ON "reminders"("user_uuid", "status");

-- CreateIndex
CREATE INDEX "reminders_user_uuid_remind_at_idx" ON "reminders"("user_uuid", "remind_at");

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
