import { Checkbox, Input, Label, TextArea, TextField } from "@heroui/react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { CampaignType } from "@/features/marketing-campaigns/interfaces/campaign.interface";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare, Sparkles, LayoutTemplate } from "lucide-react";

export interface BasicsValues {
    name: string;
    description: string;
    campaign_type: CampaignType;
    channels: Channel[];
    scheduled_at: string | null;
    use_openai_batch: boolean;
}

interface StepBasicsProps {
    value: BasicsValues;
    onChange: (patch: Partial<BasicsValues>) => void;
}

export function StepBasics({ value, onChange }: StepBasicsProps) {
    const activeChannel = value.channels[0];
    const selectChannel = (c: Channel) => {
        if (activeChannel === c) return;
        onChange({ channels: [c] });
    };
    const selectType = (t: CampaignType) => {
        if (value.campaign_type === t) return;
        const patch: Partial<BasicsValues> = { campaign_type: t };
        if (t === CampaignType.PERSONALIZED) {
            patch.scheduled_at = null;
            patch.use_openai_batch = true;
        } else {
            patch.use_openai_batch = false;
        }
        onChange(patch);
    };

    return (
        <div className="flex flex-col gap-5 max-w-2xl">
            <TextField name="name">
                <Label>Name</Label>
                <Input
                    placeholder="Q2 product launch"
                    value={value.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    maxLength={120}
                />
            </TextField>

            <TextField name="description">
                <Label>Description (optional)</Label>
                <TextArea
                    rows={3}
                    placeholder="Internal context for this campaign"
                    value={value.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    maxLength={1000}
                />
            </TextField>

            <div role="radiogroup" aria-label="Campaign type">
                <Label>Campaign type</Label>
                <div className="mt-2 flex gap-2 flex-wrap">
                    <TypeChip
                        active={value.campaign_type === CampaignType.STANDARD}
                        onClick={() => selectType(CampaignType.STANDARD)}
                        icon={LayoutTemplate}
                        label="Standard"
                        description="Same template for all contacts"
                    />
                    <TypeChip
                        active={value.campaign_type === CampaignType.PERSONALIZED}
                        onClick={() => selectType(CampaignType.PERSONALIZED)}
                        icon={Sparkles}
                        label="Personalized"
                        description="Unique AI draft per contact"
                    />
                </div>
                {value.campaign_type === CampaignType.PERSONALIZED && (
                    <div className="mt-3">
                        <Checkbox
                            isSelected={value.use_openai_batch}
                            onChange={(checked: boolean) => onChange({ use_openai_batch: checked })}
                        >
                            <Checkbox.Control>
                                <Checkbox.Indicator />
                            </Checkbox.Control>
                            <span className="text-xs text-muted">
                                Use OpenAI Batch API to generate personalized messages (50% cheaper,
                                results within 24h)
                            </span>
                        </Checkbox>
                    </div>
                )}
            </div>

            <div role="radiogroup" aria-label="Channel">
                <Label>Channel</Label>
                <div className="mt-2 flex gap-2 flex-wrap">
                    <ChannelChip
                        active={activeChannel === Channel.EMAIL}
                        onClick={() => selectChannel(Channel.EMAIL)}
                        icon={Mail}
                        label="Email"
                    />
                    <ChannelChip
                        active={activeChannel === Channel.SMS}
                        onClick={() => selectChannel(Channel.SMS)}
                        icon={MessageSquare}
                        label="SMS"
                    />
                </div>
                <p className="text-xs text-muted mt-1">
                    Pick one channel — each contact receives a single message.
                </p>
            </div>

            {value.campaign_type === CampaignType.STANDARD && (
                <TextField name="scheduled_at">
                    <Label>Schedule (optional)</Label>
                    <Input
                        type="datetime-local"
                        value={value.scheduled_at ?? ""}
                        onChange={(e) =>
                            onChange({
                                scheduled_at: e.target.value || null,
                            })
                        }
                    />
                    <p className="text-xs text-muted mt-1">
                        If empty, the campaign starts immediately when you press Start. Otherwise
                        it queues for this time.
                    </p>
                </TextField>
            )}
        </div>
    );
}

interface TypeChipProps {
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    description: string;
}

function TypeChip({ active, onClick, icon: Icon, label, description }: TypeChipProps) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={active}
            onClick={onClick}
            className={cn(
                "inline-flex items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors text-left w-48",
                active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted hover:text-foreground",
            )}
        >
            <Icon className="size-4 mt-0.5 shrink-0" />
            <div>
                <div className="font-medium">{label}</div>
                <div className={cn("text-xs mt-0.5", active ? "text-accent/70" : "text-muted")}>{description}</div>
            </div>
        </button>
    );
}

interface ChannelChipProps {
    active: boolean;
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
}

function ChannelChip({ active, onClick, icon: Icon, label }: ChannelChipProps) {
    return (
        <button
            type="button"
            role="radio"
            aria-checked={active}
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors",
                active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted hover:text-foreground",
            )}
        >
            <Icon className="size-4" />
            {label}
        </button>
    );
}
