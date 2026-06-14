import { useState, type FC, type ReactNode } from "react";
import { Tabs } from "@heroui/react";
import { useContact, useDeleteContact } from "@/features/contacts/hooks/use-contacts";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CONTACT_DETAIL_TABS } from "../constants/detail-tabs";
import { ContactDetailHeader, CrmTab, FormsTab, OverviewTab, OutreachTab, RemindersTab } from "./index";

interface ContactDetailViewProps {
    contactUuid: string;
    onBack?: () => void;
    onDeleted?: () => void;
    showDelete?: boolean;
    headerActions?: ReactNode;
}

export const ContactDetailView: FC<ContactDetailViewProps> = ({
    contactUuid,
    onBack,
    onDeleted,
    showDelete = true,
    headerActions,
}) => {
    const { data: contact, isLoading } = useContact(contactUuid);
    const deleteContact = useDeleteContact();

    const [activeTab, setActiveTab] = useState("overview");
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [highlightOutreachUuid, setHighlightOutreachUuid] = useState<string | null>(null);

    const handleConfirmDelete = async () => {
        if (!contact) return;
        await deleteContact.mutateAsync(contact.uuid);
        setConfirmDeleteOpen(false);
        onDeleted?.();
    };

    const navigateToOutreach = (outreachUuid: string) => {
        setHighlightOutreachUuid(outreachUuid);
        setActiveTab("outreach");
    };

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2 min-w-0">
                <div className="min-w-0 flex-1">
                    <ContactDetailHeader
                        isLoading={isLoading}
                        contact={contact}
                        onBack={onBack}
                        onDeletePress={() => setConfirmDeleteOpen(true)}
                        deletePending={deleteContact.isPending}
                        showBack={Boolean(onBack)}
                        showDelete={showDelete}
                    />
                </div>
                {headerActions ? <div className="shrink-0 flex items-center gap-1">{headerActions}</div> : null}
            </div>

            <Tabs selectedKey={activeTab} onSelectionChange={(key) => setActiveTab(String(key))}>
                <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border overflow-x-auto max-w-full">
                    {CONTACT_DETAIL_TABS.map((t) => (
                        <Tabs.Tab
                            key={t.id}
                            id={t.id}
                            className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent whitespace-nowrap"
                        >
                            {t.label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs>

            <div className="pt-2">
                {!contact ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 rounded-lg bg-surface-secondary animate-pulse" />
                        ))}
                    </div>
                ) : activeTab === "overview" ? (
                    <OverviewTab key={`${contact.uuid}-${contact.updated_at}`} contact={contact} />
                ) : activeTab === "outreach" ? (
                    <OutreachTab
                        contact={contact}
                        highlightUuid={highlightOutreachUuid}
                        onHighlightConsumed={() => setHighlightOutreachUuid(null)}
                    />
                ) : activeTab === "reminders" ? (
                    <RemindersTab contactUuid={contact.uuid} />
                ) : activeTab === "forms" ? (
                    <FormsTab contactUuid={contact.uuid} contactName={contact.name} />
                ) : (
                    <CrmTab contact={contact} onNavigateToOutreach={navigateToOutreach} />
                )}
            </div>

            {contact ? (
                <ConfirmDialog
                    isOpen={confirmDeleteOpen}
                    onOpenChange={setConfirmDeleteOpen}
                    title={`Delete contact "${contact.name ?? "this contact"}"?`}
                    description="This removes the contact from your CRM. The underlying lead record stays in the public directory."
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    variant="danger"
                    isPending={deleteContact.isPending}
                    onConfirm={handleConfirmDelete}
                />
            ) : null}
        </div>
    );
};
