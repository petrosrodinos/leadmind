DROP TABLE IF EXISTS "integration_credentials";

DROP TYPE IF EXISTS "IntegrationKeyType";

CREATE TYPE "IntegrationKeyType" AS ENUM (
    'API_KEY',
    'WEBHOOK_SECRET',
    'ACCOUNT_SID',
    'AUTH_TOKEN',
    'ACCESS_TOKEN'
);

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

CREATE TABLE "integration_keys" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "integration_uuid" TEXT NOT NULL,
    "key_type" "IntegrationKeyType" NOT NULL,
    "account" TEXT NOT NULL DEFAULT '1',
    "secret" TEXT NOT NULL,
    "last4" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_keys_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "integrations_uuid_key" ON "integrations"("uuid");
CREATE INDEX "integrations_user_uuid_idx" ON "integrations"("user_uuid");
CREATE INDEX "integrations_provider_idx" ON "integrations"("provider");
CREATE UNIQUE INDEX "integrations_user_uuid_provider_key" ON "integrations"("user_uuid", "provider");

CREATE UNIQUE INDEX "integration_keys_uuid_key" ON "integration_keys"("uuid");
CREATE INDEX "integration_keys_integration_uuid_idx" ON "integration_keys"("integration_uuid");
CREATE UNIQUE INDEX "integration_keys_integration_uuid_key_type_account_key" ON "integration_keys"("integration_uuid", "key_type", "account");

ALTER TABLE "integrations" ADD CONSTRAINT "integrations_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "integration_keys" ADD CONSTRAINT "integration_keys_integration_uuid_fkey" FOREIGN KEY ("integration_uuid") REFERENCES "integrations"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
