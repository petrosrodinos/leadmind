import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { LeadsTable } from "@/pages/dashboard/pages/leads/components/leads-table";
import { useContacts } from "@/features/contacts/hooks/use-contacts";

const PAGE_SIZE = 20;

export default function FilterContactsPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

    const query = useMemo(
        () => ({
            page,
            limit: PAGE_SIZE,
            filter_uuid: uuid,
        }),
        [page, uuid],
    );

    const { data, isLoading, isFetching } = useContacts(query);
    const contacts = data?.data ?? [];

    const onPageChange = (p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(p));
        setSearchParams(params, { replace: true });
    };

    return (
        <LeadsTable
            contacts={contacts}
            isLoading={isLoading}
            isFetching={isFetching}
            page={page}
            pageSize={PAGE_SIZE}
            total={data?.total ?? 0}
            totalPages={data?.totalPages ?? 1}
            onPageChange={onPageChange}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
        />
    );
}
