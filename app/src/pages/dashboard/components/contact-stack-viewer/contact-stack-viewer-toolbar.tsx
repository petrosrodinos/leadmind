import type { FC } from "react";
import { Button } from "@heroui/react";
import { ChevronDown, ChevronUp, ExternalLink, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Routes } from "@/routes/routes";
import { cn } from "@/lib/utils";
import type { ContactStackNavigationState } from "./types";

interface ContactStackViewerToolbarProps {
    contactUuid: string;
    navigation: ContactStackNavigationState;
    navigationLocked?: boolean;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    className?: string;
}

export const ContactStackViewerToolbar: FC<ContactStackViewerToolbarProps> = ({
    contactUuid,
    navigation,
    navigationLocked = false,
    onClose,
    onPrev,
    onNext,
    className,
}) => {
    const detailHref = Routes.dashboard.contacts_detail.replace(":uuid", contactUuid);

    return (
        <div
            className={cn(
                "flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface shrink-0",
                className,
            )}
        >
            <Button size="sm" variant="tertiary" onPress={onClose} aria-label="Close contact viewer">
                <X className="size-4" />
            </Button>

            <div className="flex items-center gap-1">
                <Button
                    size="sm"
                    variant="tertiary"
                    onPress={onPrev}
                    isDisabled={navigationLocked || !navigation.canGoPrev}
                    aria-label="Previous contact"
                >
                    <ChevronUp className="size-4" />
                </Button>
                <span className="text-sm text-muted tabular-nums min-w-[4.5rem] text-center">
                    {navigation.globalPosition} / {navigation.totalCount}
                </span>
                <Button
                    size="sm"
                    variant="tertiary"
                    onPress={onNext}
                    isDisabled={navigationLocked || !navigation.canGoNext}
                    aria-label="Next contact"
                >
                    <ChevronDown className="size-4" />
                </Button>
            </div>

            <Link
                to={detailHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open contact in full page"
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted hover:text-foreground hover:bg-surface-secondary transition-colors"
            >
                <ExternalLink className="size-4" />
                <span className="hidden sm:inline">Open</span>
            </Link>
        </div>
    );
};
