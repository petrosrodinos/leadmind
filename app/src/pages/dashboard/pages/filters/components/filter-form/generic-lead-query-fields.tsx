import { Controller } from "react-hook-form";
import { Input, Label } from "@heroui/react";
import { MultiSelect } from "@/components/ui/multi-select";
import {
    BUSINESS_MODELS,
    COMPANY_SIZES,
    COUNTRIES,
    DEPARTMENTS,
    INDUSTRIES,
    SENIORITY_LEVELS,
} from "@/features/filters/constants/generic-lead-finder";
import { REVENUE_OPTIONS } from "./constants";
import type { FilterQueryFieldsProps } from "./types";

export function GenericLeadQueryFields({ register, control }: FilterQueryFieldsProps) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="cfg-titles">Job titles</Label>
                <Input
                    id="cfg-titles"
                    placeholder="ceo, founder, head of growth"
                    {...register("query_config.titles" as const)}
                />
                <p className="text-xs text-muted">
                    Comma-separated job titles to match. Leave blank to skip
                    title filtering.
                </p>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label>Industries</Label>
                <Controller
                    control={control}
                    name="query_config.industries"
                    render={({ field }) => (
                        <MultiSelect
                            options={INDUSTRIES}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder="Pick industries…"
                            searchPlaceholder="Search industries…"
                            aria-label="Industries"
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Apollo's exact industry taxonomy. Type to filter the {INDUSTRIES.length}{" "}
                    available values.
                </p>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="cfg-industry-keywords">Industry keywords</Label>
                <Input
                    id="cfg-industry-keywords"
                    placeholder="b2b saas, devtools"
                    {...register("query_config.industry_keywords" as const)}
                />
                <p className="text-xs text-muted">
                    Free-text keywords matched against company descriptions
                    (comma-separated).
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Seniority</Label>
                <Controller
                    control={control}
                    name="query_config.seniority"
                    render={({ field }) => (
                        <MultiSelect
                            options={SENIORITY_LEVELS}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder="Any seniority"
                            aria-label="Seniority"
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Management level of the contact.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Departments</Label>
                <Controller
                    control={control}
                    name="query_config.departments"
                    render={({ field }) => (
                        <MultiSelect
                            options={DEPARTMENTS}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder="Any department"
                            aria-label="Departments"
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Functional area the contact works in.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Person country</Label>
                <Controller
                    control={control}
                    name="query_config.person_country"
                    render={({ field }) => (
                        <MultiSelect
                            options={COUNTRIES}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder="Any country"
                            searchPlaceholder="Search countries…"
                            aria-label="Person country"
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Where the person lives (full country name, e.g. "Greece").
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Company country</Label>
                <Controller
                    control={control}
                    name="query_config.company_country"
                    render={({ field }) => (
                        <MultiSelect
                            options={COUNTRIES}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder="Any country"
                            searchPlaceholder="Search countries…"
                            aria-label="Company country"
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Where the company is headquartered.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Company size</Label>
                <Controller
                    control={control}
                    name="query_config.company_size"
                    render={({ field }) => (
                        <MultiSelect
                            options={COMPANY_SIZES}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder="Any size"
                            aria-label="Company size"
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Employee count ranges (Apollo buckets).
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Revenue</Label>
                <Controller
                    control={control}
                    name="query_config.revenue"
                    render={({ field }) => (
                        <MultiSelect
                            options={REVENUE_OPTIONS}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder="Any revenue"
                            aria-label="Revenue"
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Annual revenue range of the company.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label>Business model</Label>
                <Controller
                    control={control}
                    name="query_config.business_model"
                    render={({ field }) => (
                        <MultiSelect
                            options={BUSINESS_MODELS}
                            value={(field.value as string[]) ?? []}
                            onChange={field.onChange}
                            placeholder="Any model"
                            aria-label="Business model"
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Product, services, or solutions company.
                </p>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="cfg-company-domains">Company domains</Label>
                <Input
                    id="cfg-company-domains"
                    placeholder="acme.com, example.com"
                    {...register("query_config.company_domains" as const)}
                />
                <p className="text-xs text-muted">
                    Comma-separated domains to restrict results to (max 10).
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="cfg-first-name">First name</Label>
                <Input
                    id="cfg-first-name"
                    placeholder="(optional)"
                    {...register("query_config.first_name" as const)}
                />
                <p className="text-xs text-muted">
                    Optional — narrows results to a specific first name.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="cfg-last-name">Last name</Label>
                <Input
                    id="cfg-last-name"
                    placeholder="(optional)"
                    {...register("query_config.last_name" as const)}
                />
                <p className="text-xs text-muted">
                    Optional — narrows results to a specific last name.
                </p>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="cfg-limit-gl">Limit</Label>
                <Input
                    id="cfg-limit-gl"
                    type="number"
                    placeholder="100"
                    {...register("query_config.limit" as const)}
                />
                <p className="text-xs text-muted">
                    Max contacts to fetch per run. Apollo charges per result, so
                    keep this conservative.
                </p>
            </div>
        </div>
    );
}
