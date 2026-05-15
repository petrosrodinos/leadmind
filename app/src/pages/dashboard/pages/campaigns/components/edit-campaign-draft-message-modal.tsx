import { useEffect, useState, type FC } from "react";
import { Modal } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import type { DraftMessage } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import {
    MessageComposer,
    type MessageComposerValue,
} from "@/features/messaging/components/message-composer";
import { useUpdateOutreachMessage } from "@/features/outreach/hooks/use-outreach";
import { isEmailHtmlEmpty } from "@/lib/sanitize-html";

interface EditCampaignDraftMessageModalProps {
    msg: DraftMessage;
    campaignUuid: string;
    onClose: () => void;
}

function valueFromDraft(msg: DraftMessage): MessageComposerValue {
    const isEmail = msg.channel === Channel.EMAIL;
    return {
        emailSubject: isEmail ? (msg.subject ?? "") : "",
        emailContent: isEmail ? msg.content : "",
        smsContent: !isEmail ? msg.content : "",
    };
}

export const EditCampaignDraftMessageModal: FC<EditCampaignDraftMessageModalProps> = ({
    msg,
    campaignUuid,
    onClose,
}) => {
    const update = useUpdateOutreachMessage();
    const [value, setValue] = useState<MessageComposerValue>(valueFromDraft(msg));

    useEffect(() => {
        setValue(valueFromDraft(msg));
    }, [msg]);

    const isEmail = msg.channel === Channel.EMAIL;
    const contentEmpty = isEmail
        ? isEmailHtmlEmpty(value.emailContent)
        : value.smsContent.trim().length === 0;

    const handleSave = async () => {
        if (contentEmpty || update.isPending) return;
        const payload =
            msg.channel === Channel.EMAIL
                ? { subject: value.emailSubject.trim() || undefined, content: value.emailContent }
                : { content: value.smsContent };
        await update.mutateAsync({
            uuid: msg.uuid,
            payload,
            contact_uuid: msg.contact_uuid,
            campaign_uuid: campaignUuid,
        });
        onClose();
    };

    return (
        <Modal.Backdrop isOpen onOpenChange={(open) => { if (!open) onClose(); }}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Edit draft</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 gap-4">
                        <MessageComposer
                            channels={[msg.channel]}
                            activeChannel={msg.channel}
                            onActiveChannelChange={() => {}}
                            value={value}
                            onChange={(patch) => setValue((prev) => ({ ...prev, ...patch }))}
                            disabled={update.isPending}
                        />
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end p-6 pt-0">
                        <ActionButtonWithPending variant="tertiary" onPress={onClose} isDisabled={update.isPending}>
                            Cancel
                        </ActionButtonWithPending>
                        <ActionButtonWithPending
                            variant="primary"
                            isDisabled={contentEmpty}
                            isPending={update.isPending}
                            onPress={handleSave}
                        >
                            Save
                        </ActionButtonWithPending>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};
