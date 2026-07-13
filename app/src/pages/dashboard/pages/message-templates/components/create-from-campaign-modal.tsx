import { useEffect, useState, type FC } from "react";
import { Button, FieldError, Input, Label, ListBox, Modal, Select } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { useCampaigns } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import { useCreateTemplateFromCampaign } from "@/features/message-templates/hooks/use-message-templates";

interface CreateFromCampaignModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSaved?: () => void;
    preselectedCampaignUuid?: string | null;
}

export const CreateFromCampaignModal: FC<CreateFromCampaignModalProps> = ({
    isOpen,
    onOpenChange,
    onSaved,
    preselectedCampaignUuid = null,
}) => {
    const { data: campaignsPage, isLoading } = useCampaigns({ page: 1, limit: 100 });
    const createMut = useCreateTemplateFromCampaign();

    const [campaignUuid, setCampaignUuid] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [error, setError] = useState<string | null>(null);

    const campaigns = campaignsPage?.data ?? [];

    useEffect(() => {
        if (!isOpen) return;
        setCampaignUuid(preselectedCampaignUuid);
        setName("");
        setError(null);
    }, [isOpen, preselectedCampaignUuid]);

    const handleCreate = async () => {
        if (!campaignUuid) {
            setError("Select a campaign");
            return;
        }
        setError(null);
        await createMut.mutateAsync({
            campaignUuid,
            payload: name.trim() ? { name: name.trim() } : undefined,
        });
        onSaved?.();
        onOpenChange(false);
    };

    return (
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-md">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <Modal.Heading>Create from campaign</Modal.Heading>
                    </Modal.Header>
                    <Modal.Body className="p-6 space-y-4">
                        <p className="text-sm text-muted">
                            Copy email or SMS content from an existing campaign into a reusable template.
                        </p>
                        <div className="flex flex-col gap-1.5">
                            <Label>Campaign</Label>
                            <Select
                                aria-label="Campaign"
                                value={campaignUuid ?? undefined}
                                onChange={(v) => setCampaignUuid(typeof v === "string" ? v : null)}
                                isDisabled={isLoading || !!preselectedCampaignUuid}
                            >
                                <Select.Trigger>
                                    <Select.Value placeholder="Select campaign" />
                                    <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                    <ListBox>
                                        {campaigns.map((c) => (
                                            <ListBox.Item key={c.uuid} id={c.uuid} textValue={c.name}>
                                                {c.name}
                                                <ListBox.ItemIndicator />
                                            </ListBox.Item>
                                        ))}
                                    </ListBox>
                                </Select.Popover>
                            </Select>
                            {error ? <FieldError>{error}</FieldError> : null}
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="from-campaign-name">Template name (optional)</Label>
                            <Input
                                id="from-campaign-name"
                                placeholder="Defaults to campaign name + template"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="gap-2 justify-end">
                        <Button size="sm" variant="tertiary" onPress={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <ActionButtonWithPending
                            size="sm"
                            isDisabled={createMut.isPending}
                            isPending={createMut.isPending}
                            onPress={() => void handleCreate()}
                        >
                            Create template
                        </ActionButtonWithPending>
                    </Modal.Footer>
                </Modal.Dialog>
            </Modal.Container>
        </Modal.Backdrop>
    );
};
