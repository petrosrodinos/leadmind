ALTER TABLE "OutreachMessage"
ADD COLUMN "email_provider" "ExternalIntegrationProvider",
ADD COLUMN "email_account" TEXT,
ADD COLUMN "sms_provider" TEXT;

CREATE INDEX "OutreachMessage_email_provider_idx" ON "OutreachMessage"("email_provider");

UPDATE "OutreachMessage"
SET
  "email_provider" = (metadata->>'email_provider')::"ExternalIntegrationProvider",
  "email_account" = metadata->>'email_account',
  "sms_provider" = metadata->>'sms_provider'
WHERE metadata IS NOT NULL;
