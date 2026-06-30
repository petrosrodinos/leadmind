import { useEffect } from "react";
import { Label, ListBox, Select } from "@heroui/react";
import { Link } from "react-router-dom";
import { useSenderProfiles } from "@/features/sender-profiles/hooks/use-sender-profiles";
import {
    formatSenderProfileLabel,
    resolveDefaultSenderProfileUuid,
} from "@/features/sender-profiles/utils/sender-profile-utils";
import { Routes } from "@/routes/routes";

export interface SenderProfileSelectProps {
    value: string | null;
    onChange: (uuid: string) => void;
    disabled?: boolean;
}

export function SenderProfileSelect({
    value,
    onChange,
    disabled = false,
}: SenderProfileSelectProps) {
    const { data: profiles, isLoading } = useSenderProfiles();

    useEffect(() => {
        if (isLoading || !profiles?.length) return;
        if (value && profiles.some((profile) => profile.uuid === value)) {
            return;
        }
        const defaultUuid = resolveDefaultSenderProfileUuid(profiles);
        if (defaultUuid) {
            onChange(defaultUuid);
        }
    }, [isLoading, onChange, profiles, value]);

    if (isLoading) {
        return <p className="text-sm text-muted">Loading sender profiles…</p>;
    }

    if (!profiles?.length) {
        return (
            <div className="rounded-xl border border-border bg-surface-secondary/40 px-4 py-3 text-sm text-muted">
                No sender profiles found.{" "}
                <Link
                    to={Routes.dashboard.sender_profiles}
                    className="font-medium text-foreground underline-offset-2 hover:underline"
                >
                    Create a sender profile
                </Link>
                .
            </div>
        );
    }

    return (
        <div className="space-y-1.5">
            <Label className="text-sm text-foreground">Sender profile</Label>
            <Select
                aria-label="Sender profile"
                selectedKey={value}
                onSelectionChange={(key) => {
                    if (typeof key === "string" && key) {
                        onChange(key);
                    }
                }}
                isDisabled={disabled}
            >
                <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                    <ListBox>
                        {profiles.map((profile) => {
                            const label = formatSenderProfileLabel(profile);
                            const textValue = profile.is_default ? `${label} (Default)` : label;
                            return (
                                <ListBox.Item
                                    key={profile.uuid}
                                    id={profile.uuid}
                                    textValue={textValue}
                                >
                                    <span className="flex min-w-0 flex-1 items-center gap-2">
                                        <span className="truncate">{label}</span>
                                        {profile.is_default ? (
                                            <span className="shrink-0 text-xs text-muted">
                                                Default
                                            </span>
                                        ) : null}
                                    </span>
                                    <ListBox.ItemIndicator />
                                </ListBox.Item>
                            );
                        })}
                    </ListBox>
                </Select.Popover>
            </Select>
            <p className="text-xs text-muted">
                Used for placeholders like signature, company, and reply-to email.
            </p>
        </div>
    );
}
