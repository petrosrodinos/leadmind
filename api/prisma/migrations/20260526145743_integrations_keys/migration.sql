-- CreateEnum
CREATE TYPE "ExternalIntegrationProvider" AS ENUM ('OPENAI', 'ANTHROPIC', 'RESEND', 'TWILIO', 'APIFY', 'HUBSPOT');

-- CreateTable
CREATE TABLE "integrations" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "provider" "ExternalIntegrationProvider" NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_keys" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "integration_uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "last4" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_keys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integrations_uuid_key" ON "integrations"("uuid");

-- CreateIndex
CREATE INDEX "integrations_user_uuid_idx" ON "integrations"("user_uuid");

-- CreateIndex
CREATE INDEX "integrations_provider_idx" ON "integrations"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "integrations_user_uuid_provider_key" ON "integrations"("user_uuid", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "integration_keys_uuid_key" ON "integration_keys"("uuid");

-- CreateIndex
CREATE INDEX "integration_keys_integration_uuid_idx" ON "integration_keys"("integration_uuid");

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_keys" ADD CONSTRAINT "integration_keys_integration_uuid_fkey" FOREIGN KEY ("integration_uuid") REFERENCES "integrations"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
