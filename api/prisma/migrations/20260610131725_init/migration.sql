-- CreateEnum
CREATE TYPE "FieldType" AS ENUM ('TEXT_INPUT', 'TEXTAREA', 'NUMBER_INPUT', 'EMAIL_INPUT', 'PHONE_INPUT', 'DATE_INPUT', 'CHECKBOX', 'RADIO_GROUP', 'DROPDOWN', 'MULTI_SELECT_DROPDOWN', 'LABEL', 'SECTION_HEADER');

-- CreateTable
CREATE TABLE "forms" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "user_uuid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_fields" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "form_uuid" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "field_type" "FieldType" NOT NULL,
    "placeholder" TEXT,
    "help_text" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "default_value" TEXT,
    "options" JSONB,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_completions" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "form_uuid" TEXT NOT NULL,
    "contact_uuid" TEXT NOT NULL,
    "completed_by_uuid" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "form_completion_values" (
    "id" SERIAL NOT NULL,
    "uuid" TEXT NOT NULL,
    "completion_uuid" TEXT NOT NULL,
    "field_uuid" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "form_completion_values_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forms_uuid_key" ON "forms"("uuid");

-- CreateIndex
CREATE INDEX "forms_user_uuid_idx" ON "forms"("user_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "form_fields_uuid_key" ON "form_fields"("uuid");

-- CreateIndex
CREATE INDEX "form_fields_form_uuid_idx" ON "form_fields"("form_uuid");

-- CreateIndex
CREATE INDEX "form_fields_form_uuid_order_index_idx" ON "form_fields"("form_uuid", "order_index");

-- CreateIndex
CREATE UNIQUE INDEX "form_completions_uuid_key" ON "form_completions"("uuid");

-- CreateIndex
CREATE INDEX "form_completions_form_uuid_idx" ON "form_completions"("form_uuid");

-- CreateIndex
CREATE INDEX "form_completions_contact_uuid_idx" ON "form_completions"("contact_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "form_completion_values_uuid_key" ON "form_completion_values"("uuid");

-- CreateIndex
CREATE INDEX "form_completion_values_completion_uuid_idx" ON "form_completion_values"("completion_uuid");

-- CreateIndex
CREATE INDEX "form_completion_values_field_uuid_idx" ON "form_completion_values"("field_uuid");

-- AddForeignKey
ALTER TABLE "forms" ADD CONSTRAINT "forms_user_uuid_fkey" FOREIGN KEY ("user_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_uuid_fkey" FOREIGN KEY ("form_uuid") REFERENCES "forms"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_completions" ADD CONSTRAINT "form_completions_form_uuid_fkey" FOREIGN KEY ("form_uuid") REFERENCES "forms"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_completions" ADD CONSTRAINT "form_completions_contact_uuid_fkey" FOREIGN KEY ("contact_uuid") REFERENCES "Contact"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_completions" ADD CONSTRAINT "form_completions_completed_by_uuid_fkey" FOREIGN KEY ("completed_by_uuid") REFERENCES "users"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_completion_values" ADD CONSTRAINT "form_completion_values_completion_uuid_fkey" FOREIGN KEY ("completion_uuid") REFERENCES "form_completions"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "form_completion_values" ADD CONSTRAINT "form_completion_values_field_uuid_fkey" FOREIGN KEY ("field_uuid") REFERENCES "form_fields"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
