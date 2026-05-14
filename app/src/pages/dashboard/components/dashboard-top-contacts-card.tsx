import { Link, useNavigate } from "react-router-dom";
import { Star, Users } from "lucide-react";
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

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <DashboardPanelHeader icon={Star} title="Top scored contacts" subtitle="Where your AI rates the best fit." actionLabel="View all" onAction={() => navigate(Routes.dashboard.contacts)} />

      {isLoading ? (
        <DashboardListSkeleton />
      ) : contacts.length === 0 ? (
        <DashboardEmptyState icon={Users} title="No scored contacts yet" body="Run AI scoring on a contact to see them here." dotted />
      ) : (
        <ul className="divide-y divide-border px-5 pb-2">
          {contacts.map((c) => (
            <li key={c.uuid}>
              <Link to={Routes.dashboard.contacts_detail.replace(":uuid", c.uuid)} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-secondary/40">
                <DashboardAvatar name={c.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">{c.name ?? "Unnamed"}</p>
                  <p className="truncate text-xs text-muted">{c.company ?? c.email ?? "No company data"}</p>
                </div>
                <div className="hidden sm:block">
                  <StatusChip status={c.status} />
                </div>
                <ContactScoresCompact contact={c} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
