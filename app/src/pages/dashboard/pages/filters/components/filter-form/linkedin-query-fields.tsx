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

function FieldGroup({ title }: { title: string }) {
    return (
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted/50 pt-1">
            {title}
        </p>
    );
}

export function LinkedInQueryFields({
    register,
    control,
    errors,
}: FilterQueryFieldsProps) {
    const qe = errors.query_config as { keywords?: { message?: string } } | undefined;

    return (
        <div className="flex flex-col gap-5">
            {/* Contact */}
            <div className="flex flex-col gap-3">
                <FieldGroup title="Contact" />
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <Label htmlFor="cfg-keywords">Keywords</Label>
                        <Input
                            id="cfg-keywords"
                            placeholder="Founder, head of growth"
                            {...register("query_config.keywords" as const)}
                        />
                        <p className="text-xs text-muted">
                            Up to three comma-separated job titles or phrases.
                        </p>
                        {qe?.keywords && (
                            <FieldError>{qe.keywords.message as string}</FieldError>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Seniority</Label>
                        <Controller
                            control={control}
                            name="query_config.seniority"
                            render={({ field }) => (
                                <MultiSelect
                                    options={LINKEDIN_SENIORITY_OPTIONS}
                                    value={asStringArray(field.value)}
                                    onChange={field.onChange}
                                    placeholder="Any seniority"
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
                                    placeholder="Any department"
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
                                    placeholder="States, metros, countries"
                                    aria-label="Contact location"
                                    searchPlaceholder="Search locations…"
                                    maxRendered={350}
                                />
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="cfg-limit-li">Results limit</Label>
                        <Input
                            id="cfg-limit-li"
                            type="number"
                            placeholder="50"
                            {...register("query_config.limit" as const)}
                        />
                        <p className="text-xs text-muted">Max leads per run.</p>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-surface-secondary/50 px-4 py-2.5 sm:col-span-2">
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">Require email</span>
                            <span className="text-xs text-muted">
                                Only return contacts that include an email address.
                            </span>
                        </div>
                        <Controller
                            control={control}
                            name="query_config.only_with_email"
                            render={({ field }) => (
                                <Switch
                                    isSelected={typeof field.value === "boolean" ? field.value : true}
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
            </div>

            {/* Company */}
            <div className="flex flex-col gap-3">
                <FieldGroup title="Company" />
                <div className="grid gap-3 sm:grid-cols-2">
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

                    <div className="flex flex-col gap-1.5">
                        <Label>Industries</Label>
                        <Controller
                            control={control}
                            name="query_config.companyIndustries"
                            render={({ field }) => (
                                <MultiSelect
                                    options={[...LINKEDIN_APIFY_COMPANY_INDUSTRIES]}
                                    value={asStringArray(field.value)}
                                    onChange={field.onChange}
                                    placeholder="Any industry"
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
                                    placeholder="Any headcount"
                                    aria-label="Company size"
                                    maxRendered={12}
                                />
                            )}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Revenue</Label>
                        <Controller
                            control={control}
                            name="query_config.company_revenue"
                            render={({ field }) => (
                                <MultiSelect
                                    options={[...LINKEDIN_APIFY_COMPANY_REVENUES]}
                                    value={asStringArray(field.value)}
                                    onChange={field.onChange}
                                    placeholder="Any revenue band"
                                    aria-label="Company revenue"
                                    maxRendered={12}
                                />
                            )}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
