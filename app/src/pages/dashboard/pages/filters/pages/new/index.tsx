import { useNavigate } from "react-router-dom";
import { useCreateFilter } from "@/features/filters/hooks/use-filters";
import { Routes } from "@/routes/routes";
import { FilterForm } from "../../components/filter-form";

export default function NewFilterPage() {
    const navigate = useNavigate();
    const createFilter = useCreateFilter();

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div>
                <h1 className="text-xl font-semibold text-foreground">New filter</h1>
                <p className="text-sm text-muted">
                    Create a new scheduled scrape configuration.
                </p>
            </div>

            <FilterForm
                onCancel={() => navigate(Routes.dashboard.filters)}
                isPending={createFilter.isPending}
                submitLabel="Create filter"
                onSubmit={async (payload) => {
                    await createFilter.mutateAsync(payload);
                    navigate(Routes.dashboard.filters);
                }}
            />
        </div>
    );
}
