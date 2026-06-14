import type { FC, ReactNode } from "react";
import { Button } from "@heroui/react";
import { ChevronsUpDown, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Routes } from "@/routes/routes";

interface ContactTableNameCellProps {
    contactUuid: string;
    name: string | null | undefined;
    onOpen?: (contactUuid: string) => void;
}

export const ContactTableNameCell: FC<ContactTableNameCellProps> = ({
    contactUuid,
    name,
    onOpen,
}) => {
    const label = name ?? "—";

    if (onOpen) {
        return (
            <button
                type="button"
                onClick={() => onOpen(contactUuid)}
                className="font-medium text-foreground truncate text-left hover:text-accent transition-colors max-w-full"
            >
                {label}
            </button>
        );
    }

    return <span className="font-medium text-foreground truncate">{label}</span>;
};

interface ContactTableQuickViewButtonProps {
    contactUuid: string;
    contactName: string | null | undefined;
    onOpen?: (contactUuid: string) => void;
}

export const ContactTableQuickViewButton: FC<ContactTableQuickViewButtonProps> = ({
    contactUuid,
    contactName,
    onOpen,
}) => {
    if (!onOpen) return null;

    return (
        <Button
            size="sm"
            variant="tertiary"
            onPress={() => onOpen(contactUuid)}
            aria-label={`Quick view ${contactName ?? "contact"}`}
        >
            <ChevronsUpDown className="size-3.5" />
        </Button>
    );
};

interface ContactTableDetailLinkProps {
    contactUuid: string;
    contactName: string | null | undefined;
    children?: ReactNode;
}

export const ContactTableDetailLink: FC<ContactTableDetailLinkProps> = ({
    contactUuid,
    contactName,
    children,
}) => {
    const detailHref = Routes.dashboard.contacts_detail.replace(":uuid", contactUuid);

    return (
        <Link
            to={detailHref}
            aria-label={`Open ${contactName ?? "contact"} in full page`}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted hover:text-accent hover:bg-surface-secondary transition-colors"
        >
            {children ?? <ExternalLink className="size-3.5" />}
        </Link>
    );
};
