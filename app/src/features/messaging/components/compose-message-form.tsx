import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { useQueryClient } from "@tanstack/react-query";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Save, Send, ArrowLeft } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { contactsQueryKeys, useAiDraftMessage } from "@/features/contacts/hooks/use-contacts";
import {
    createAndSendMessage,
    createDraftMessage,
} from "@/features/outreach/services/outreach.service";
import { sendHistoryQueryKeys } from "@/features/outreach/hooks/use-send-history";
import { syncCachesAfterOutreachSend } from "@/features/outreach/utils/sync-contact-caches-after-send";
import type {
    EmailProviderAllocation,
    EmailProviderTarget,
} from "@/features/integrations/interfaces/integrations.interface";
import { assignEmailProviders } from "@/features/integrations/utils/email-provider-utils";
import {
    MessageComposer,
    type MessageComposerValue,
    type AiGenerateArgs,
} from "@/features/messaging/components/message-composer";
import {
    EmailProviderSelect,
    isEmailProviderAllocationValid,
} from "@/features/messaging/components/email-provider-select";
import { SenderProfileSelect } from "@/features/messaging/components/sender-profile-select";
import { DEFAULT_CAMPAIGN_ACTIONS } from "@/features/messaging/constants/ai-actions";
import {
    EMPTY_MESSAGE_COMPOSER_VALUE,
    buildCreateMessagePayload,
    isComposerContentEmpty,
} from "@/features/messaging/utils/compose-message";
import { MessageTemplateSelect } from "@/features/messaging/components/message-template-select";
import {
    mergeTemplateIntoComposer,
    preferredChannelAfterTemplateApply,
} from "@/features/message-templates/utils/message-template-composer.utils";
import type { MessageTemplate } from "@/features/message-templates/interfaces/message-template.interface";
import { toast } from "@/hooks/use-toast";

export type ComposeMessageMode = "single" | "bulk";

const BULK_CHANNELS = [Channel.EMAIL, Channel.SMS, Channel.PHONE_CALL];

export interface ComposeMessageFormProps {
    mode: ComposeMessageMode;
    contactUuid?: string;
    contactUuids?: string[];
    onClose: () => void;
    onBulkComplete?: () => void;
    onBack?: () => void;
}

function formatBulkResult(created: number, failed: number, send: boolean): string {
    const parts: string[] = [];
    if (created > 0) parts.push(send ? `${created} queued` : `${created} saved`);
    if (failed > 0) parts.push(`${failed} failed`);
    return parts.length > 0 ? parts.join(", ") : send ? "No messages sent" : "No drafts saved";
}

export function ComposeMessageForm({
    mode,
    contactUuid,
    contactUuids = [],
    onClose,
    onBulkComplete,
    onBack,
}: ComposeMessageFormProps) {
    const queryClient = useQueryClient();
    const [activeChannel, setActiveChannel] = useState<Channel>(Channel.EMAIL);
    const [value, setValue] = useState<MessageComposerValue>(EMPTY_MESSAGE_COMPOSER_VALUE);
    const [emailProvider, setEmailProvider] = useState<EmailProviderTarget | null>(null);
    const [emailAllocations, setEmailAllocations] = useState<EmailProviderAllocation[]>([]);
    const [senderProfileUuid, setSenderProfileUuid] = useState<string | null>(null);
    const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);
    const [isSingleSubmitting, setIsSingleSubmitting] = useState(false);
    const [composerKey, setComposerKey] = useState(0);
    const [emailSubjectError, setEmailSubjectError] = useState<string | null>(null);

    const aiDraft = useAiDraftMessage();

    const isBulk = mode === "bulk";
    const bulkCount = contactUuids.length;
    const aiContactUuid = isBulk ? contactUuids[0] : contactUuid;
    const showEmailProviders = activeChannel === Channel.EMAIL;

    const isPending = aiDraft.isPending || isBulkSubmitting || isSingleSubmitting;
    const contentEmpty = isComposerContentEmpty(activeChannel, value);
    const emailSubjectMissing = showEmailProviders && value.emailSubject.trim().length === 0;

    const invalidateContacts = (uuids: string[]) => {
        queryClient.invalidateQueries({ queryKey: contactsQueryKeys.all });
        queryClient.invalidateQueries({ queryKey: sendHistoryQueryKeys.all });
        for (const uuid of uuids) {
            queryClient.invalidateQueries({ queryKey: contactsQueryKeys.detail(uuid) });
            queryClient.invalidateQueries({ queryKey: contactsQueryKeys.messages(uuid) });
        }
    };

    const syncAfterSend = (uuids: string[]) => syncCachesAfterOutreachSend(queryClient, {
        contact_uuids: uuids,
    });

    const handleAi = async (args: AiGenerateArgs) => {
        if (!aiContactUuid) {
            throw new Error("No contact available for AI preview.");
        }
        const result = await aiDraft.mutateAsync({
            contact_uuid: aiContactUuid,
            channel: args.channel,
            action: args.action,
            prompt: args.prompt,
            language: args.language,
            current_subject: args.currentSubject,
            current_content: args.currentContent,
        });
        return { subject: result.subject, content: result.content };
    };

    const handleTemplateSelect = (template: MessageTemplate) => {
        setValue((prev) => mergeTemplateIntoComposer(prev, template));
        const nextChannel = preferredChannelAfterTemplateApply(template);
        if (nextChannel && (BULK_CHANNELS as readonly Channel[]).includes(nextChannel)) {
            setActiveChannel(nextChannel);
        }
        setComposerKey((k) => k + 1);
    };

    const runBulk = async (send: boolean) => {
        if (contentEmpty || isPending) return;
        if (!senderProfileUuid) return;
        if (emailSubjectMissing) {
            setEmailSubjectError("Subject is required.");
            return;
        }
        if (showEmailProviders && isBulk && !isEmailProviderAllocationValid(emailAllocations, bulkCount)) {
            return;
        }
        if (showEmailProviders && !isBulk && !emailProvider) return;

        setIsBulkSubmitting(true);
        let created = 0;
        let failed = 0;

        const providerAssignments =
            showEmailProviders && isBulk
                ? assignEmailProviders(contactUuids, emailAllocations)
                : null;

        try {
            for (const uuid of contactUuids) {
                try {
                    const payload = buildCreateMessagePayload(
                        activeChannel,
                        value,
                        uuid,
                        providerAssignments?.get(uuid) ?? emailProvider,
                        senderProfileUuid,
                    );
                    if (send) {
                        await createAndSendMessage(payload);
                    } else {
                        await createDraftMessage(payload);
                    }
                    created += 1;
                } catch {
                    failed += 1;
                }
            }

            if (send) {
                await syncAfterSend(contactUuids);
            } else {
                invalidateContacts(contactUuids);
            }
            toast({
                title: send ? "Messages queued" : "Drafts saved",
                description: formatBulkResult(created, failed, send),
                duration: 3500,
            });

            if (created > 0) {
                onBulkComplete?.();
                onClose();
            }
        } finally {
            setIsBulkSubmitting(false);
        }
    };

    const handleSaveDraft = async () => {
        if (isBulk) {
            await runBulk(false);
            return;
        }
        if (contentEmpty || isPending || !contactUuid) return;
        if (emailSubjectMissing) {
            setEmailSubjectError("Subject is required.");
            return;
        }
        if (showEmailProviders && !emailProvider) return;
        if (!senderProfileUuid) return;
        setIsSingleSubmitting(true);
        try {
            await createDraftMessage(
                buildCreateMessagePayload(
                    activeChannel,
                    value,
                    contactUuid,
                    emailProvider,
                    senderProfileUuid,
                ),
            );
            invalidateContacts([contactUuid]);
            toast({ title: "Draft saved", duration: 1500 });
            onClose();
        } catch (error) {
            toast({
                title: "Could not save draft",
                description: error instanceof Error ? error.message : "Failed to save draft.",
                duration: 3000,
                variant: "error",
            });
        } finally {
            setIsSingleSubmitting(false);
        }
    };

    const handleSend = async () => {
        if (isBulk) {
            await runBulk(true);
            return;
        }
        if (contentEmpty || isPending || !contactUuid) return;
        if (emailSubjectMissing) {
            setEmailSubjectError("Subject is required.");
            return;
        }
        if (showEmailProviders && !emailProvider) return;
        if (!senderProfileUuid) return;
        setIsSingleSubmitting(true);
        try {
            await createAndSendMessage(
                buildCreateMessagePayload(
                    activeChannel,
                    value,
                    contactUuid,
                    emailProvider,
                    senderProfileUuid,
                ),
            );
            await syncAfterSend([contactUuid]);
            toast({
                title: "Message queued for send",
                description: "We'll update its status when delivery completes.",
                duration: 2500,
            });
            onClose();
        } catch (error) {
            toast({
                title: "Could not send message",
                description: error instanceof Error ? error.message : "Failed to send message.",
                duration: 3000,
                variant: "error",
            });
        } finally {
            setIsSingleSubmitting(false);
        }
    };

    const heading = isBulk
        ? `Send message to ${bulkCount} contact${bulkCount === 1 ? "" : "s"}`
        : "Compose new message";

    const emailProviderMissing =
        showEmailProviders &&
        (isBulk
            ? !isEmailProviderAllocationValid(emailAllocations, bulkCount)
            : emailProvider == null);

    const saveDisabled =
        contentEmpty ||
        isPending ||
        !senderProfileUuid ||
        emailProviderMissing;

    const sendDisabled =
        contentEmpty ||
        isPending ||
        !senderProfileUuid ||
        emailProviderMissing;

    return (
        <>
            <Modal.Header>
                <Modal.Heading>{heading}</Modal.Heading>
            </Modal.Header>
            <div className="flex min-h-0 flex-1 flex-col">
                <Modal.Body className="p-6">
                    <div className="flex flex-col gap-5">
                        <MessageTemplateSelect
                            allowedChannels={BULK_CHANNELS}
                            disabled={isPending}
                            onSelect={handleTemplateSelect}
                        />
                        <MessageComposer
                            key={composerKey}
                            channels={BULK_CHANNELS}
                            activeChannel={activeChannel}
                            onActiveChannelChange={(c) => {
                                if (isPending) return;
                                setActiveChannel(c);
                                setEmailSubjectError(null);
                            }}
                            value={value}
                            onChange={(patch) => {
                                setValue((v) => ({ ...v, ...patch }));
                                if (typeof patch.emailSubject === "string" && patch.emailSubject.trim().length > 0) {
                                    setEmailSubjectError(null);
                                }
                            }}
                            onAiGenerate={aiContactUuid ? handleAi : undefined}
                            aiActions={DEFAULT_CAMPAIGN_ACTIONS}
                            isAiPending={aiDraft.isPending}
                            disabled={isPending}
                            emailSubjectError={showEmailProviders ? emailSubjectError : null}
                        />
                        {showEmailProviders ? (
                            isBulk ? (
                                <EmailProviderSelect
                                    totalCount={bulkCount}
                                    value={emailAllocations}
                                    onChange={setEmailAllocations}
                                    disabled={isPending}
                                />
                            ) : (
                                <EmailProviderSelect
                                    value={emailProvider}
                                    onChange={setEmailProvider}
                                    disabled={isPending}
                                />
                            )
                        ) : null}
                        <SenderProfileSelect
                            value={senderProfileUuid}
                            onChange={setSenderProfileUuid}
                            disabled={isPending}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    {onBack ? (
                        <Button
                            variant="ghost"
                            type="button"
                            isDisabled={isPending}
                            onPress={onBack}
                            className="mr-auto"
                        >
                            <ArrowLeft className="size-4" />
                            Back
                        </Button>
                    ) : null}
                    <Button slot="close" variant="secondary" type="button">
                        Cancel
                    </Button>
                    <ActionButtonWithPending
                        variant="tertiary"
                        isDisabled={saveDisabled}
                        isPending={isBulk ? isBulkSubmitting : isSingleSubmitting}
                        onPress={handleSaveDraft}
                        idleLeading={<Save className="size-4" />}
                    >
                        {isBulk ? "Save drafts" : "Save draft"}
                    </ActionButtonWithPending>
                    <ActionButtonWithPending
                        isDisabled={sendDisabled}
                        isPending={isBulk ? isBulkSubmitting : isSingleSubmitting}
                        onPress={handleSend}
                        idleLeading={<Send className="size-4" />}
                    >
                        {isBulk ? `Send to ${bulkCount}` : "Send"}
                    </ActionButtonWithPending>
                </Modal.Footer>
            </div>
        </>
    );
}
