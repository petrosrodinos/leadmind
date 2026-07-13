import { useState, type FC } from "react";
import { Button } from "@heroui/react";
import { FileText, Megaphone, Plus } from "lucide-react";
import {
    useDeleteMessageTemplate,
    useMessageTemplates,
} from "@/features/message-templates/hooks/use-message-templates";
import type { MessageTemplate } from "@/features/message-templates/interfaces/message-template.interface";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MessageTemplatesTable } from "./components/message-templates-table";
import { MessageTemplateModal } from "./components/message-template-modal";
import { CreateFromCampaignModal } from "./components/create-from-campaign-modal";

const MessageTemplatesPage: FC = () => {
    const { data: templates = [], isLoading, refetch } = useMessageTemplates();
    const deleteMut = useDeleteMessageTemplate();

    const [modalOpen, setModalOpen] = useState(false);
    const [fromCampaignOpen, setFromCampaignOpen] = useState(false);
    const [editing, setEditing] = useState<MessageTemplate | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MessageTemplate | null>(null);

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                    <FileText className="size-5 text-muted" />
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">Message templates</h1>
                        <p className="text-sm text-muted">
                            Reusable email and SMS drafts with AI assistance. Use placeholders like{" "}
                            {"{{first_name}}"} in your copy.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button size="sm" variant="secondary" onPress={() => setFromCampaignOpen(true)}>
                        <Megaphone className="size-3.5" />
                        From campaign
                    </Button>
                    <Button
                        size="sm"
                        onPress={() => {
                            setEditing(null);
                            setModalOpen(true);
                        }}
                    >
                        <Plus className="size-3.5" />
                        New template
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="h-48 rounded-xl bg-surface-secondary animate-pulse border border-border" />
            ) : (
                <MessageTemplatesTable
                    templates={templates}
                    onEdit={(template) => {
                        setEditing(template);
                        setModalOpen(true);
                    }}
                    onDelete={setDeleteTarget}
                />
            )}

            <MessageTemplateModal
                isOpen={modalOpen}
                onOpenChange={(open) => {
                    setModalOpen(open);
                    if (!open) setEditing(null);
                }}
                initial={editing}
                onSaved={() => void refetch()}
            />

            <CreateFromCampaignModal
                isOpen={fromCampaignOpen}
                onOpenChange={setFromCampaignOpen}
                onSaved={() => void refetch()}
            />

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onOpenChange={(open) => !open && setDeleteTarget(null)}
                title="Delete template?"
                description="This cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                isPending={deleteMut.isPending}
                onConfirm={async () => {
                    if (!deleteTarget) return;
                    await deleteMut.mutateAsync(deleteTarget.uuid);
                    setDeleteTarget(null);
                    void refetch();
                }}
            />
        </div>
    );
};

export default MessageTemplatesPage;
