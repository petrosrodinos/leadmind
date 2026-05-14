CREATE TABLE "scoring_instructions" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scoring_instructions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scoring_instructions_uuid_key" ON "scoring_instructions"("uuid");
CREATE INDEX "scoring_instructions_user_uuid_idx" ON "scoring_instructions"("user_uuid");
ALTER TABLE "scoring_instructions" ADD CONSTRAINT "scoring_instructions_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "filter_scoring_instructions" (
    "filter_uuid" TEXT NOT NULL,
    "scoring_instruction_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "filter_scoring_instructions_pkey" PRIMARY KEY ("filter_uuid","scoring_instruction_uuid")
);

ALTER TABLE "filter_scoring_instructions" ADD CONSTRAINT "filter_scoring_instructions_filter_uuid_fkey" FOREIGN KEY ("filter_uuid") REFERENCES "Filter"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "filter_scoring_instructions" ADD CONSTRAINT "filter_scoring_instructions_scoring_instruction_uuid_fkey" FOREIGN KEY ("scoring_instruction_uuid") REFERENCES "scoring_instructions"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "contact_scores" (
    "id" SERIAL NOT NULL,
    "contact_uuid" TEXT NOT NULL,
    "scoring_instruction_uuid" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_scores_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "contact_scores_contact_uuid_scoring_instruction_uuid_key" ON "contact_scores"("contact_uuid", "scoring_instruction_uuid");
CREATE INDEX "contact_scores_contact_uuid_idx" ON "contact_scores"("contact_uuid");
CREATE INDEX "contact_scores_scoring_instruction_uuid_idx" ON "contact_scores"("scoring_instruction_uuid");
ALTER TABLE "contact_scores" ADD CONSTRAINT "contact_scores_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "contact_scores" ADD CONSTRAINT "contact_scores_scoring_instruction_uuid_fkey" FOREIGN KEY ("scoring_instruction_uuid") REFERENCES "scoring_instructions"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "Contact_score_idx";
ALTER TABLE "Filter" DROP COLUMN IF EXISTS "scoring_instructions";
ALTER TABLE "Contact" DROP COLUMN IF EXISTS "score";
