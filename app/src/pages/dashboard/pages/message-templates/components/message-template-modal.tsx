import { useLayoutEffect, useRef, useState, type FC } from "react";
import { Button, FieldError, Input, Label, Modal } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import {
    MessageComposer,
    type MessageComposerValue,
} from "@/features/messaging/components/message-composer";
import { DEFAULT_CAMPAIGN_ACTIONS } from "@/features/messaging/constants/ai-actions";
import {
    EMPTY_MESSAGE_COMPOSER_VALUE,
    isComposerContentEmpty,
} from "@/features/messaging/utils/compose-message";
import {
    useCreateMessageTemplate,
    useGenerateTemplateMessage,
    useUpdateMessageTemplate,
} from "@/features/message-templates/hooks/use-message-templates";
import type { MessageTemplate } from "@/features/message-templates/interfaces/message-template.interface";
import { messageTemplateToComposerValue } from "@/features/message-templates/utils/message-template-composer.utils";

interface MessageTemplateModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: MessageTemplate | null;
    prefill?: MessageComposerValue | null;
    defaultName?: string;
    onSaved?: () => void;
}

function templateToComposerValue(template?: MessageTemplate | null): MessageComposerValue {
    if (!template) return EMPTY_MESSAGE_COMPOSER_VALUE;
    return messageTemplateToComposerValue(template);
}

const TEMPLATE_COMPOSER_CHANNELS = [Channel.EMAIL, Channel.SMS] as const;

function deriveTemplateChannels(value: MessageComposerValue): Channel[] {
    const channels: Channel[] = [];
    if (!isComposerContentEmpty(Channel.EMAIL, value)) channels.push(Channel.EMAIL);
    if (!isComposerContentEmpty(Channel.SMS, value)) channels.push(Channel.SMS);
    return channels;
}

export const MessageTemplateModal: FC<MessageTemplateModalProps> = ({
    isOpen,
    onOpenChange,
    initial = null,
    prefill = null,
    defaultName = "",
    onSaved,
}) => {
    const createMut = useCreateMessageTemplate();
    const updateMut = useUpdateMessageTemplate();
    const aiGenerate = useGenerateTemplateMessage();

    const [name, setName] = useState("");
    const [composerValue, setComposerValue] = useState<MessageComposerValue>(EMPTY_MESSAGE_COMPOSER_VALUE);
    const [activeChannel, setActiveChannel] = useState<Channel>(Channel.EMAIL);
    const [nameError, setNameError] = useState<string | null>(null);
    const [contentError, setContentError] = useState<string | null>(null);
    const [composerKey, setComposerKey] = useState(0);
    const [composerReady, setComposerReady] = useState(false);
    const wasOpenRef = useRef(false);

    useLayoutEffect(() => {
        if (!isOpen) {
            setComposerReady(false);
            wasOpenRef.current = false;
            return;
        }

        if (!wasOpenRef.current) {
            if (initial) {
                setName(initial.name);
                setComposerValue(templateToComposerValue(initial));
                const channels = initial.channels.filter(
                    (c) => c === Channel.EMAIL || c === Channel.SMS,
                );
                setActiveChannel(channels[0] ?? Channel.EMAIL);
            } else if (prefill) {
                setName(defaultName);
                setComposerValue(prefill);
                setActiveChannel(
                    !isComposerContentEmpty(Channel.EMAIL, prefill) ? Channel.EMAIL : Channel.SMS,
                );
            } else {
                setName("");
                setComposerValue(EMPTY_MESSAGE_COMPOSER_VALUE);
                setActiveChannel(Channel.EMAIL);
            }
            setComposerKey((k) => k + 1);
            setNameError(null);
            setContentError(null);
            setComposerReady(true);
        }

        wasOpenRef.current = isOpen;
    }, [isOpen, initial, prefill, defaultName]);

    const validate = (): Channel[] | null => {
        if (!name.trim()) {
            setNameError("Name is required");
            return null;
        }
        setNameError(null);

        const channels = deriveTemplateChannels(composerValue);
        if (channels.length === 0) {
            setContentError("Add email or SMS content");
            return null;
        }
        setContentError(null);
        return channels;
    };

    const handleSave = async () => {
        const channels = validate();
        if (!channels) return;

        const payload = {
            name: name.trim(),
            channels,
            email_subject: channels.includes(Channel.EMAIL)
                ? composerValue.emailSubject.trim() || undefined
                : undefined,
            email_content: channels.includes(Channel.EMAIL) ? composerValue.emailContent : undefined,
            sms_content: channels.includes(Channel.SMS) ? composerValue.smsContent : undefined,
        };
        if (initial) {
            await updateMut.mutateAsync({ uuid: initial.uuid, payload });
        } else {
            await createMut.mutateAsync(payload);
        }
        onSaved?.();
        onOpenChange(false);
    };

    const handleAi = async (args: {
        channel: Channel;
        action: string;
        prompt: string;
        language: string;
        currentSubject?: string;
        currentContent?: string;
    }) => {
        const result = await aiGenerate.mutateAsync({
            channel: args.channel,
            action: args.action,
            prompt: args.prompt,
            language: args.language,
            current_subject: args.currentSubject,
            current_content: args.currentContent,
        });
        return { subject: result.subject, content: result.content };
    };

    const pending = createMut.isPending || updateMut.isPending;

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container size="lg">
                <Modal.Dialog className="sm:max-w-3xl max-h-[90vh] flex flex-col">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>{initial ? "Edit template" : "New template"}</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-5 overflow-y-auto flex-1">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="template-name">Name</Label>
                            <Input
                                id="template-name"
                                placeholder="e.g. Intro email for clinics"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            {nameError ? <FieldError>{nameError}</FieldError> : null}
                        </div>

                        {composerReady ? (
                            <MessageComposer
                                key={composerKey}
                                channels={[...TEMPLATE_COMPOSER_CHANNELS]}
                                activeChannel={activeChannel}
                                onActiveChannelChange={setActiveChannel}
                                value={composerValue}
                                onChange={(patch) =>
                                    setComposerValue((prev) => ({ ...prev, ...patch }))
                                }
                                onAiGenerate={handleAi}
                                aiActions={DEFAULT_CAMPAIGN_ACTIONS}
                                isAiPending={aiGenerate.isPending}
                                disabled={pending}
                            />
                        ) : null}
                        {contentError ? <FieldError>{contentError}</FieldError> : null}
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end shrink-0">
                        <Button
                            type="button"
                            size="sm"
                            variant="tertiary"
                            onPress={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <ActionButtonWithPending
                            size="sm"
                            isDisabled={pending}
                            isPending={pending}
                            onPress={() => void handleSave()}
                        >
                            {initial ? "Save" : "Create"}
                        </ActionButtonWithPending>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};
