import { Chip } from "@heroui/react";
import { Activity, CheckCircle2, Database, ExternalLink, HardDrive, RefreshCw, Server, XCircle } from "lucide-react";
import { ApiRoutes } from "@/config/api/routes";
import { environments } from "@/config/environments";
import { useAdminSystemStatus } from "@/features/admin-system-status/hooks/use-admin-system-status";
import {
    SystemServiceStatuses,
    type SystemServiceHealth,
    type SystemServiceStatus,
} from "@/features/admin-system-status/interfaces/system-status.interface";
import { cn } from "@/lib/utils";

const bullBoardUrl = new URL(ApiRoutes.admin.queues, environments.API_URL).href;

type ChipColor = "default" | "accent" | "success" | "warning" | "danger";

const STATUS_META: Record<SystemServiceStatus, { label: string; color: ChipColor; icon: React.ComponentType<{ className?: string }> }> = {
    [SystemServiceStatuses.UP]: { label: "Healthy", color: "success", icon: CheckCircle2 },
    [SystemServiceStatuses.DOWN]: { label: "Unavailable", color: "danger", icon: XCircle },
    [SystemServiceStatuses.NOT_CONFIGURED]: { label: "Not configured", color: "default", icon: XCircle },
};

function formatUptime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3_600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86_400) return `${Math.floor(seconds / 3_600)}h`;
    return `${Math.floor(seconds / 86_400)}d`;
}

function StatusChip({ status }: { status: SystemServiceStatus }) {
    const { label, color, icon: Icon } = STATUS_META[status];
    return (
        <Chip size="sm" variant="soft" color={color}>
            <Icon className="size-3" />
            <Chip.Label>{label}</Chip.Label>
        </Chip>
    );
}

function StatusCard({
    title,
    icon: Icon,
    health,
    detail,
    isLoading,
}: {
    title: string;
    icon: React.ElementType;
    health?: SystemServiceHealth & { uptime_seconds?: number };
    detail?: string;
    isLoading?: boolean;
}) {
    return (
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="size-4 text-muted shrink-0" />
                    <h2 className="text-sm font-medium text-foreground">{title}</h2>
                </div>
                {isLoading ? (
                    <div className="h-6 w-16 rounded-full bg-surface-secondary animate-pulse" />
                ) : health ? (
                    <StatusChip status={health.status} />
                ) : null}
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    <div className="h-3 w-24 rounded bg-surface-secondary animate-pulse" />
                    <div className="h-3 w-32 rounded bg-surface-secondary animate-pulse" />
                </div>
            ) : health ? (
                <div className="space-y-1 text-xs text-muted">
                    {health.latency_ms != null ? (
                        <p>
                            Response time: <span className="text-foreground tabular-nums">{health.latency_ms} ms</span>
                        </p>
                    ) : null}
                    {health.uptime_seconds != null ? (
                        <p>
                            Process uptime: <span className="text-foreground tabular-nums">{formatUptime(health.uptime_seconds)}</span>
                        </p>
                    ) : null}
                    {detail ? <p>{detail}</p> : null}
                    {health.message ? <p className="text-[color:var(--danger,#ef4444)]">{health.message}</p> : null}
                </div>
            ) : null}
        </div>
    );
}

export default function AdminSystemStatusPage() {
    const { data, isLoading, isFetching, refetch } = useAdminSystemStatus();

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                    <Activity className="size-5 text-muted shrink-0" />
                    <div>
                        <h1 className="text-lg font-semibold text-foreground leading-tight">System Status</h1>
                        <p className="text-xs text-muted mt-0.5">
                            Health of the API server, database, Redis, and background job infrastructure
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className={cn(
                        "inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-secondary",
                        isFetching && "opacity-60 cursor-not-allowed",
                    )}
                >
                    <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
                    Refresh health checks
                </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <StatusCard
                    title="API server"
                    icon={Server}
                    health={data?.api}
                    detail="NestJS application responding to requests"
                    isLoading={isLoading}
                />
                <StatusCard
                    title="PostgreSQL database"
                    icon={Database}
                    health={data?.database}
                    detail="Primary data store connectivity"
                    isLoading={isLoading}
                />
                <StatusCard
                    title="Redis"
                    icon={HardDrive}
                    health={data?.redis}
                    detail="BullMQ queues and caching layer"
                    isLoading={isLoading}
                />
            </div>

            <div className="rounded-xl border border-border bg-surface p-5 max-w-lg space-y-3">
                <div>
                    <h2 className="text-sm font-medium text-foreground">Background job queues</h2>
                    <p className="text-sm text-muted mt-1">
                        Open Bull Board to inspect queued jobs, workers, and processing history. Uses separate
                        Bull Board credentials, not your app login.
                    </p>
                </div>
                <a
                    href={bullBoardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-secondary"
                    style={{
                        background: "color-mix(in oklch, var(--accent) 12%, transparent)",
                        boxShadow: "inset 0 0 0 1px color-mix(in oklch, var(--accent) 22%, transparent)",
                    }}
                >
                    Open Bull Board dashboard
                    <ExternalLink className="size-4 text-muted" />
                </a>
            </div>
        </div>
    );
}
