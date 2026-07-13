CREATE TABLE "message_templates" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channels" "Channel"[] DEFAULT ARRAY['EMAIL']::"Channel"[],
    "email_subject" TEXT,
    "email_content" TEXT,
    "sms_content" TEXT,
    "source_campaign_uuid" TEXT,
    "source_message_uuid" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_templates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "message_templates_uuid_key" ON "message_templates"("uuid");
CREATE INDEX "message_templates_user_uuid_idx" ON "message_templates"("user_uuid");

ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
