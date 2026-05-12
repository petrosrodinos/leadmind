import { useState } from "react";
import { Button, Modal } from "@heroui/react";
import { Save, Send } from "lucide-react";
import {
    Channel,
    type CreateMessagePayload,
} from "@/features/contacts/interfaces/contact.interface";
import { useAiDraftMessage } from "@/features/contacts/hooks/use-contacts";
import {
    useCreateAndSendMessage,
    useCreateDraftMessage,
} from "@/features/outreach/hooks/use-outreach";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";
import {
    MessageComposer,
    type MessageComposerValue,
} from "@/features/messaging/components/message-composer";

interface ComposeMessageModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    contact_uuid: string;
}

const EMPTY_VALUE: MessageComposerValue = {
    emailSubject: "",
    emailContent: "",
    smsContent: "",
};

export function ComposeMessageModal({
    isOpen,
    onOpenChange,
    contact_uuid,
}: ComposeMessageModalProps) {
    const [mountKey, setMountKey] = useState(0);

    const handleOpenChange = (open: boolean) => {
        if (open) setMountKey((k) => k + 1);
        onOpenChange(open);
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={handleOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    {isOpen ? (
                        <ComposeForm
                            key={mountKey}
                            contact_uuid={contact_uuid}
                            onClose={() => onOpenChange(false)}
                        />
                    ) : null}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}

interface ComposeFormProps {
    contact_uuid: string;
    onClose: () => void;
}

function ComposeForm({ contact_uuid, onClose }: ComposeFormProps) {
    const [activeChannel, setActiveChannel] = useState<Channel>(Channel.EMAIL);
    const [value, setValue] = useState<MessageComposerValue>(EMPTY_VALUE);

    const aiDraft = useAiDraftMessage();
    const createDraft = useCreateDraftMessage();
    const createAndSend = useCreateAndSendMessage();

    const isEmail = activeChannel === Channel.EMAIL;
    const isPending = aiDraft.isPending || createDraft.isPending || createAndSend.isPending;

    const contentEmpty = isEmail
        ? isEmailHtmlEmpty(value.emailContent)
        : value.smsContent.trim().length === 0;

    const handleAi = async (args: {
        channel: Channel;
        prompt: string;
        language: string;
    }) => {
        const result = await aiDraft.mutateAsync({
            contact_uuid,
            channel: args.channel,
            prompt: args.prompt,
            language: args.language,
        });
        return { subject: result.subject, content: result.content };
    };

    const buildPayload = (): CreateMessagePayload => {
        const content = isEmail ? value.emailContent : value.smsContent;
        const subject = isEmail && value.emailSubject.trim() ? value.emailSubject.trim() : undefined;
        return {
            channel: activeChannel,
            content,
            contact_uuid,
            ...(subject ? { subject } : {}),
        };
    };

    const handleSaveDraft = async () => {
        if (contentEmpty || createDraft.isPending) return;
        try {
            await createDraft.mutateAsync(buildPayload());
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    const handleSend = async () => {
        if (contentEmpty || createAndSend.isPending) return;
        try {
            await createAndSend.mutateAsync(buildPayload());
            onClose();
        } catch {
            // toast surfaced by hook
        }
    };

    return (
        <>
            <Modal.Header>
                <Modal.Heading>Compose new message</Modal.Heading>
            </Modal.Header>
            <div className="flex min-h-0 flex-1 flex-col">
                <Modal.Body className="p-6">
                    <MessageComposer
                        channels={[Channel.EMAIL, Channel.SMS]}
                        activeChannel={activeChannel}
                        onActiveChannelChange={(c) => {
                            if (isPending) return;
                            setActiveChannel(c);
                        }}
                        value={value}
                        onChange={(patch) => setValue((v) => ({ ...v, ...patch }))}
                        onAiGenerate={handleAi}
                        isAiPending={aiDraft.isPending}
                        disabled={isPending}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button slot="close" variant="secondary" type="button">
                        Cancel
                    </Button>
                    <Button
                        variant="tertiary"
                        isDisabled={contentEmpty || isPending}
                        isPending={createDraft.isPending}
                        onPress={handleSaveDraft}
                    >
                        <Save className="size-4" />
                        Save draft
                    </Button>
                    <Button
                        isDisabled={contentEmpty || isPending}
                        isPending={createAndSend.isPending}
                        onPress={handleSend}
                    >
                        <Send className="size-4" />
                        Send
                    </Button>
                </Modal.Footer>
            </div>
        </>
    );
}
