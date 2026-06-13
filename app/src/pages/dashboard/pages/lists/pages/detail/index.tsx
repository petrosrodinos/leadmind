import { useState } from "react";
import { Link, useParams, useSearchParams, type Key } from "react-router-dom";
import { Button, Spinner, Tabs } from "@heroui/react";
import { ArrowLeft, List, Pencil, UserPlus } from "lucide-react";
import { Routes, ListDetailTabIds } from "@/routes/routes";
import {
    useContactList,
    useContactListMembers,
} from "@/features/contact-lists/hooks/use-contact-lists";
import { ContactListFormModal } from "../../components/contact-list-form-modal";
import { ListMembersTable } from "./components/list-members-table";
import { AddContactsModal } from "./components/add-contacts-modal";
import { ContactAudienceAnalyticsPanel } from "@/pages/dashboard/components/audience-analytics/contact-audience-analytics-panel";

const MEMBERS_PAGE_SIZE = 20;

const TABS = [
    { id: ListDetailTabIds.CONTACTS, label: "Contacts" },
    { id: ListDetailTabIds.ANALYTICS, label: "Analytics" },
] as const;

export default function ListDetailPage() {
    const { uuid = "" } = useParams<{ uuid: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [editOpen, setEditOpen] = useState(false);
    const [addContactsOpen, setAddContactsOpen] = useState(false);

    const allowedTabIds = new Set<string>(TABS.map((t) => t.id));
    const rawTab = searchParams.get(Routes.dashboard.lists_detail_tab_query);
    const currentTab = rawTab && allowedTabIds.has(rawTab) ? rawTab : ListDetailTabIds.CONTACTS;

    const membersPage = Math.max(1, Number(searchParams.get("page") ?? 1));

    const { data: list, isLoading: listLoading } = useContactList(uuid);
    const {
        data: membersData,
        isLoading: membersLoading,
        isFetching: membersFetching,
    } = useContactListMembers(uuid, {
        page: membersPage,
        limit: MEMBERS_PAGE_SIZE,
    });

    const members = membersData?.data ?? [];
    const total = membersData?.total ?? 0;
    const totalPages = membersData?.totalPages ?? 1;

    const handleTabChange = (key: Key) => {
        if (!uuid) return;
        const next = new URLSearchParams();
        next.set(Routes.dashboard.lists_detail_tab_query, String(key));
        setSearchParams(next, { replace: true });
    };

    if (listLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!list) {
        return (
            <div className="text-center py-24 text-muted">
                <p>List not found.</p>
                <Link to={Routes.dashboard.lists} className="text-accent text-sm mt-2 inline-block">
                    Back to lists
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                <Link
                    to={Routes.dashboard.lists}
                    className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground w-fit"
                >
                    <ArrowLeft className="size-4" />
                    Back to lists
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <List className="size-5 text-muted shrink-0 mt-1" />
                        <div className="min-w-0">
                            <h1 className="text-xl font-semibold text-foreground">{list.title}</h1>
                            {list.description ? (
                                <p className="text-sm text-muted mt-1">{list.description}</p>
                            ) : null}
                            <p className="text-xs text-muted mt-2">
                                {list.contact_count ?? total} contact
                                {(list.contact_count ?? total) === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        {currentTab === ListDetailTabIds.CONTACTS ? (
                            <Button size="sm" onPress={() => setAddContactsOpen(true)}>
                                <UserPlus className="size-4" />
                                Add contacts
                            </Button>
                        ) : null}
                        <Button size="sm" variant="tertiary" onPress={() => setEditOpen(true)}>
                            <Pencil className="size-4" />
                            Edit list
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs selectedKey={currentTab} onSelectionChange={handleTabChange}>
                <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border">
                    {TABS.map((t) => (
                        <Tabs.Tab
                            key={t.id}
                            id={t.id}
                            className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                            {t.label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs>

            <div className="pt-2">
                {currentTab === ListDetailTabIds.CONTACTS && (
                    <section className="flex flex-col gap-4">
                        <h2 className="text-base font-semibold text-foreground">Contacts in list</h2>
                        <ListMembersTable
                            listUuid={uuid}
                            contacts={members}
                            isLoading={membersLoading}
                            isFetching={membersFetching}
                            page={membersPage}
                            pageSize={MEMBERS_PAGE_SIZE}
                            total={total}
                            totalPages={totalPages}
                            onPageChange={(p) => {
                                const params = new URLSearchParams(searchParams);
                                params.set("page", String(p));
                                setSearchParams(params, { replace: true });
                            }}
                        />
                    </section>
                )}
                {currentTab === ListDetailTabIds.ANALYTICS && (
                    <ContactAudienceAnalyticsPanel scope={{ type: "list", uuid }} />
                )}
            </div>

            <ContactListFormModal isOpen={editOpen} onOpenChange={setEditOpen} editing={list} />
            <AddContactsModal
                listUuid={uuid}
                isOpen={addContactsOpen}
                onOpenChange={setAddContactsOpen}
            />
        </div>
    );
}
