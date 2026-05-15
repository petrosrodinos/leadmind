import { Link } from "react-router-dom";
import { Inbox, Mail, MessageCircle, Phone } from "lucide-react";
import { Channel } from "@/features/contacts/interfaces/contact.interface";
import type { DashboardPendingDraftGroup } from "@/features/dashboard/interfaces/dashboard.interface";
import { Routes } from "@/routes/routes";
import { DashboardPanelHeader } from "./dashboard-panel-header";
import { DashboardAvatar, DashboardEmptyState, DashboardListSkeleton } from "./dashboard-shared";

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
    <section className="overflow-hidden rounded-xl border border-border/60 bg-surface">
      <DashboardPanelHeader title="Drafts to send" subtitle="AI-prepared outreach" />

      {isLoading ? (
        <DashboardListSkeleton />
      ) : items.length === 0 ? (
        <DashboardEmptyState
          icon={Inbox}
          title="No pending drafts"
          body="Generate drafts from a contact's detail page."
        />
      ) : (
        <ul className="divide-y divide-border/40">
          {items.map(({ contact, drafts }) => {
            const channels = Array.from(new Set(drafts.map((d) => d.channel)));
            return (
              <li key={contact.uuid}>
                <Link
                  to={Routes.dashboard.contacts_detail.replace(":uuid", contact.uuid)}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-surface-secondary/40 transition-colors"
                >
                  <DashboardAvatar name={contact.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {contact.name ?? "Unnamed"}
                    </p>
                    <p className="truncate text-xs text-muted">
                      {drafts.length} draft{drafts.length === 1 ? "" : "s"} ready
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {channels.map((ch) => {
                      const Icon = CHANNEL_ICON[ch];
                      return (
                        <span
                          key={ch}
                          title={ch}
                          className="inline-flex size-7 items-center justify-center rounded-lg bg-surface-secondary text-muted"
                        >
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
