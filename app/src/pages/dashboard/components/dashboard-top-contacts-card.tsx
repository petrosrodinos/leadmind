import { Link, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { ContactScoresCompact, StatusChip } from "@/pages/dashboard/pages/leads/components/badges";
import { Routes } from "@/routes/routes";
import { DashboardPanelHeader } from "./dashboard-panel-header";
import { DashboardAvatar, DashboardEmptyState, DashboardListSkeleton } from "./dashboard-shared";

interface DashboardTopContactsCardProps {
  contacts: Contact[];
  isLoading: boolean;
}

export function DashboardTopContactsCard({ contacts, isLoading }: DashboardTopContactsCardProps) {
  const navigate = useNavigate();
  const rows = Array.isArray(contacts) ? contacts : [];

  return (
    <section className="overflow-hidden rounded-xl border border-border/60 bg-surface">
      <DashboardPanelHeader
        title="Top scored contacts"
        subtitle="Ranked by AI score"
        actionLabel="View all"
        onAction={() => navigate(Routes.dashboard.contacts)}
      />

      {isLoading ? (
        <DashboardListSkeleton />
      ) : rows.length === 0 ? (
        <DashboardEmptyState
          icon={Users}
          title="No scored contacts yet"
          body="Run AI scoring on a contact to see them here."
        />
      ) : (
        <ul className="divide-y divide-border/40">
          {rows.map((c) => (
            <li key={c.uuid}>
              <Link
                to={Routes.dashboard.contacts_detail.replace(":uuid", c.uuid)}
                className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-secondary/40 transition-colors"
              >
                <DashboardAvatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{c.name ?? "Unnamed"}</p>
                  <p className="truncate text-xs text-muted">{c.company ?? c.email ?? "—"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden sm:block">
                    <StatusChip status={c.status} />
                  </div>
                  <ContactScoresCompact contact={c} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
