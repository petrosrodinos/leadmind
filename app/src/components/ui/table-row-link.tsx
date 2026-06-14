import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface TableCellLinkProps {
    to: string;
    children: ReactNode;
    className?: string;
    ariaLabel?: string;
}

export function TableCellLink({ to, children, className, ariaLabel }: TableCellLinkProps) {
    return (
        <Link
            to={to}
            aria-label={ariaLabel}
            className={cn("block text-inherit hover:text-accent transition-colors", className)}
        >
            {children}
        </Link>
    );
}

export const tableNavRowClassName = "hover:bg-surface-secondary/50";

export const tableNavInteractiveCellClassName = "relative z-[1]";

export function isTableNavInteractiveCell(columnId: string, interactiveColumnIds: string[] = ["actions"]): boolean {
    return interactiveColumnIds.includes(columnId);
}

interface RenderTableNavCellContentOptions {
    interactiveColumnIds?: string[];
    primaryColumnId?: string;
    ariaLabel?: string;
    linkClassName?: string;
}

export function renderTableNavCellContent(
    columnId: string,
    href: string,
    content: ReactNode,
    options: RenderTableNavCellContentOptions = {},
) {
    const interactiveColumnIds = options.interactiveColumnIds ?? ["actions"];

    if (isTableNavInteractiveCell(columnId, interactiveColumnIds)) {
        return content;
    }

    return (
        <TableCellLink
            to={href}
            className={options.linkClassName}
            ariaLabel={columnId === options.primaryColumnId ? options.ariaLabel : undefined}
        >
            {content}
        </TableCellLink>
    );
}
