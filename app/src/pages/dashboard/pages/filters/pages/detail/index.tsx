import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Button, Chip, Switch, Tabs } from "@heroui/react";
import { ArrowLeft, Play } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import { SOURCE_LABEL } from "@/features/leads/constants/source-options";
import {
    useFilter,
    useLatestFilterJob,
    useRunFilter,
    useUpdateFilter,
} from "@/features/filters/hooks/use-filters";
import { Routes } from "@/routes/routes";

const TABS: Array<{ id: string; label: string }> = [
    { id: "contacts", label: "Contacts" },
    { id: "jobs", label: "Jobs" },
    { id: "edit", label: "Edit" },
];

const CHANNEL_LABEL: Record<Channel, string> = {
    [Channel.EMAIL]: "Email",
    [Channel.SMS]: "SMS",
    [Channel.LINKEDIN]: "LinkedIn",
};

export default function FilterDetailPage() {
    const { uuid } = useParams<{ uuid: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { data: filter, isLoading } = useFilter(uuid);
    const updateFilter = useUpdateFilter();
    const runFilter = useRunFilter();
    const { isActive: isJobActive } = useLatestFilterJob(uuid);

    const currentTab =
        TABS.find((t) => location.pathname.endsWith(`/${t.id}`))?.id ?? "contacts";

    const isManual = filter?.source_type === "MANUAL";
    const runBusy = runFilter.isPending || isJobActive;

    return (
        <div className="space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => navigate(Routes.dashboard.filters)}
                        aria-label="Back to filters"
                    >
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold text-foreground truncate">
                            {isLoading
                                ? "Loading…"
                                : filter?.name ?? "Filter not found"}
                        </h1>
                        {filter && (
                            <div className="flex items-center gap-1.5 flex-wrap mt-1">
                                <Chip size="sm" variant="soft">
                                    <Chip.Label>
                                        {SOURCE_LABEL[filter.source_type]}
                                    </Chip.Label>
                                </Chip>
                                {filter.channels.map((c) => (
                                    <Chip key={c} size="sm" variant="soft" color="accent">
                                        <Chip.Label>{CHANNEL_LABEL[c]}</Chip.Label>
                                    </Chip>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {filter && (
                    <div className="flex items-center gap-3">
                        <Switch
                            isSelected={filter.enabled}
                            isDisabled={updateFilter.isPending}
                            onChange={(next) =>
                                updateFilter.mutate({
                                    uuid: filter.uuid,
                                    payload: { enabled: next },
                                })
                            }
                            aria-label="Enabled"
                        >
                            <Switch.Control>
                                <Switch.Thumb />
                            </Switch.Control>
                        </Switch>
                        <Button
                            isDisabled={runBusy || isManual || !filter.enabled}
                            isPending={runBusy}
                            onPress={() => runFilter.mutate(filter.uuid)}
                            aria-label={
                                isManual
                                    ? "Manual filters cannot be run"
                                    : "Run filter now"
                            }
                        >
                            <Play className="size-4" />
                            {isJobActive ? "Running…" : "Run Now"}
                        </Button>
                    </div>
                )}
            </div>

            <Tabs
                selectedKey={currentTab}
                onSelectionChange={(key) =>
                    navigate(`/dashboard/filters/${uuid}/${key}`)
                }
            >
                <Tabs.List className="inline-flex gap-1 rounded-lg bg-surface-secondary p-1 border border-border">
                    {TABS.map((t) => (
                        <Tabs.Tab
                            key={t.id}
                            id={t.id}
                            className="px-3 py-1.5 text-sm font-medium rounded-md cursor-pointer transition-colors text-muted hover:text-foreground data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        >
                            {t.label}
                        </Tabs.Tab>
                    ))}
                </Tabs.List>
            </Tabs>

            <div className="pt-2">
                <Outlet />
            </div>
        </div>
    );
}
