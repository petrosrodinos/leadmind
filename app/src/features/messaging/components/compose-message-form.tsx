import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Save, Send } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { useAiDraftMessage } from "@/features/contacts/hooks/use-contacts";
import {
    useBulkCreateAndSendMessages,
    useBulkCreateDraftMessages,
    useCreateAndSendMessage,
    useCreateDraftMessage,
} from "@/features/outreach/hooks/use-outreach";
import {
    MessageComposer,
    type MessageComposerValue,
    type AiGenerateArgs,
} from "@/features/messaging/components/message-composer";
import { DEFAULT_CAMPAIGN_ACTIONS } from "@/features/messaging/constants/ai-actions";
import {
    EMPTY_MESSAGE_COMPOSER_VALUE,
    buildBulkCreateMessagePayload,
    buildCreateMessagePayload,
    isComposerContentEmpty,
} from "@/features/messaging/utils/compose-message";

export type ComposeMessageMode = "single" | "bulk";

export interface ComposeMessageFormProps {
    mode: ComposeMessageMode;
    contactUuid?: string;
    contactUuids?: string[];
    onClose: () => void;
    onBulkComplete?: () => void;
}

export function ComposeMessageForm({
    mode,
    contactUuid,
    contactUuids = [],
    onClose,
    onBulkComplete,
}: ComposeMessageFormProps) {
    const [activeChannel, setActiveChannel] = useState<Channel>(Channel.EMAIL);
    const [value, setValue] = useState<MessageComposerValue>(EMPTY_MESSAGE_COMPOSER_VALUE);

    const aiDraft = useAiDraftMessage();
    const createDraft = useCreateDraftMessage();
    const createAndSend = useCreateAndSendMessage();
    const bulkCreateDraft = useBulkCreateDraftMessages();
    const bulkCreateAndSend = useBulkCreateAndSendMessages();

    const isBulk = mode === "bulk";
    const bulkCount = contactUuids.length;
    const aiPreviewContactUuid = isBulk ? contactUuids[0] : contactUuid;

    const isPending =
        aiDraft.isPending ||
        createDraft.isPending ||
        createAndSend.isPending ||
        bulkCreateDraft.isPending ||
        bulkCreateAndSend.isPending;

    const contentEmpty = isComposerContentEmpty(activeChannel, value);

    const handleAi = async (args: AiGenerateArgs) => {
        if (!aiPreviewContactUuid) {
            throw new Error("No contact available for AI preview.");
        }
        const result = await aiDraft.mutateAsync({
            contact_uuid: aiPreviewContactUuid,
            channel: args.channel,
            action: args.action,
            prompt: args.prompt,
            language: args.language,
            current_subject: args.currentSubject,
            current_content: args.currentContent,
        });
        return { subject: result.subject, content: result.content };
    };

    const handleSaveDraft = async () => {
        if (contentEmpty || isPending) return;
        try {
            if (isBulk) {
                await bulkCreateDraft.mutateAsync(
                    buildBulkCreateMessagePayload(activeChannel, value, contactUuids),
                );
                onBulkComplete?.();
            } else if (contactUuid) {
                await createDraft.mutateAsync(
                    buildCreateMessagePayload(activeChannel, value, contactUuid),
                );
            }
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    const handleSend = async () => {
        if (contentEmpty || isPending) return;
        try {
            if (isBulk) {
                await bulkCreateAndSend.mutateAsync(
                    buildBulkCreateMessagePayload(activeChannel, value, contactUuids),
                );
                onBulkComplete?.();
            } else if (contactUuid) {
                await createAndSend.mutateAsync(
                    buildCreateMessagePayload(activeChannel, value, contactUuid),
                );
            }
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    const heading = isBulk
        ? `Compose message for ${bulkCount} contact${bulkCount === 1 ? "" : "s"}`
        : "Compose new message";

    return (
        <>
            <Modal.Header>
                <Modal.Heading>{heading}</Modal.Heading>
                {isBulk ? (
                    <p className="text-sm text-muted">
                        The same draft is created for each selected contact. AI preview uses the first
                        selected contact as context.
                    </p>
                ) : null}
            </Modal.Header>
            <div className="flex min-h-0 flex-1 flex-col">
                <Modal.Body className="p-6">
                    <MessageComposer
                        channels={[Channel.EMAIL, Channel.SMS, Channel.PHONE_CALL]}
                        activeChannel={activeChannel}
                        onActiveChannelChange={(c) => {
                            if (isPending) return;
                            setActiveChannel(c);
                        }}
                        value={value}
                        onChange={(patch) => setValue((v) => ({ ...v, ...patch }))}
                        onAiGenerate={aiPreviewContactUuid ? handleAi : undefined}
                        aiActions={DEFAULT_CAMPAIGN_ACTIONS}
                        isAiPending={aiDraft.isPending}
                        disabled={isPending}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button slot="close" variant="secondary" type="button">
                        Cancel
                    </Button>
                    <ActionButtonWithPending
                        variant="tertiary"
                        isDisabled={contentEmpty || isPending}
                        isPending={isBulk ? bulkCreateDraft.isPending : createDraft.isPending}
                        onPress={handleSaveDraft}
                        idleLeading={<Save className="size-4" />}
                    >
                        {isBulk ? "Save drafts" : "Save draft"}
                    </ActionButtonWithPending>
                    <ActionButtonWithPending
                        isDisabled={contentEmpty || isPending}
                        isPending={isBulk ? bulkCreateAndSend.isPending : createAndSend.isPending}
                        onPress={handleSend}
                        idleLeading={<Send className="size-4" />}
                    >
                        {isBulk ? "Send to all" : "Send"}
                    </ActionButtonWithPending>
                </Modal.Footer>
            </div>
        </>
    );
}
