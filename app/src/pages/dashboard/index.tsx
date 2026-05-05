import { useAuthStore } from "@/stores/auth";

const stats = [
  { label: "Total Leads", value: "—" },
  { label: "Leads This Week", value: "—" },
  { label: "Conversion Rate", value: "—" },
  { label: "Active Campaigns", value: "—" },
];

export default function DashboardHome() {
  const { full_name, email } = useAuthStore();
  const displayName = full_name || email || "there";

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-border p-6">
        <p className="text-2xl font-semibold text-foreground">
          Welcome back, {displayName} 👋
        </p>
        <p className="mt-1 text-sm text-muted">
          Here's what's happening with your leads today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-xl border border-border p-5 flex flex-col gap-2"
          >
            <p className="text-xs font-medium text-muted uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <p className="text-sm font-medium text-foreground mb-4">Recent Activity</p>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-surface-secondary animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
