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
      {/* Greeting card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-2xl font-semibold text-gray-900">
          Welcome back, {displayName} 👋
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Here's what's happening with your leads today.
        </p>
      </div>

      {/* Stat placeholder cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2"
          >
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {stat.label}
            </p>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder content area */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-700 mb-4">Recent Activity</p>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 rounded-lg bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
