import { Link } from "react-router-dom";
import { Inbox, Mail, MessageCircle, Phone, Send } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import type { DashboardPendingDraftGroup } from "@/features/dashboard/interfaces/dashboard.interface";
import { Routes } from "@/routes/routes";
import { DashboardPanelHeader } from "./dashboard-panel-header";
import { DashboardEmptyState, DashboardListSkeleton } from "./dashboard-shared";

const CHANNEL_ICON: Record<Channel, React.ComponentType<{ className?: string }>> = {
  [Channel.EMAIL]: Mail,
  [Channel.SMS]: Phone,
  [Channel.LINKEDIN]: MessageCircle,
};

interface DashboardPendingDraftsCardProps {
  items: DashboardPendingDraftGroup[];
  isLoading: boolean;
}

export function DashboardPendingDraftsCard({ items, isLoading }: DashboardPendingDraftsCardProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface">
      <DashboardPanelHeader icon={Send} title="Drafts to send" subtitle="AI-prepared outreach." actionLabel="View all" />

      {isLoading ? (
        <DashboardListSkeleton />
      ) : items.length === 0 ? (
        <DashboardEmptyState icon={Inbox} title="No pending drafts" body="Generate drafts from a contact's detail page." />
      ) : (
        <ul className="space-y-2 px-5 pb-5">
          {items.map(({ contact, drafts }) => {
            const channels = Array.from(new Set(drafts.map((d) => d.channel)));
            return (
              <li key={contact.uuid}>
                <Link to={Routes.dashboard.contacts_detail.replace(":uuid", contact.uuid)} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:border-accent/40">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{contact.name ?? "Unnamed"}</p>
                    <p className="truncate text-xs text-muted">
                      {drafts.length} draft{drafts.length === 1 ? "" : "s"} ready
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {channels.map((ch) => {
                      const Icon = CHANNEL_ICON[ch];
                      return (
                        <span key={ch} title={ch} className="inline-flex size-7 items-center justify-center rounded-lg bg-surface-secondary text-muted">
                          <Icon className="size-3.5" />
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
