import { CheckCircle2, Send, TrendingUp, Users } from "lucide-react";
import { LeadStatus } from "@/features/contacts/interfaces/contact.interface";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { useDashboardPendingDrafts, useDashboardStats, useDashboardTopContacts } from "@/features/dashboard/hooks/use-dashboard";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";
import { DashboardHero } from "./components/dashboard-hero";
import { DashboardKpiCard } from "./components/dashboard-kpi-card";
import { DashboardPipelineDistribution } from "./components/dashboard-pipeline-distribution";
import { DashboardTopContactsCard } from "./components/dashboard-top-contacts-card";
import { DashboardPendingDraftsCard } from "./components/dashboard-pending-drafts-card";
import { DashboardFiltersCard } from "./components/dashboard-filters-card";
import { EMPTY_BY_STATUS } from "./components/dashboard.constants";
import { firstName, greetingFor } from "./components/dashboard.utils";

export default function DashboardHome() {
  const { full_name, email } = useAuthStore();
  const name = firstName(full_name, email);
  const greeting = greetingFor(new Date());

  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: topContacts = [], isLoading: topLoading } = useDashboardTopContacts(5);
  const { data: pendingGroups = [], isLoading: draftsLoading } = useDashboardPendingDrafts(5);
  const { data: filters = [], isLoading: filtersLoading } = useFilters();

  const byStatus = stats?.by_status ?? EMPTY_BY_STATUS;
  const total = stats?.total_contacts ?? 0;

  return (
    <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-5">
      <DashboardHero greeting={greeting} name={name} newThisWeek={stats?.new_this_week ?? 0} statsLoading={statsLoading} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard label="Total contacts" value={total.toLocaleString()} helper="All time" icon={Users} tone="accent" href={Routes.dashboard.contacts} valueLoading={statsLoading} />
        <DashboardKpiCard label="New this week" value={(stats?.new_this_week ?? 0).toLocaleString()} helper="New contacts added" icon={TrendingUp} tone="success" valueLoading={statsLoading} />
        <DashboardKpiCard label="Conversion rate" value={`${(stats?.conversion_rate ?? 0).toFixed(1)}%`} helper={`${byStatus[LeadStatus.CONVERTED]} converted`} icon={CheckCircle2} tone="warning" valueLoading={statsLoading} />
        <DashboardKpiCard label="Pending drafts" value={(stats?.pending_drafts ?? 0).toLocaleString()} helper="Waiting to send" icon={Send} tone="draft" href={Routes.dashboard.contacts} valueLoading={statsLoading} />
      </div>

      <DashboardPipelineDistribution stats={stats} isLoading={statsLoading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardTopContactsCard contacts={topContacts} isLoading={topLoading} />
        <DashboardPendingDraftsCard items={pendingGroups} isLoading={draftsLoading} />
      </div>

      <DashboardFiltersCard filters={filters} isLoading={filtersLoading} />
    </div>
  );
}
