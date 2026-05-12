-- Free-text description of the sender's company/services. Used as AI context
-- when generating outreach messages so drafts know what the user offers.
ALTER TABLE "sender_profiles" ADD COLUMN "business_description" TEXT;
