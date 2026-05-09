import { Controller } from "react-hook-form";
import {
    FieldError,
    Input,
    Label,
    Switch,
} from "@heroui/react";
import { MultiSelect } from "@/components/ui/multi-select";
import {
    LINKEDIN_APIFY_DEPARTMENTS,
    LINKEDIN_APIFY_CONTACT_LOCATIONS,
    LINKEDIN_APIFY_COMPANY_SIZES,
    LINKEDIN_APIFY_COMPANY_REVENUES,
    LINKEDIN_APIFY_COMPANY_INDUSTRIES,
} from "@/features/filters/constants/linkedin-apify-enums.generated";
import { LINKEDIN_SENIORITY_OPTIONS } from "./constants";
import { asStringArray } from "./helpers";
import type { FilterQueryFieldsProps } from "./types";

export function LinkedInQueryFields({
    register,
    control,
    errors,
}: FilterQueryFieldsProps) {
    const qe = errors.query_config as { keywords?: { message?: string } } | undefined;
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="cfg-keywords">Keywords</Label>
                <Input
                    id="cfg-keywords"
                    placeholder="Founder, head of growth"
                    {...register("query_config.keywords" as const)}
                />
                <p className="text-xs text-muted">
                    Up to three comma-separated job titles or phrases (mapped to Apify
                    contact job titles).
                </p>
                {qe?.keywords && (
                    <FieldError>
                        {qe.keywords.message as string}
                    </FieldError>
                )}
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>Contact seniority</Label>
                <Controller
                    control={control}
                    name="query_config.seniority"
                    render={({ field }) => (
                        <MultiSelect
                            options={LINKEDIN_SENIORITY_OPTIONS}
                            value={asStringArray(field.value)}
                            onChange={field.onChange}
                            placeholder="Optional seniority levels"
                            aria-label="Contact seniority"
                            maxRendered={16}
                        />
                    )}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>Department</Label>
                <Controller
                    control={control}
                    name="query_config.departments"
                    render={({ field }) => (
                        <MultiSelect
                            options={[...LINKEDIN_APIFY_DEPARTMENTS]}
                            value={asStringArray(field.value)}
                            onChange={field.onChange}
                            placeholder="Optional departments"
                            aria-label="Departments"
                            maxRendered={16}
                        />
                    )}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>Contact location</Label>
                <Controller
                    control={control}
                    name="query_config.location"
                    render={({ field }) => (
                        <MultiSelect
                            options={[...LINKEDIN_APIFY_CONTACT_LOCATIONS]}
                            value={asStringArray(field.value)}
                            onChange={field.onChange}
                            placeholder="States, metros, or countries"
                            aria-label="Contact location"
                            searchPlaceholder="Search locations…"
                            maxRendered={350}
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Values match the Apify actor enum. Leave empty for no location
                    filter.
                </p>
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>Company location</Label>
                <Controller
                    control={control}
                    name="query_config.company_location"
                    render={({ field }) => (
                        <MultiSelect
                            options={[...LINKEDIN_APIFY_CONTACT_LOCATIONS]}
                            value={asStringArray(field.value)}
                            onChange={field.onChange}
                            placeholder="Where the company is based"
                            aria-label="Company location"
                            searchPlaceholder="Search locations…"
                            maxRendered={350}
                        />
                    )}
                />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Company industries</Label>
                <Controller
                    control={control}
                    name="query_config.companyIndustries"
                    render={({ field }) => (
                        <MultiSelect
                            options={[...LINKEDIN_APIFY_COMPANY_INDUSTRIES]}
                            value={asStringArray(field.value)}
                            onChange={field.onChange}
                            placeholder="Optional industries"
                            aria-label="Company industries"
                            searchPlaceholder="Search industries…"
                            maxRendered={120}
                        />
                    )}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>Company size</Label>
                <Controller
                    control={control}
                    name="query_config.company_size"
                    render={({ field }) => (
                        <MultiSelect
                            options={[...LINKEDIN_APIFY_COMPANY_SIZES]}
                            value={asStringArray(field.value)}
                            onChange={field.onChange}
                            placeholder="Employee headcount ranges"
                            aria-label="Company size"
                            maxRendered={12}
                        />
                    )}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label>Company revenue</Label>
                <Controller
                    control={control}
                    name="query_config.company_revenue"
                    render={({ field }) => (
                        <MultiSelect
                            options={[...LINKEDIN_APIFY_COMPANY_REVENUES]}
                            value={asStringArray(field.value)}
                            onChange={field.onChange}
                            placeholder="Revenue bands"
                            aria-label="Company revenue"
                            maxRendered={12}
                        />
                    )}
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="cfg-limit-li">Limit</Label>
                <Input
                    id="cfg-limit-li"
                    type="number"
                    placeholder="50"
                    {...register("query_config.limit" as const)}
                />
                <p className="text-xs text-muted">
                    Max leads per run (Apify numberOfLeads).
                </p>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-secondary px-4 py-3 sm:col-span-2">
                <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground">
                        Require email
                    </span>
                    <span className="text-xs text-muted">
                        Only return rows that include an email (Apify allEmails).
                    </span>
                </div>
                <Controller
                    control={control}
                    name="query_config.only_with_email"
                    render={({ field }) => (
                        <Switch
                            isSelected={
                                typeof field.value === "boolean" ? field.value : true
                            }
                            onChange={field.onChange}
                            aria-label="Require email"
                        >
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch>
                    )}
                />
            </div>
        </div>
    );
}
