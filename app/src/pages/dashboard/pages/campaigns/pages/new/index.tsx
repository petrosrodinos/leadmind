import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { ChevronLeft, Save } from "lucide-react";
import { useCreateCampaign } from "@/features/marketing-campaigns/hooks/use-marketing-campaigns";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { Routes } from "@/routes/routes";
import {
    StepBasics,
    type BasicsValues,
} from "../../components/wizard/step-basics";

export default function NewCampaignPage() {
    const navigate = useNavigate();
    const createMutation = useCreateCampaign();

    const [basics, setBasics] = useState<BasicsValues>({
        name: "",
        description: "",
        channels: [Channel.EMAIL],
        scheduled_at: null,
    });

    const canSave = basics.name.trim().length > 0 && basics.channels.length === 1;

    const handleSave = async () => {
        if (!canSave) return;
        try {
            const campaign = await createMutation.mutateAsync({
                name: basics.name.trim(),
                description: basics.description.trim() || undefined,
                channels: basics.channels,
                scheduled_at: basics.scheduled_at
                    ? new Date(basics.scheduled_at).toISOString()
                    : undefined,
            });
            navigate(`/dashboard/campaigns/${campaign.uuid}/edit?step=audience`);
        } catch {
            // toast surfaced
        }
    };

    return (
        <div className="space-y-6">
            <Link
                to={Routes.dashboard.campaigns}
                className="inline-flex items-center text-sm text-muted hover:text-foreground"
            >
                <ChevronLeft className="size-4" /> Back to campaigns
            </Link>
            <header>
                <h1 className="text-xl font-semibold text-foreground">New campaign</h1>
                <p className="text-sm text-muted">
                    Give the campaign a name and pick its channel. You'll choose the audience and
                    write the message in the next steps.
                </p>
            </header>

            <StepBasics value={basics} onChange={(p) => setBasics((v) => ({ ...v, ...p }))} />

            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <Link to={Routes.dashboard.campaigns}>
                    <Button variant="secondary">Cancel</Button>
                </Link>
                <Button
                    onPress={handleSave}
                    isDisabled={!canSave}
                    isPending={createMutation.isPending}
                >
                    <Save className="size-4" />
                    Save & continue
                </Button>
            </div>
        </div>
    );
}
