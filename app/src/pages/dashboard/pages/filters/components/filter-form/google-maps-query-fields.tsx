import { Controller } from "react-hook-form";
import { FieldError, Input, Label } from "@heroui/react";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";
import type { FilterQueryFieldsProps } from "./types";

export function GoogleMapsQueryFields({ register, errors, control }: FilterQueryFieldsProps) {
    const qe = errors.query_config as { query?: { message?: string } } | undefined;
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="cfg-query">Search query</Label>
                <Input
                    id="cfg-query"
                    placeholder="dentists in austin"
                    {...register("query_config.query" as const)}
                />
                <p className="text-xs text-muted">
                    What kind of business to look for — sent directly to Google Maps (e.g. "real estate agents").
                </p>
                {qe?.query && (
                    <FieldError>{qe.query.message as string}</FieldError>
                )}
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="cfg-location-gm">Location</Label>
                <Controller
                    control={control}
                    name="query_config.location"
                    render={({ field }) => (
                        <LocationAutocomplete
                            id="cfg-location-gm"
                            placeholder="Austin, TX"
                            value={(field.value as string) ?? ""}
                            onChange={field.onChange}
                        />
                    )}
                />
                <p className="text-xs text-muted">
                    Looked up against OpenStreetMap — the same source the scraper uses.
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                <Label htmlFor="cfg-limit-gm">Limit per run</Label>
                <Input
                    id="cfg-limit-gm"
                    type="number"
                    placeholder="50"
                    {...register("query_config.limit" as const)}
                />
                <p className="text-xs text-muted">Max places to fetch per run.</p>
            </div>
        </div>
    );
}
