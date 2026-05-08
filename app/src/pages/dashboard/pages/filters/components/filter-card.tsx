import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, Switch } from "@heroui/react";
import {
    Calendar,
    History as HistoryIcon,
    Pencil,
    Play,
    Trash,
} from "lucide-react";
import cronstrue from "cronstrue";
import { SOURCE_LABEL } from "@/features/leads/constants/source-options";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { JobStatus, type Filter, type FilterJob } from "@/features/filters/interfaces/filter.interface";
import { SourceType } from "@/features/leads/interfaces/lead.interface";
import {
    useDeleteFilter,
    useFilterJobs,
    useRunFilter,
    useUpdateFilter,
} from "@/features/filters/hooks/use-filters";
import { Routes } from "@/routes/routes";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const CHANNEL_LABEL: Record<Channel, string> = {
    [Channel.EMAIL]: "Email",
    [Channel.SMS]: "SMS",
    [Channel.LINKEDIN]: "LinkedIn",
};

const JOB_STATUS_COLOR: Record<JobStatus, "default" | "success" | "warning" | "danger"> = {
    [JobStatus.PENDING]: "default",
    [JobStatus.RUNNING]: "warning",
    [JobStatus.COMPLETED]: "success",
    [JobStatus.FAILED]: "danger",
};

const humanizeCron = (expr: string | null): string => {
    if (!expr) return "No schedule";
    try {
        return cronstrue.toString(expr);
    } catch {
        return expr;
    }
};

interface FilterCardProps {
    filter: Filter;
}

export function FilterCard({ filter }: FilterCardProps) {
    const navigate = useNavigate();
    const updateFilter = useUpdateFilter();
    const runFilter = useRunFilter();
    const deleteFilter = useDeleteFilter();

    const { data: jobsPage } = useFilterJobs(filter.uuid, { page: 1, limit: 1 });
    const lastJob: FilterJob | undefined = jobsPage?.items[0];
    const isJobActive =
        lastJob?.status === JobStatus.RUNNING || lastJob?.status === JobStatus.PENDING;

    const [confirmOpen, setConfirmOpen] = useState(false);

    const isManual = filter.source_type === SourceType.MANUAL;
    const runBusy = runFilter.isPending || isJobActive;
    const runDisabled = runBusy || isManual || !filter.enabled;

    const handleToggle = (next: boolean) => {
        updateFilter.mutate({ uuid: filter.uuid, payload: { enabled: next } });
    };

    const handleConfirmDelete = async () => {
        await deleteFilter.mutateAsync(filter.uuid);
        setConfirmOpen(false);
    };

    const goToDetail = () =>
        navigate(Routes.dashboard.filters_detail.replace(":uuid", filter.uuid));

    const stopBubble = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={goToDetail}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    goToDetail();
                }
            }}
            className="bg-surface rounded-xl border border-border p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 @container cursor-pointer transition-colors hover:border-accent/40 hover:bg-surface-secondary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-foreground truncate">
                        {filter.name}
                    </h3>
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <Chip size="sm" variant="soft">
                            <Chip.Label>{SOURCE_LABEL[filter.source_type]}</Chip.Label>
                        </Chip>
                        {filter.channels.map((c) => (
                            <Chip key={c} size="sm" variant="soft" color="accent">
                                <Chip.Label>{CHANNEL_LABEL[c]}</Chip.Label>
                            </Chip>
                        ))}
                    </div>
                </div>
                <div onClick={stopBubble} className="shrink-0 mt-0.5">
                    <Switch
                        isSelected={filter.enabled}
                        isDisabled={updateFilter.isPending}
                        onChange={handleToggle}
                        aria-label={filter.enabled ? "Disable filter" : "Enable filter"}
                    >
                        <Switch.Control>
                            <Switch.Thumb />
                        </Switch.Control>
                    </Switch>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted min-w-0">
                <Calendar className="size-4 shrink-0" />
                <span className="truncate">{humanizeCron(filter.cron_schedule)}</span>
            </div>

            {lastJob && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                    <span className="text-muted">Last run:</span>
                    <Chip size="sm" variant="soft" color={JOB_STATUS_COLOR[lastJob.status]}>
                        <Chip.Label>{lastJob.status}</Chip.Label>
                    </Chip>
                    {lastJob.status === JobStatus.COMPLETED && (
                        <span className="text-muted">{lastJob.leads_found} leads</span>
                    )}
                    <span className="text-muted ml-auto whitespace-nowrap">
                        {new Date(lastJob.started_at).toLocaleString()}
                    </span>
                </div>
            )}

            <div
                onClick={stopBubble}
                className="flex flex-wrap items-center gap-2 mt-auto pt-1"
            >
                <Button
                    size="sm"
                    isDisabled={runDisabled}
                    isPending={runBusy}
                    onPress={() => runFilter.mutate(filter.uuid)}
                    aria-label={
                        isManual ? "Manual filters cannot be run" : "Run filter now"
                    }
                >
                    <Play className="size-3.5" />
                    <span className="hidden @[18rem]:inline">
                        {runBusy ? "Running…" : "Run Now"}
                    </span>
                    <span className="@[18rem]:hidden">
                        {runBusy ? "Running" : "Run"}
                    </span>
                </Button>
                <Button
                    size="sm"
                    variant="secondary"
                    onPress={() =>
                        navigate(Routes.dashboard.filters_edit.replace(":uuid", filter.uuid))
                    }
                    aria-label="Edit filter"
                >
                    <Pencil className="size-3.5" />
                    <span className="hidden @[20rem]:inline">Edit</span>
                </Button>
                <Button
                    size="sm"
                    variant="tertiary"
                    onPress={() =>
                        navigate(Routes.dashboard.filters_jobs.replace(":uuid", filter.uuid))
                    }
                    aria-label="View job history"
                >
                    <HistoryIcon className="size-3.5" />
                    <span className="hidden @[22rem]:inline">History</span>
                </Button>
                <Button
                    size="sm"
                    variant="tertiary"
                    className="ml-auto text-danger"
                    isDisabled={deleteFilter.isPending}
                    onPress={() => setConfirmOpen(true)}
                    aria-label="Delete filter"
                >
                    <Trash className="size-3.5" />
                </Button>
            </div>

            <ConfirmDialog
                isOpen={confirmOpen}
                onOpenChange={setConfirmOpen}
                title={`Delete filter "${filter.name}"?`}
                description="This will permanently delete the filter and unschedule any future runs. Contacts already created from this filter are kept."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                isPending={deleteFilter.isPending}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}
