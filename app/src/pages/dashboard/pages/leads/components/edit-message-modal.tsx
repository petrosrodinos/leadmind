import { useEffect, useState } from "react";
import { Button, Input, Label, Modal, TextArea, TextField } from "@heroui/react";
import { Send, Save } from "lucide-react";
import {
    Channel,
    type OutreachMessage,
} from "@/features/contacts/interfaces/contact.interface";
import {
    useSendOutreachMessage,
    useUpdateOutreachMessage,
} from "@/features/outreach/hooks/use-outreach";

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
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");

    const update = useUpdateOutreachMessage();
    const send = useSendOutreachMessage();

    useEffect(() => {
        if (message) {
            setSubject(message.subject ?? "");
            setContent(message.content ?? "");
        }
    }, [message]);

    if (!message) return null;

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
        onOpenChange(false);
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-2xl">
                    <Modal.CloseTrigger />
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
                                <TextArea
                                    id="message-content"
                                    aria-label="Message content"
                                    rows={10}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button slot="close" variant="secondary">
                            Cancel
                        </Button>
                        <Button
                            variant="tertiary"
                            isDisabled={!dirty || update.isPending}
                            isPending={update.isPending}
                            onPress={handleSave}
                        >
                            <Save className="size-4" />
                            Save draft
                        </Button>
                        <Button
                            isDisabled={send.isPending || update.isPending}
                            isPending={send.isPending}
                            onPress={handleSend}
                        >
                            <Send className="size-4" />
                            Send
                        </Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
}
