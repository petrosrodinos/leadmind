import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { Plus } from "lucide-react";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { Routes } from "@/routes/routes";
import { FilterCard } from "./components/filter-card";

export default function FiltersPage() {
    const navigate = useNavigate();
    const { data: filters, isLoading } = useFilters();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold text-foreground">Filters</h1>
                    <p className="text-sm text-muted">
                        Configure scheduled scrapes and the channels they create drafts for.
                    </p>
                </div>
                <Button onPress={() => navigate(Routes.dashboard.filters_new)}>
                    <Plus className="size-4" />
                    New filter
                </Button>
            </div>

            {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-52 rounded-xl bg-surface-secondary animate-pulse"
                        />
                    ))}
                </div>
            ) : !filters || filters.length === 0 ? (
                <div className="bg-surface rounded-xl border border-border p-12 text-center flex flex-col items-center gap-2">
                    <p className="text-sm font-medium text-foreground">No filters yet.</p>
                    <p className="text-xs text-muted max-w-sm">
                        Create a filter to start collecting leads from LinkedIn or Google
                        Maps on a schedule.
                    </p>
                    <Button
                        className="mt-2"
                        onPress={() => navigate(Routes.dashboard.filters_new)}
                    >
                        <Plus className="size-4" />
                        Create your first filter
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {filters.map((filter) => (
                        <FilterCard key={filter.uuid} filter={filter} />
                    ))}
                </div>
            )}
        </div>
    );
}
