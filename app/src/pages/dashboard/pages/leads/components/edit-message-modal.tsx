import { useState } from "react";
import { Button, Input, Label, Modal, TextArea, TextField } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Send, Save } from "lucide-react";
import {
    Channel,
    type OutreachMessage,
} from "@/features/contacts/interfaces/contact.interface";
import {
    useSendOutreachMessage,
    useUpdateOutreachMessage,
} from "@/features/outreach/hooks/use-outreach";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

interface EditMessageModalProps {
    message: OutreachMessage | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    contact_uuid?: string;
}

export function EditMessageModal({
    message,
    isOpen,
    onOpenChange,
    contact_uuid,
}: EditMessageModalProps) {
    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
                    {message ? (
                        <MessageForm
                            key={message.uuid}
                            message={message}
                            contact_uuid={contact_uuid}
                            onClose={() => onOpenChange(false)}
                        />
                    ) : null}
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}

interface MessageFormProps {
    message: OutreachMessage;
    contact_uuid?: string;
    onClose: () => void;
}

function MessageForm({ message, contact_uuid, onClose }: MessageFormProps) {
    const [subject, setSubject] = useState(message.subject ?? "");
    const [content, setContent] = useState(message.content ?? "");

    const update = useUpdateOutreachMessage();
    const send = useSendOutreachMessage();

    const isEmail = message.channel === Channel.EMAIL;
    const dirty =
        (isEmail && subject !== (message.subject ?? "")) ||
        content !== (message.content ?? "");

    const handleSave = async () => {
        await update.mutateAsync({
            uuid: message.uuid,
            payload: {
                ...(isEmail ? { subject } : {}),
                content,
            },
            contact_uuid,
        });
    };

    const handleSend = async () => {
        if (dirty) {
            await update.mutateAsync({
                uuid: message.uuid,
                payload: {
                    ...(isEmail ? { subject } : {}),
                    content,
                },
                contact_uuid,
            });
        }
        await send.mutateAsync({ uuid: message.uuid, contact_uuid });
        onClose();
    };

    return (
        <>
            <Modal.Header>
                <Modal.Heading>Edit {message.channel.toLowerCase()} draft</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="p-6">
                <div className="flex flex-col gap-4">
                    {isEmail && (
                        <TextField className="w-full" name="subject">
                            <Label>Subject</Label>
                            <Input
                                placeholder="Email subject"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                            />
                        </TextField>
                    )}
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="message-content">Message</Label>
                        {isEmail ? (
                            <RichTextEditor
                                aria-label="Message content"
                                value={content}
                                onChange={setContent}
                            />
                        ) : (
                            <TextArea
                                id="message-content"
                                aria-label="Message content"
                                rows={10}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        )}
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button slot="close" variant="secondary">
                    Cancel
                </Button>
                <ActionButtonWithPending
                    variant="tertiary"
                    isDisabled={!dirty || update.isPending}
                    isPending={update.isPending}
                    onPress={handleSave}
                    idleLeading={<Save className="size-4" />}
                >
                    Save draft
                </ActionButtonWithPending>
                <ActionButtonWithPending
                    isDisabled={send.isPending || update.isPending}
                    isPending={send.isPending}
                    onPress={handleSend}
                    idleLeading={<Send className="size-4" />}
                >
                    Send
                </ActionButtonWithPending>
            </Modal.Footer>
        </>
    );
}
