DELETE FROM "integration_keys";

CREATE TYPE "IntegrationKeyType" AS ENUM ('API_KEY', 'WEBHOOK_SECRET', 'ACCOUNT_SID', 'AUTH_TOKEN', 'ACCESS_TOKEN');

ALTER TABLE "integration_keys" DROP COLUMN "title",
ADD COLUMN "key_type" "IntegrationKeyType" NOT NULL,
ADD COLUMN "slot" INTEGER NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX "integration_keys_integration_uuid_key_type_slot_key" ON "integration_keys"("integration_uuid", "key_type", "slot");
