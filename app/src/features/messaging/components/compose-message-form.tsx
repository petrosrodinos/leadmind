import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Save, Send } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { useAiDraftMessage, useBulkAiDraftMessages } from "@/features/contacts/hooks/use-contacts";
import {
    useCreateAndSendMessage,
    useCreateDraftMessage,
} from "@/features/outreach/hooks/use-outreach";
import type { EmailProviderAllocation, EmailProviderTarget } from "@/features/integrations/interfaces/integrations.interface";
import {
    MessageComposer,
    MessageChannelToggle,
    type MessageComposerValue,
    type AiGenerateArgs,
} from "@/features/messaging/components/message-composer";
import { PersonalizedMessageGoalField } from "@/features/messaging/components/personalized-message-goal-field";
import {
    EmailProviderAllocationPicker,
    isEmailProviderAllocationValid,
} from "@/features/messaging/components/email-provider-allocation-picker";
import { EmailProviderSelect } from "@/features/messaging/components/email-provider-select";
import { DEFAULT_CAMPAIGN_ACTIONS } from "@/features/messaging/constants/ai-actions";
import {
    EMPTY_MESSAGE_COMPOSER_VALUE,
    buildCreateMessagePayload,
    isComposerContentEmpty,
} from "@/features/messaging/utils/compose-message";

export type ComposeMessageMode = "single" | "bulk";

const BULK_CHANNELS = [Channel.EMAIL, Channel.SMS, Channel.PHONE_CALL];

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
    const [bulkPrompt, setBulkPrompt] = useState("");
    const [emailProvider, setEmailProvider] = useState<EmailProviderTarget | null>(null);
    const [emailAllocations, setEmailAllocations] = useState<EmailProviderAllocation[]>([]);

    const aiDraft = useAiDraftMessage();
    const createDraft = useCreateDraftMessage();
    const createAndSend = useCreateAndSendMessage();
    const bulkAiDraft = useBulkAiDraftMessages();

    const isBulk = mode === "bulk";
    const bulkCount = contactUuids.length;
    const bulkPromptEmpty = bulkPrompt.trim().length === 0;
    const showEmailProviders = activeChannel === Channel.EMAIL;
    const bulkEmailSendCount = bulkCount;
    const emailAllocationValid =
        !showEmailProviders ||
        !isBulk ||
        isEmailProviderAllocationValid(emailAllocations, bulkEmailSendCount);

    const isPending =
        aiDraft.isPending ||
        createDraft.isPending ||
        createAndSend.isPending ||
        bulkAiDraft.isPending;

    const contentEmpty = isComposerContentEmpty(activeChannel, value);

    const handleAi = async (args: AiGenerateArgs) => {
        if (!contactUuid) {
            throw new Error("No contact available for AI preview.");
        }
        const result = await aiDraft.mutateAsync({
            contact_uuid: contactUuid,
            channel: args.channel,
            action: args.action,
            prompt: args.prompt,
            language: args.language,
            current_subject: args.currentSubject,
            current_content: args.currentContent,
        });
        return { subject: result.subject, content: result.content };
    };

    const handleBulkDraft = async (send: boolean) => {
        if (bulkPromptEmpty || isPending) return;
        if (send && showEmailProviders && !emailAllocationValid) return;
        try {
            await bulkAiDraft.mutateAsync({
                contact_uuids: contactUuids,
                channel: activeChannel,
                prompt: bulkPrompt.trim(),
                send,
                ...(send && showEmailProviders
                    ? { email_provider_allocations: emailAllocations }
                    : {}),
            });
            onBulkComplete?.();
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    const handleSaveDraft = async () => {
        if (isBulk) {
            await handleBulkDraft(false);
            return;
        }
        if (contentEmpty || isPending || !contactUuid) return;
        if (showEmailProviders && !emailProvider) return;
        try {
            await createDraft.mutateAsync(
                buildCreateMessagePayload(activeChannel, value, contactUuid, emailProvider),
            );
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    const handleSend = async () => {
        if (isBulk) {
            await handleBulkDraft(true);
            return;
        }
        if (contentEmpty || isPending || !contactUuid) return;
        if (showEmailProviders && !emailProvider) return;
        try {
            await createAndSend.mutateAsync(
                buildCreateMessagePayload(activeChannel, value, contactUuid, emailProvider),
            );
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    const heading = isBulk
        ? `Draft messages for ${bulkCount} contact${bulkCount === 1 ? "" : "s"}`
        : "Compose new message";

    const saveDisabled =
        (isBulk ? bulkPromptEmpty : contentEmpty) ||
        isPending ||
        (!isBulk && showEmailProviders && emailProvider == null);

    const sendDisabled =
        saveDisabled ||
        (isBulk && showEmailProviders && !emailAllocationValid);

    return (
        <>
            <Modal.Header>
                <Modal.Heading>{heading}</Modal.Heading>
            </Modal.Header>
            <div className="flex min-h-0 flex-1 flex-col">
                <Modal.Body className="p-6">
                    {isBulk ? (
                        <div className="flex flex-col gap-5">
                            <MessageChannelToggle
                                channels={BULK_CHANNELS}
                                activeChannel={activeChannel}
                                onChange={(c) => {
                                    if (isPending) return;
                                    setActiveChannel(c);
                                }}
                                disabled={isPending}
                            />
                            <PersonalizedMessageGoalField
                                value={bulkPrompt}
                                onChange={setBulkPrompt}
                                disabled={isPending}
                            />
                            {showEmailProviders ? (
                                <EmailProviderAllocationPicker
                                    totalCount={bulkEmailSendCount}
                                    value={emailAllocations}
                                    onChange={setEmailAllocations}
                                    disabled={isPending}
                                />
                            ) : null}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-5">
                            <MessageComposer
                                channels={BULK_CHANNELS}
                                activeChannel={activeChannel}
                                onActiveChannelChange={(c) => {
                                    if (isPending) return;
                                    setActiveChannel(c);
                                }}
                                value={value}
                                onChange={(patch) => setValue((v) => ({ ...v, ...patch }))}
                                onAiGenerate={contactUuid ? handleAi : undefined}
                                aiActions={DEFAULT_CAMPAIGN_ACTIONS}
                                isAiPending={aiDraft.isPending}
                                disabled={isPending}
                            />
                            {showEmailProviders ? (
                                <EmailProviderSelect
                                    value={emailProvider}
                                    onChange={setEmailProvider}
                                    disabled={isPending}
                                />
                            ) : null}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button slot="close" variant="secondary" type="button">
                        Cancel
                    </Button>
                    <ActionButtonWithPending
                        variant="tertiary"
                        isDisabled={saveDisabled}
                        isPending={isBulk ? bulkAiDraft.isPending : createDraft.isPending}
                        onPress={handleSaveDraft}
                        idleLeading={<Save className="size-4" />}
                    >
                        {isBulk ? "Generate drafts" : "Save draft"}
                    </ActionButtonWithPending>
                    <ActionButtonWithPending
                        isDisabled={sendDisabled}
                        isPending={isBulk ? bulkAiDraft.isPending : createAndSend.isPending}
                        onPress={handleSend}
                        idleLeading={<Send className="size-4" />}
                    >
                        {isBulk ? "Generate and send" : "Send"}
                    </ActionButtonWithPending>
                </Modal.Footer>
            </div>
        </>
    );
}
