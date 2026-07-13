import { useEffect, useMemo, useState, type FC } from "react";
import { Button, Checkbox, FieldError, Input, Label, Modal } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import {
    MessageComposer,
    type MessageComposerValue,
} from "@/features/messaging/components/message-composer";
import { DEFAULT_CAMPAIGN_ACTIONS } from "@/features/messaging/constants/ai-actions";
import { EMPTY_MESSAGE_COMPOSER_VALUE } from "@/features/messaging/utils/compose-message";
import {
    useCreateMessageTemplate,
    useGenerateTemplateMessage,
    useUpdateMessageTemplate,
} from "@/features/message-templates/hooks/use-message-templates";
import type { MessageTemplate } from "@/features/message-templates/interfaces/message-template.interface";

interface MessageTemplateModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: MessageTemplate | null;
    onSaved?: () => void;
}

function templateToComposerValue(template?: MessageTemplate | null): MessageComposerValue {
    if (!template) return EMPTY_MESSAGE_COMPOSER_VALUE;
    return {
        emailSubject: template.email_subject ?? "",
        emailContent: template.email_content ?? "",
        smsContent: template.sms_content ?? "",
        callContent: "",
        linkedinContent: "",
    };
}

const TEMPLATE_CHANNEL_OPTIONS = [Channel.EMAIL, Channel.SMS] as const;

export const MessageTemplateModal: FC<MessageTemplateModalProps> = ({
    isOpen,
    onOpenChange,
    initial = null,
    onSaved,
}) => {
    const createMut = useCreateMessageTemplate();
    const updateMut = useUpdateMessageTemplate();
    const aiGenerate = useGenerateTemplateMessage();

    const [name, setName] = useState("");
    const [selectedChannels, setSelectedChannels] = useState<Channel[]>([Channel.EMAIL]);
    const [composerValue, setComposerValue] = useState<MessageComposerValue>(EMPTY_MESSAGE_COMPOSER_VALUE);
    const [activeChannel, setActiveChannel] = useState<Channel>(Channel.EMAIL);
    const [nameError, setNameError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        const channels =
            initial?.channels.filter((c) => c === Channel.EMAIL || c === Channel.SMS) ?? [Channel.EMAIL];
        setName(initial?.name ?? "");
        setSelectedChannels(channels.length > 0 ? channels : [Channel.EMAIL]);
        setComposerValue(templateToComposerValue(initial));
        setActiveChannel(channels[0] ?? Channel.EMAIL);
        setNameError(null);
    }, [isOpen, initial]);

    const composerChannels = useMemo(
        () => selectedChannels.filter((c) => c === Channel.EMAIL || c === Channel.SMS),
        [selectedChannels],
    );

    useEffect(() => {
        if (!composerChannels.includes(activeChannel)) {
            setActiveChannel(composerChannels[0] ?? Channel.EMAIL);
        }
    }, [composerChannels, activeChannel]);

    const toggleChannel = (channel: Channel, checked: boolean) => {
        setSelectedChannels((prev) => {
            if (checked) return prev.includes(channel) ? prev : [...prev, channel];
            const next = prev.filter((c) => c !== channel);
            return next.length > 0 ? next : prev;
        });
    };

    const validate = (): boolean => {
        if (!name.trim()) {
            setNameError("Name is required");
            return false;
        }
        if (selectedChannels.includes(Channel.EMAIL) && !composerValue.emailContent.trim()) {
            return false;
        }
        if (selectedChannels.includes(Channel.SMS) && !composerValue.smsContent.trim()) {
            return false;
        }
        setNameError(null);
        return true;
    };

    const handleSave = async () => {
        if (!validate()) return;
        const payload = {
            name: name.trim(),
            channels: selectedChannels,
            email_subject: selectedChannels.includes(Channel.EMAIL)
                ? composerValue.emailSubject.trim() || undefined
                : undefined,
            email_content: selectedChannels.includes(Channel.EMAIL)
                ? composerValue.emailContent
                : undefined,
            sms_content: selectedChannels.includes(Channel.SMS) ? composerValue.smsContent : undefined,
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

                        <div className="flex flex-col gap-2">
                            <Label>Channels</Label>
                            <div className="flex flex-wrap gap-4">
                                {TEMPLATE_CHANNEL_OPTIONS.map((channel) => (
                                    <Checkbox
                                        key={channel}
                                        isSelected={selectedChannels.includes(channel)}
                                        onChange={(checked) => toggleChannel(channel, checked)}
                                    >
                                        <Checkbox.Control>
                                            <Checkbox.Indicator />
                                        </Checkbox.Control>
                                        <Checkbox.Content>
                                            <Label>{channel === Channel.EMAIL ? "Email" : "SMS"}</Label>
                                        </Checkbox.Content>
                                    </Checkbox>
                                ))}
                            </div>
                        </div>

                        {composerChannels.length > 0 ? (
                            <MessageComposer
                                channels={composerChannels}
                                activeChannel={activeChannel}
                                onActiveChannelChange={setActiveChannel}
                                value={composerValue}
                                onChange={(patch) => setComposerValue((prev) => ({ ...prev, ...patch }))}
                                onAiGenerate={handleAi}
                                aiActions={DEFAULT_CAMPAIGN_ACTIONS}
                                isAiPending={aiGenerate.isPending}
                                disabled={pending}
                            />
                        ) : null}
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
