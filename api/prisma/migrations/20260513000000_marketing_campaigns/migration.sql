-- Extend MsgStatus with marketing/tracking states
ALTER TYPE "MsgStatus" ADD VALUE 'QUEUED';
ALTER TYPE "MsgStatus" ADD VALUE 'DELIVERED';
ALTER TYPE "MsgStatus" ADD VALUE 'OPENED';
ALTER TYPE "MsgStatus" ADD VALUE 'CLICKED';
ALTER TYPE "MsgStatus" ADD VALUE 'REPLIED';
ALTER TYPE "MsgStatus" ADD VALUE 'BOUNCED';
ALTER TYPE "MsgStatus" ADD VALUE 'UNSUBSCRIBED';
ALTER TYPE "MsgStatus" ADD VALUE 'SKIPPED';

-- Extend InteractionType with campaign + tracking events
ALTER TYPE "InteractionType" ADD VALUE 'CAMPAIGN_EMAIL_SENT';
ALTER TYPE "InteractionType" ADD VALUE 'CAMPAIGN_SMS_SENT';
ALTER TYPE "InteractionType" ADD VALUE 'EMAIL_DELIVERED';
ALTER TYPE "InteractionType" ADD VALUE 'SMS_DELIVERED';
ALTER TYPE "InteractionType" ADD VALUE 'EMAIL_OPENED';
ALTER TYPE "InteractionType" ADD VALUE 'LINK_CLICKED';
ALTER TYPE "InteractionType" ADD VALUE 'REPLY_RECEIVED';
ALTER TYPE "InteractionType" ADD VALUE 'EMAIL_BOUNCED';
ALTER TYPE "InteractionType" ADD VALUE 'EMAIL_FAILED';
ALTER TYPE "InteractionType" ADD VALUE 'SMS_FAILED';
ALTER TYPE "InteractionType" ADD VALUE 'UNSUBSCRIBED';

-- New enums
CREATE TYPE "MsgDirection" AS ENUM ('OUTBOUND', 'INBOUND');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'COMPLETED', 'CANCELLED', 'FAILED');
CREATE TYPE "CampaignContactStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'FAILED', 'SKIPPED', 'DELIVERED', 'OPENED', 'CLICKED', 'REPLIED', 'BOUNCED', 'UNSUBSCRIBED');

-- Contact: unsubscribe + last_interaction tracking
ALTER TABLE "Contact" ADD COLUMN "unsubscribed_at" TIMESTAMP(3);
ALTER TABLE "Contact" ADD COLUMN "unsubscribe_token" TEXT;
ALTER TABLE "Contact" ADD COLUMN "last_interaction_at" TIMESTAMP(3);
CREATE UNIQUE INDEX "Contact_unsubscribe_token_key" ON "Contact"("unsubscribe_token");
CREATE INDEX "Contact_unsubscribed_at_idx" ON "Contact"("unsubscribed_at");
CREATE INDEX "Contact_score_idx" ON "Contact"("score");
CREATE INDEX "Contact_last_interaction_at_idx" ON "Contact"("last_interaction_at");

-- Interaction: optional campaign link + extra indexes
ALTER TABLE "Interaction" ADD COLUMN "campaign_uuid" TEXT;
CREATE INDEX "Interaction_campaign_uuid_idx" ON "Interaction"("campaign_uuid");
CREATE INDEX "Interaction_type_idx" ON "Interaction"("type");
CREATE INDEX "Interaction_created_at_idx" ON "Interaction"("created_at");

-- OutreachMessage: campaign link, direction, provider id, idempotency, lifecycle timestamps
ALTER TABLE "OutreachMessage" ADD COLUMN "campaign_uuid" TEXT;
ALTER TABLE "OutreachMessage" ADD COLUMN "direction" "MsgDirection" NOT NULL DEFAULT 'OUTBOUND';
ALTER TABLE "OutreachMessage" ADD COLUMN "provider_message_id" TEXT;
ALTER TABLE "OutreachMessage" ADD COLUMN "idempotency_key" TEXT;
ALTER TABLE "OutreachMessage" ADD COLUMN "delivered_at" TIMESTAMP(3);
ALTER TABLE "OutreachMessage" ADD COLUMN "opened_at" TIMESTAMP(3);
ALTER TABLE "OutreachMessage" ADD COLUMN "clicked_at" TIMESTAMP(3);
ALTER TABLE "OutreachMessage" ADD COLUMN "replied_at" TIMESTAMP(3);
CREATE UNIQUE INDEX "OutreachMessage_idempotency_key_key" ON "OutreachMessage"("idempotency_key");
CREATE INDEX "OutreachMessage_campaign_uuid_idx" ON "OutreachMessage"("campaign_uuid");
CREATE INDEX "OutreachMessage_provider_message_id_idx" ON "OutreachMessage"("provider_message_id");
CREATE INDEX "OutreachMessage_campaign_uuid_contact_uuid_channel_idx" ON "OutreachMessage"("campaign_uuid", "contact_uuid", "channel");

-- MarketingCampaign
CREATE TABLE "marketing_campaigns" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "channels" "Channel"[] DEFAULT ARRAY['EMAIL']::"Channel"[],
    "filters_snapshot" JSONB,
    "email_subject" TEXT,
    "email_content" TEXT,
    "sms_content" TEXT,
    "sender_profile_uuid" TEXT,
    "scheduled_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "selected_contact_count" INTEGER NOT NULL DEFAULT 0,
    "total_messages" INTEGER NOT NULL DEFAULT 0,
    "queued_count" INTEGER NOT NULL DEFAULT 0,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "delivered_count" INTEGER NOT NULL DEFAULT 0,
    "opened_count" INTEGER NOT NULL DEFAULT 0,
    "clicked_count" INTEGER NOT NULL DEFAULT 0,
    "replied_count" INTEGER NOT NULL DEFAULT 0,
    "bounced_count" INTEGER NOT NULL DEFAULT 0,
    "unsubscribed_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "marketing_campaigns_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "marketing_campaigns_uuid_key" ON "marketing_campaigns"("uuid");
CREATE INDEX "marketing_campaigns_user_uuid_idx" ON "marketing_campaigns"("user_uuid");
CREATE INDEX "marketing_campaigns_status_idx" ON "marketing_campaigns"("status");
CREATE INDEX "marketing_campaigns_scheduled_at_idx" ON "marketing_campaigns"("scheduled_at");
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "marketing_campaigns" ADD CONSTRAINT "marketing_campaigns_sender_profile_uuid_fkey" FOREIGN KEY ("sender_profile_uuid") REFERENCES "sender_profiles"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;

-- MarketingCampaignContact (unique (campaign_uuid, contact_uuid, channel) is the idempotency guard)
CREATE TABLE "marketing_campaign_contacts" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "campaign_uuid" TEXT NOT NULL,
    "contact_uuid" TEXT NOT NULL,
    "channel" "Channel" NOT NULL,
    "status" "CampaignContactStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "marketing_campaign_contacts_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "marketing_campaign_contacts_uuid_key" ON "marketing_campaign_contacts"("uuid");
CREATE UNIQUE INDEX "marketing_campaign_contacts_campaign_uuid_contact_uuid_channel_key" ON "marketing_campaign_contacts"("campaign_uuid", "contact_uuid", "channel");
CREATE INDEX "marketing_campaign_contacts_campaign_uuid_idx" ON "marketing_campaign_contacts"("campaign_uuid");
CREATE INDEX "marketing_campaign_contacts_contact_uuid_idx" ON "marketing_campaign_contacts"("contact_uuid");
CREATE INDEX "marketing_campaign_contacts_status_idx" ON "marketing_campaign_contacts"("status");
CREATE INDEX "marketing_campaign_contacts_campaign_uuid_status_idx" ON "marketing_campaign_contacts"("campaign_uuid", "status");
ALTER TABLE "marketing_campaign_contacts" ADD CONSTRAINT "marketing_campaign_contacts_campaign_uuid_fkey" FOREIGN KEY ("campaign_uuid") REFERENCES "marketing_campaigns"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "marketing_campaign_contacts" ADD CONSTRAINT "marketing_campaign_contacts_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- Back-FKs from Interaction and OutreachMessage to MarketingCampaign
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_campaign_uuid_fkey" FOREIGN KEY ("campaign_uuid") REFERENCES "marketing_campaigns"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OutreachMessage" ADD CONSTRAINT "OutreachMessage_campaign_uuid_fkey" FOREIGN KEY ("campaign_uuid") REFERENCES "marketing_campaigns"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
