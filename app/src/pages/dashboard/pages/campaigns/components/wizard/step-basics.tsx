import { Input, Label, TextArea, TextField } from "@heroui/react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { cn } from "@/lib/utils";
import { Mail, MessageSquare } from "lucide-react";

export interface BasicsValues {
    name: string;
    description: string;
    channels: Channel[];
    scheduled_at: string | null;
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
        </div>
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
