import { useNavigate, useParams } from "react-router-dom";
import { useFilter, useUpdateFilter } from "@/features/filters/hooks/use-filters";
import { Routes } from "@/routes/routes";
import { FilterForm } from "../../components/filter-form";

export default function EditFilterPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const { data: filter, isLoading } = useFilter(uuid);
    const updateFilter = useUpdateFilter();

    if (isLoading || !filter) {
        return <div className="h-96 rounded-xl bg-surface-secondary animate-pulse" />;
    }

    return (
        <FilterForm
            initial={filter}
            onCancel={() => navigate(Routes.dashboard.filters)}
            isPending={updateFilter.isPending}
            submitLabel="Save changes"
            onSubmit={async (payload) => {
                await updateFilter.mutateAsync({
                    uuid: filter.uuid,
                    payload,
                });
                navigate(Routes.dashboard.filters);
            }}
        />
    );
}
