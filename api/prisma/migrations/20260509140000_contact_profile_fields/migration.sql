ALTER TABLE "Contact" ADD COLUMN "name" TEXT;
ALTER TABLE "Contact" ADD COLUMN "email" TEXT;
ALTER TABLE "Contact" ADD COLUMN "phone" TEXT;
ALTER TABLE "Contact" ADD COLUMN "company" TEXT;
ALTER TABLE "Contact" ADD COLUMN "website" TEXT;
ALTER TABLE "Contact" ADD COLUMN "linkedin_url" TEXT;
ALTER TABLE "Contact" ADD COLUMN "title" TEXT;
ALTER TABLE "Contact" ADD COLUMN "location" TEXT;
ALTER TABLE "Contact" ADD COLUMN "industry" TEXT;
ALTER TABLE "Contact" ADD COLUMN "description" TEXT;

UPDATE "Contact" AS c
SET
    name = l.name,
    email = l.email,
    phone = l.phone,
    company = l.company,
    website = l.website,
    linkedin_url = l.linkedin_url,
    title = l.title,
    location = l.location,
    industry = l.industry,
    description = l.description
FROM "Lead" AS l
WHERE c.lead_uuid = l.uuid;

CREATE INDEX "Contact_email_idx" ON "Contact"("email");
