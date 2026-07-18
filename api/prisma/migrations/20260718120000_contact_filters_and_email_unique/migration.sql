CREATE TABLE IF NOT EXISTS "contact_filters" (
    "contact_uuid" TEXT NOT NULL,
    "filter_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_filters_pkey" PRIMARY KEY ("contact_uuid","filter_uuid")
);

CREATE INDEX IF NOT EXISTS "contact_filters_filter_uuid_idx" ON "contact_filters"("filter_uuid");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'contact_filters_contact_uuid_fkey'
    ) THEN
        ALTER TABLE "contact_filters"
            ADD CONSTRAINT "contact_filters_contact_uuid_fkey"
            FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'contact_filters_filter_uuid_fkey'
    ) THEN
        ALTER TABLE "contact_filters"
            ADD CONSTRAINT "contact_filters_filter_uuid_fkey"
            FOREIGN KEY ("filter_uuid") REFERENCES "Filter"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

INSERT INTO "contact_filters" ("contact_uuid", "filter_uuid", "created_at")
SELECT "uuid", "filter_uuid", "created_at"
FROM "Contact"
WHERE "filter_uuid" IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE TEMP TABLE "_contact_email_keep" AS
SELECT DISTINCT ON ("user_uuid", lower("email"))
    "uuid" AS keep_uuid,
    "user_uuid",
    lower("email") AS email_key
FROM "Contact"
WHERE "email" IS NOT NULL
ORDER BY "user_uuid", lower("email"), "created_at" ASC, "uuid" ASC;

CREATE TEMP TABLE "_contact_email_dupes" AS
SELECT c."uuid" AS dupe_uuid, k.keep_uuid
FROM "Contact" c
INNER JOIN "_contact_email_keep" k
    ON c."user_uuid" = k."user_uuid"
   AND lower(c."email") = k.email_key
WHERE c."email" IS NOT NULL
  AND c."uuid" <> k.keep_uuid;

UPDATE "Contact" AS keep
SET "filter_uuid" = dupe."filter_uuid"
FROM "_contact_email_dupes" d
INNER JOIN "Contact" AS dupe ON dupe."uuid" = d.dupe_uuid
WHERE keep."uuid" = d.keep_uuid
  AND keep."filter_uuid" IS NULL
  AND dupe."filter_uuid" IS NOT NULL;

INSERT INTO "contact_filters" ("contact_uuid", "filter_uuid", "created_at")
SELECT d.keep_uuid, cf."filter_uuid", cf."created_at"
FROM "contact_filters" cf
INNER JOIN "_contact_email_dupes" d ON cf."contact_uuid" = d.dupe_uuid
ON CONFLICT DO NOTHING;

INSERT INTO "contact_filters" ("contact_uuid", "filter_uuid", "created_at")
SELECT d.keep_uuid, dupe."filter_uuid", dupe."created_at"
FROM "_contact_email_dupes" d
INNER JOIN "Contact" dupe ON dupe."uuid" = d.dupe_uuid
WHERE dupe."filter_uuid" IS NOT NULL
ON CONFLICT DO NOTHING;

DELETE FROM "contact_filters"
WHERE "contact_uuid" IN (SELECT dupe_uuid FROM "_contact_email_dupes");

INSERT INTO "ContactTag" ("contact_uuid", "tag", "created_at")
SELECT d.keep_uuid, t."tag", t."created_at"
FROM "ContactTag" t
INNER JOIN "_contact_email_dupes" d ON t."contact_uuid" = d.dupe_uuid
ON CONFLICT ("contact_uuid", "tag") DO NOTHING;

DELETE FROM "ContactTag"
WHERE "contact_uuid" IN (SELECT dupe_uuid FROM "_contact_email_dupes");

INSERT INTO "contact_scores" ("contact_uuid", "scoring_instruction_uuid", "score", "updated_at")
SELECT d.keep_uuid, s."scoring_instruction_uuid", s."score", s."updated_at"
FROM "contact_scores" s
INNER JOIN "_contact_email_dupes" d ON s."contact_uuid" = d.dupe_uuid
ON CONFLICT ("contact_uuid", "scoring_instruction_uuid") DO NOTHING;

DELETE FROM "contact_scores"
WHERE "contact_uuid" IN (SELECT dupe_uuid FROM "_contact_email_dupes");

INSERT INTO "contact_list_members" ("uuid", "list_uuid", "contact_uuid", "created_at")
SELECT gen_random_uuid()::text, m."list_uuid", d.keep_uuid, m."created_at"
FROM "contact_list_members" m
INNER JOIN "_contact_email_dupes" d ON m."contact_uuid" = d.dupe_uuid
ON CONFLICT ("list_uuid", "contact_uuid") DO NOTHING;

DELETE FROM "contact_list_members"
WHERE "contact_uuid" IN (SELECT dupe_uuid FROM "_contact_email_dupes");

INSERT INTO "marketing_campaign_contacts" (
    "uuid", "campaign_uuid", "contact_uuid", "channel", "status", "error_message", "sent_at", "delivered_at", "created_at", "updated_at"
)
SELECT
    gen_random_uuid()::text,
    m."campaign_uuid",
    d.keep_uuid,
    m."channel",
    m."status",
    m."error_message",
    m."sent_at",
    m."delivered_at",
    m."created_at",
    m."updated_at"
FROM "marketing_campaign_contacts" m
INNER JOIN "_contact_email_dupes" d ON m."contact_uuid" = d.dupe_uuid
ON CONFLICT ("campaign_uuid", "contact_uuid", "channel") DO NOTHING;

DELETE FROM "marketing_campaign_contacts"
WHERE "contact_uuid" IN (SELECT dupe_uuid FROM "_contact_email_dupes");

UPDATE "Interaction"
SET "contact_uuid" = d.keep_uuid
FROM "_contact_email_dupes" d
WHERE "Interaction"."contact_uuid" = d.dupe_uuid;

UPDATE "OutreachMessage"
SET "contact_uuid" = d.keep_uuid
FROM "_contact_email_dupes" d
WHERE "OutreachMessage"."contact_uuid" = d.dupe_uuid;

UPDATE "reminders"
SET "contact_uuid" = d.keep_uuid
FROM "_contact_email_dupes" d
WHERE "reminders"."contact_uuid" = d.dupe_uuid;

UPDATE "form_completions"
SET "contact_uuid" = d.keep_uuid
FROM "_contact_email_dupes" d
WHERE "form_completions"."contact_uuid" = d.dupe_uuid;

UPDATE "contact_enrichments"
SET "contact_uuid" = d.keep_uuid
FROM "_contact_email_dupes" d
WHERE "contact_enrichments"."contact_uuid" = d.dupe_uuid;

DELETE FROM "Contact"
WHERE "uuid" IN (SELECT dupe_uuid FROM "_contact_email_dupes");

DROP TABLE "_contact_email_dupes";
DROP TABLE "_contact_email_keep";

INSERT INTO "contact_filters" ("contact_uuid", "filter_uuid", "created_at")
SELECT "uuid", "filter_uuid", "created_at"
FROM "Contact"
WHERE "filter_uuid" IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE UNIQUE INDEX IF NOT EXISTS "contact_user_email_unique"
ON "Contact" ("user_uuid", lower("email"))
WHERE "email" IS NOT NULL;
