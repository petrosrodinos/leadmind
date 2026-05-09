import { Link, useNavigate } from "react-router-dom";
import { Button, Chip } from "@heroui/react";
import {
    ArrowRight,
    ArrowUpRight,
    CheckCircle2,
    Filter as FilterIcon,
    Inbox,
    Mail,
    MessageCircle,
    Phone,
    Plus,
    Send,
    Sparkles,
    TrendingUp,
    Users,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    Channel,
    LeadStatus,
    type Contact,
} from "@/features/contacts/interfaces/contact.interface";
import { useFilters, useLatestFilterJob } from "@/features/filters/hooks/use-filters";
import { JobStatus, type Filter } from "@/features/filters/interfaces/filter.interface";
import {
    useDashboardPendingDrafts,
    useDashboardStats,
    useDashboardTopContacts,
} from "@/features/dashboard/hooks/use-dashboard";
import type {
    DashboardPendingDraftGroup,
    DashboardStats,
} from "@/features/dashboard/interfaces/dashboard.interface";
import { ScoreBadge, StatusChip } from "@/pages/dashboard/pages/leads/components/badges";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

function greetingFor(date: Date): string {
    const h = date.getHours();
    if (h < 5) return "Working late";
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    if (h < 22) return "Good evening";
    return "Working late";
}

function firstName(full_name: string | null | undefined, email: string | null | undefined): string {
    if (full_name && full_name.trim()) return full_name.trim().split(/\s+/)[0]!;
    if (email) return email.split("@")[0]!;
    return "there";
}

const EMPTY_BY_STATUS: Record<LeadStatus, number> = {
    [LeadStatus.NEW]: 0,
    [LeadStatus.CONTACTED]: 0,
    [LeadStatus.CONVERTED]: 0,
    [LeadStatus.ARCHIVED]: 0,
};

export default function DashboardHome() {
    const { full_name, email } = useAuthStore();
    const name = firstName(full_name, email);
    const greeting = greetingFor(new Date());

    const { data: stats, isLoading: statsLoading } = useDashboardStats();
    const { data: topContacts = [], isLoading: topLoading } =
        useDashboardTopContacts(5);
    const { data: pendingGroups = [], isLoading: draftsLoading } =
        useDashboardPendingDrafts(5);
    const { data: filters = [], isLoading: filtersLoading } = useFilters();

    const byStatus = stats?.by_status ?? EMPTY_BY_STATUS;
    const total = stats?.total_contacts ?? 0;

    return (
        <div className="space-y-6">
            <HeroBanner
                greeting={greeting}
                name={name}
                newThisWeek={stats?.new_this_week ?? 0}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <KpiCard
                    label="Total contacts"
                    value={statsLoading ? "—" : total.toLocaleString()}
                    icon={Users}
                    accent="accent"
                    href={Routes.dashboard.contacts}
                />
                <KpiCard
                    label="New this week"
                    value={
                        statsLoading
                            ? "—"
                            : (stats?.new_this_week ?? 0).toLocaleString()
                    }
                    icon={TrendingUp}
                    accent="success"
                    delta={
                        !statsLoading && total > 0 && stats
                            ? `${Math.round((stats.new_this_week / total) * 100)}% of total`
                            : undefined
                    }
                />
                <KpiCard
                    label="Conversion rate"
                    value={
                        statsLoading
                            ? "—"
                            : `${(stats?.conversion_rate ?? 0).toFixed(1)}%`
                    }
                    icon={CheckCircle2}
                    accent="warning"
                    delta={
                        !statsLoading
                            ? `${byStatus[LeadStatus.CONVERTED]} converted`
                            : undefined
                    }
                />
                <KpiCard
                    label="Pending drafts"
                    value={
                        statsLoading
                            ? "—"
                            : (stats?.pending_drafts ?? 0).toLocaleString()
                    }
                    icon={Send}
                    accent="fuchsia"
                    href={Routes.dashboard.contacts}
                />
            </div>

            <PipelineDistribution
                stats={stats}
                isLoading={statsLoading}
            />

            <div className="grid gap-4 lg:grid-cols-3">
                <TopContactsCard contacts={topContacts} isLoading={topLoading} />
                <PendingDraftsCard
                    items={pendingGroups}
                    isLoading={draftsLoading}
                />
            </div>

            <FiltersCard filters={filters} isLoading={filtersLoading} />
        </div>
    );
}

function HeroBanner({
    greeting,
    name,
    newThisWeek,
}: {
    greeting: string;
    name: string;
    newThisWeek: number;
}) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div
                aria-hidden
                className="absolute -top-24 -right-16 size-72 rounded-full bg-accent/20 blur-3xl"
            />
            <div
                aria-hidden
                className="absolute -bottom-32 -left-12 size-72 rounded-full bg-fuchsia-500/15 blur-3xl"
            />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                        {greeting}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
                        {name}, here&apos;s your pipeline at a glance
                    </h1>
                    <p className="text-sm text-muted">
                        {newThisWeek > 0
                            ? `You added ${newThisWeek} new ${newThisWeek === 1 ? "contact" : "contacts"} this week. Keep the momentum.`
                            : "Hunt for leads, score them with AI, and keep the deals moving."}
                    </p>
                </div>
                <HeroActions />
            </div>
        </div>
    );
}

function HeroActions() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-wrap gap-2 sm:shrink-0">
            <Button
                variant="secondary"
                onPress={() => navigate(Routes.dashboard.leads_directory)}
            >
                <Sparkles className="size-4" />
                Find leads
            </Button>
            <Button onPress={() => navigate(Routes.dashboard.filters_new)}>
                <Plus className="size-4" />
                New filter
            </Button>
        </div>
    );
}

const KPI_TONE: Record<
    "accent" | "success" | "warning" | "fuchsia",
    { ring: string; bg: string; text: string }
> = {
    accent: { ring: "ring-accent/20", bg: "bg-accent/10", text: "text-accent" },
    success: {
        ring: "ring-success/20",
        bg: "bg-success-soft/40",
        text: "text-success-soft-foreground",
    },
    warning: {
        ring: "ring-warning/20",
        bg: "bg-warning-soft/40",
        text: "text-warning-soft-foreground",
    },
    fuchsia: {
        ring: "ring-fuchsia-500/20",
        bg: "bg-fuchsia-500/10",
        text: "text-fuchsia-600",
    },
};

function KpiCard({
    label,
    value,
    icon: Icon,
    accent,
    delta,
    href,
}: {
    label: string;
    value: string;
    icon: React.ComponentType<{ className?: string }>;
    accent: keyof typeof KPI_TONE;
    delta?: string;
    href?: string;
}) {
    const tone = KPI_TONE[accent];
    const inner = (
        <div className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-3 hover:border-accent/40 transition-colors h-full">
            <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted uppercase tracking-wide">
                    {label}
                </p>
                <span
                    className={cn(
                        "inline-flex size-9 items-center justify-center rounded-lg",
                        tone.bg,
                        tone.text,
                    )}
                >
                    <Icon className="size-4" />
                </span>
            </div>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-foreground tabular-nums">{value}</p>
                {href && (
                    <ArrowUpRight className="size-4 text-muted ml-auto" aria-hidden />
                )}
            </div>
            {delta && <p className="text-xs text-muted">{delta}</p>}
        </div>
    );

    if (href) {
        return (
            <Link to={href} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-xl">
                {inner}
            </Link>
        );
    }
    return inner;
}

const STATUS_BAR_COLOR: Record<LeadStatus, string> = {
    [LeadStatus.NEW]: "bg-accent",
    [LeadStatus.CONTACTED]: "bg-warning",
    [LeadStatus.CONVERTED]: "bg-success",
    [LeadStatus.ARCHIVED]: "bg-muted",
};

const STATUS_LABEL: Record<LeadStatus, string> = {
    [LeadStatus.NEW]: "New",
    [LeadStatus.CONTACTED]: "Contacted",
    [LeadStatus.CONVERTED]: "Converted",
    [LeadStatus.ARCHIVED]: "Archived",
};

function PipelineDistribution({
    stats,
    isLoading,
}: {
    stats: DashboardStats | undefined;
    isLoading: boolean;
}) {
    const navigate = useNavigate();
    const statuses: LeadStatus[] = [
        LeadStatus.NEW,
        LeadStatus.CONTACTED,
        LeadStatus.CONVERTED,
        LeadStatus.ARCHIVED,
    ];
    const byStatus = stats?.by_status ?? EMPTY_BY_STATUS;
    const total = stats?.total_contacts ?? 0;
    const max = Math.max(total, 1);

    return (
        <section className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Pipeline distribution
                    </h2>
                    <p className="text-xs text-muted">
                        How your contacts move through the funnel.
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="tertiary"
                    onPress={() => navigate(Routes.dashboard.contacts)}
                >
                    Open pipeline
                    <ArrowRight className="size-3.5" />
                </Button>
            </div>

            {isLoading ? (
                <div className="mt-5 h-3 w-full rounded-full bg-surface-secondary animate-pulse" />
            ) : total === 0 ? (
                <p className="mt-5 text-sm text-muted italic">
                    Nothing in the pipeline yet — adopt a lead from the directory to start.
                </p>
            ) : (
                <>
                    <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-surface-secondary">
                        {statuses.map((s) => {
                            const count = byStatus[s] ?? 0;
                            if (count === 0) return null;
                            const pct = (count / max) * 100;
                            return (
                                <div
                                    key={s}
                                    className={cn(STATUS_BAR_COLOR[s], "h-full")}
                                    style={{ width: `${pct}%` }}
                                    title={`${STATUS_LABEL[s]}: ${count}`}
                                />
                            );
                        })}
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {statuses.map((s) => {
                            const count = byStatus[s] ?? 0;
                            const pct = total > 0 ? (count / total) * 100 : 0;
                            return (
                                <div
                                    key={s}
                                    className="flex items-center justify-between gap-2"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span
                                            className={cn(
                                                "size-2 rounded-full shrink-0",
                                                STATUS_BAR_COLOR[s],
                                            )}
                                        />
                                        <span className="text-sm text-foreground truncate">
                                            {STATUS_LABEL[s]}
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-1.5 shrink-0">
                                        <span className="text-sm font-semibold text-foreground tabular-nums">
                                            {count}
                                        </span>
                                        <span className="text-xs text-muted tabular-nums">
                                            {pct.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}

function TopContactsCard({
    contacts,
    isLoading,
}: {
    contacts: Contact[];
    isLoading: boolean;
}) {
    const navigate = useNavigate();
    return (
        <section className="bg-surface rounded-xl border border-border p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Top scored contacts
                    </h2>
                    <p className="text-xs text-muted">
                        Where your AI rates the best fit.
                    </p>
                </div>
                <Button
                    size="sm"
                    variant="tertiary"
                    onPress={() => navigate(Routes.dashboard.contacts)}
                >
                    View all
                    <ArrowRight className="size-3.5" />
                </Button>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-14 rounded-lg bg-surface-secondary animate-pulse"
                        />
                    ))}
                </div>
            ) : contacts.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title="No scored contacts yet"
                    body="Run AI scoring on a contact to see them here."
                />
            ) : (
                <ul className="divide-y divide-border">
                    {contacts.map((c) => (
                        <li key={c.uuid}>
                            <Link
                                to={Routes.dashboard.contacts_detail.replace(":uuid", c.uuid)}
                                className="flex items-center gap-3 py-3 hover:bg-surface-secondary/40 -mx-2 px-2 rounded-md transition-colors"
                            >
                                <Avatar name={c.name} />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {c.name ?? "Unnamed"}
                                    </p>
                                    <p className="text-xs text-muted truncate">
                                        {c.company ?? c.email ?? "—"}
                                    </p>
                                </div>
                                <div className="hidden sm:block">
                                    <StatusChip status={c.status} />
                                </div>
                                <ScoreBadge score={c.score} />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

const CHANNEL_ICON: Record<Channel, React.ComponentType<{ className?: string }>> = {
    [Channel.EMAIL]: Mail,
    [Channel.SMS]: Phone,
    [Channel.LINKEDIN]: MessageCircle,
};

function PendingDraftsCard({
    items,
    isLoading,
}: {
    items: DashboardPendingDraftGroup[];
    isLoading: boolean;
}) {
    return (
        <section className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">
                        Drafts to send
                    </h2>
                    <p className="text-xs text-muted">AI-prepared outreach.</p>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-12 rounded-lg bg-surface-secondary animate-pulse"
                        />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <EmptyState
                    icon={Inbox}
                    title="No pending drafts"
                    body="Generate drafts from a contact's detail page."
                />
            ) : (
                <ul className="space-y-2">
                    {items.map(({ contact, drafts }) => {
                        const channels = Array.from(new Set(drafts.map((d) => d.channel)));
                        return (
                            <li key={contact.uuid}>
                                <Link
                                    to={Routes.dashboard.contacts_detail.replace(
                                        ":uuid",
                                        contact.uuid,
                                    )}
                                    className="flex items-center gap-3 rounded-lg border border-border bg-surface-secondary/40 p-3 hover:border-accent/40 transition-colors"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-foreground truncate">
                                            {contact.name ?? "Unnamed"}
                                        </p>
                                        <p className="text-xs text-muted truncate">
                                            {drafts.length} draft
                                            {drafts.length === 1 ? "" : "s"} ready
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {channels.map((ch) => {
                                            const Icon = CHANNEL_ICON[ch];
                                            return (
                                                <span
                                                    key={ch}
                                                    title={ch}
                                                    className="inline-flex size-6 items-center justify-center rounded-md bg-background text-muted"
                                                >
                                                    <Icon className="size-3" />
                                                </span>
                                            );
                                        })}
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}

function FiltersCard({
    filters,
    isLoading,
}: {
    filters: Filter[];
    isLoading: boolean;
}) {
    const navigate = useNavigate();
    return (
        <section className="bg-surface rounded-xl border border-border p-6">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
                <div>
                    <h2 className="text-sm font-semibold text-foreground">Your filters</h2>
                    <p className="text-xs text-muted">
                        Saved hunts that pull leads automatically.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="tertiary"
                        onPress={() => navigate(Routes.dashboard.filters)}
                    >
                        View all
                        <ArrowRight className="size-3.5" />
                    </Button>
                    <Button
                        size="sm"
                        onPress={() => navigate(Routes.dashboard.filters_new)}
                    >
                        <Plus className="size-3.5" />
                        New filter
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid gap-2 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-16 rounded-lg bg-surface-secondary animate-pulse"
                        />
                    ))}
                </div>
            ) : filters.length === 0 ? (
                <EmptyState
                    icon={FilterIcon}
                    title="No filters yet"
                    body="Create a filter to start scraping leads on a schedule."
                    action={
                        <Button
                            size="sm"
                            onPress={() => navigate(Routes.dashboard.filters_new)}
                        >
                            <Plus className="size-3.5" />
                            Create filter
                        </Button>
                    }
                />
            ) : (
                <ul className="grid gap-2 md:grid-cols-2">
                    {filters.slice(0, 6).map((f) => (
                        <FilterRow key={f.uuid} filter={f} />
                    ))}
                </ul>
            )}
        </section>
    );
}

function FilterRow({ filter }: { filter: Filter }) {
    const { lastJob } = useLatestFilterJob(filter.uuid);
    const status = lastJob?.status;
    const tone =
        status === JobStatus.RUNNING || status === JobStatus.PENDING
            ? "warning"
            : status === JobStatus.FAILED
              ? "danger"
              : status === JobStatus.COMPLETED
                ? "success"
                : "default";

    const ts = lastJob?.completed_at ?? lastJob?.started_at ?? lastJob?.created_at;
    const subtitle = ts
        ? `${status?.toLowerCase() ?? "—"} · ${formatDistanceToNow(new Date(ts), {
              addSuffix: true,
          })}`
        : filter.enabled
          ? "Never run"
          : "Disabled";

    return (
        <li>
            <Link
                to={Routes.dashboard.filters_detail.replace(":uuid", filter.uuid)}
                className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-accent/40 transition-colors h-full"
            >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-accent/10 text-accent shrink-0">
                    <FilterIcon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                        {filter.name}
                    </p>
                    <p className="text-xs text-muted truncate">{subtitle}</p>
                </div>
                {status && (
                    <Chip size="sm" variant="soft" color={tone as any}>
                        <Chip.Label>
                            {lastJob?.leads_found != null
                                ? `${lastJob.leads_found} leads`
                                : status}
                        </Chip.Label>
                    </Chip>
                )}
            </Link>
        </li>
    );
}

function Avatar({ name }: { name: string | null }) {
    const initials =
        (name ?? "")
            .split(/\s+/)
            .map((w) => w[0])
            .filter(Boolean)
            .slice(0, 2)
            .join("")
            .toUpperCase() || "?";
    return (
        <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-semibold">
            {initials}
        </span>
    );
}

function EmptyState({
    icon: Icon,
    title,
    body,
    action,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    body: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center justify-center text-center gap-2 py-8">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-surface-secondary text-muted">
                <Icon className="size-5" />
            </span>
            <p className="text-sm font-medium text-foreground">{title}</p>
            <p className="text-xs text-muted max-w-xs">{body}</p>
            {action}
        </div>
    );
}
