import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { LeadsTable } from "@/pages/dashboard/pages/leads/components/leads-table";
import { LeadDrawer } from "@/pages/dashboard/pages/leads/components/lead-drawer";
import { useContacts } from "@/features/contacts/hooks/use-contacts";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";

const PAGE_SIZE = 20;

export default function FilterContactsPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));

    const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
    const [drawerContact, setDrawerContact] = useState<Contact | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

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

    useEffect(() => {
        if (!drawerContact) return;
        const updated = contacts.find((c) => c.uuid === drawerContact.uuid);
        if (updated) setDrawerContact(updated);
    }, [contacts]);

    const onPageChange = (p: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", String(p));
        setSearchParams(params, { replace: true });
    };

    return (
        <>
            <LeadsTable
                contacts={contacts}
                isLoading={isLoading}
                isFetching={isFetching}
                page={page}
                pageSize={PAGE_SIZE}
                total={data?.total ?? 0}
                totalPages={data?.totalPages ?? 1}
                onPageChange={onPageChange}
                onRowClick={(c) => {
                    setDrawerContact(c);
                    setDrawerOpen(true);
                }}
                selectedKeys={selectedKeys}
                onSelectionChange={setSelectedKeys}
            />

            <LeadDrawer
                contactUuid={drawerOpen ? drawerContact?.uuid ?? null : null}
                isOpen={drawerOpen}
                onOpenChange={(open) => {
                    setDrawerOpen(open);
                    if (!open) setDrawerContact(null);
                }}
            />
        </>
    );
}
