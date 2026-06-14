ALTER TABLE "form_completion_values" DROP CONSTRAINT "form_completion_values_field_uuid_fkey";

ALTER TABLE "form_completion_values" ADD CONSTRAINT "form_completion_values_field_uuid_fkey" FOREIGN KEY ("field_uuid") REFERENCES "form_fields"("uuid") ON DELETE CASCADE ON UPDATE CASCADE;
