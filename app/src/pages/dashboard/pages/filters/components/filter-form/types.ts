import type { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import type { SourceType } from "@/features/leads/interfaces/lead.interface";
import type { FilterFormValues } from "../../validation-schemas/filter";

export type FilterQueryFieldsProps = {
    sourceType: SourceType;
    register: UseFormRegister<FilterFormValues>;
    control: Control<FilterFormValues>;
    errors: FieldErrors<FilterFormValues>;
};
