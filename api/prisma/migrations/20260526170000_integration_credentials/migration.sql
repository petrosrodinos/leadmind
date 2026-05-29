DROP TABLE IF EXISTS "integration_keys";
DROP TABLE IF EXISTS "integrations";
DROP TYPE IF EXISTS "IntegrationKeyType";

CREATE TABLE "integration_credentials" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "provider" "ExternalIntegrationProvider" NOT NULL,
    "account" TEXT NOT NULL DEFAULT 'default',
    "kind" TEXT NOT NULL,
    "secret" TEXT NOT NULL,
    "last4" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_credentials_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "integration_credentials_uuid_key" ON "integration_credentials"("uuid");
CREATE INDEX "integration_credentials_user_uuid_idx" ON "integration_credentials"("user_uuid");
CREATE INDEX "integration_credentials_user_uuid_provider_idx" ON "integration_credentials"("user_uuid", "provider");
CREATE UNIQUE INDEX "integration_credentials_user_uuid_provider_account_kind_key" ON "integration_credentials"("user_uuid", "provider", "account", "kind");

ALTER TABLE "integration_credentials" ADD CONSTRAINT "integration_credentials_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
