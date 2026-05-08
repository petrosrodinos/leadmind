import { useParams, useSearchParams } from "react-router-dom";
import { useFilterJobs } from "@/features/filters/hooks/use-filters";
import { JobHistoryTable } from "../../components/job-history-table";

const PAGE_SIZE = 20;

export default function FilterJobsPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));

    const { data, isLoading, isFetching } = useFilterJobs(uuid, {
        page,
        limit: PAGE_SIZE,
    });

    return (
        <JobHistoryTable
            jobs={data?.items ?? []}
            isLoading={isLoading}
            isFetching={isFetching}
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            onPageChange={(p) => {
                const params = new URLSearchParams(searchParams);
                params.set("page", String(p));
                setSearchParams(params, { replace: true });
            }}
        />
    );
}
