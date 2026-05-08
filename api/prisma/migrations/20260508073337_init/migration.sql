-- AlterEnum
ALTER TYPE "SourceType" ADD VALUE 'GEMI';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';
