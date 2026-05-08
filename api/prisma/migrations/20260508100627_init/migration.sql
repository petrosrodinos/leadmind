-- CreateEnum
CREATE TYPE "JobTrigger" AS ENUM ('MANUAL', 'SCHEDULED');

-- AlterEnum
ALTER TYPE "Channel" ADD VALUE 'PHONE_CALL';

-- AlterTable
ALTER TABLE "FilterJob" ADD COLUMN     "trigger" "JobTrigger" NOT NULL DEFAULT 'SCHEDULED';
