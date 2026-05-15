-- CreateEnum
CREATE TYPE "OpenAiBatchJobType" AS ENUM ('CONTACT_SCORE', 'LEAD_ENRICH', 'MESSAGE_CREATE');

-- CreateEnum
CREATE TYPE "OpenAiBatchStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "openai_batch_jobs" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "type" "OpenAiBatchJobType" NOT NULL,
    "status" "OpenAiBatchStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "total_requests" INTEGER NOT NULL DEFAULT 0,
    "completed_requests" INTEGER NOT NULL DEFAULT 0,
    "failed_requests" INTEGER NOT NULL DEFAULT 0,
    "input_file_id" TEXT,
    "output_file_id" TEXT,
    "error_file_id" TEXT,
    "expires_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "openai_batch_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "openai_batch_jobs_batch_id_key" ON "openai_batch_jobs"("batch_id");

-- AddForeignKey
ALTER TABLE "openai_batch_jobs" ADD CONSTRAINT "openai_batch_jobs_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
