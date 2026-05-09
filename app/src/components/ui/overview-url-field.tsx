import type { ChangeEvent } from "react";
import { Button, Input, Label } from "@heroui/react";
import { ExternalLink, type LucideIcon } from "lucide-react";
import { normalizeExternalUrl } from "@/utils/url";

export interface OverviewUrlFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
    Icon: LucideIcon;
    openAriaLabel: string;
}

export function OverviewUrlField({
    id,
    label,
    value,
    onChange,
    placeholder,
    Icon,
    openAriaLabel,
}: OverviewUrlFieldProps) {
    const href = normalizeExternalUrl(value);
    const open = () => {
        if (href) window.open(href, "_blank", "noopener,noreferrer");
    };
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <div className="flex gap-1.5 items-center min-w-0">
                <div className="relative flex-1 min-w-0">
                    <button
                        type="button"
                        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-md p-1 text-muted hover:bg-surface-secondary hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                        disabled={!href}
                        onClick={open}
                        aria-label={openAriaLabel}
                    >
                        <Icon className="size-4" />
                    </button>
                    <Input
                        id={id}
                        className="w-full pl-10"
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                    />
                </div>
                <Button
                    type="button"
                    size="sm"
                    variant="tertiary"
                    className="shrink-0"
                    isDisabled={!href}
                    onPress={open}
                    aria-label={openAriaLabel}
                >
                    <ExternalLink className="size-4" />
                </Button>
            </div>
        </div>
    );
}
