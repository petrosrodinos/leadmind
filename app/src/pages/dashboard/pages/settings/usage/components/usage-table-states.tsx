import { Table } from "@heroui/react";

export function UsageTableSkeleton({ columns, rows = 5 }: { columns: number; rows?: number }) {
    return (
        <>
            {Array.from({ length: rows }).map((_, i) => (
                <Table.Row key={`sk-${i}`} id={`sk-${i}`}>
                    {Array.from({ length: columns }).map((__, j) => (
                        <Table.Cell key={j}>
                            <div className="h-4 w-3/4 rounded bg-surface-secondary animate-pulse" />
                        </Table.Cell>
                    ))}
                </Table.Row>
            ))}
        </>
    );
}

export function UsageTableEmpty({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center py-12 text-center text-sm text-muted">
            {message}
        </div>
    );
}
