import { Button } from "@heroui/react";
import { Plus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Routes } from "@/routes/routes";

interface DashboardHeroProps {
  greeting: string;
  name: string;
  newThisWeek: number;
  statsLoading: boolean;
}

export function DashboardHero({ greeting, name, newThisWeek, statsLoading }: DashboardHeroProps) {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[150px] overflow-hidden rounded-2xl border border-border bg-surface px-6 py-7 sm:px-10">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,color-mix(in_oklch,var(--accent)_12%,transparent),transparent_34%),radial-gradient(circle_at_82%_42%,color-mix(in_oklch,var(--accent)_18%,transparent),transparent_32%)]" />
      <HeroContours />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-accent">{greeting}</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl">{name}, here&apos;s your pipeline at a glance</h1>
          {statsLoading ? (
            <div className="mt-4 space-y-2" aria-busy aria-label="Loading summary">
              <div className="h-4 w-full max-w-lg rounded-md bg-surface-secondary animate-pulse" />
              <div className="h-4 w-[70%] max-w-md rounded-md bg-surface-secondary animate-pulse" />
            </div>
          ) : (
            <p className="mt-3 max-w-2xl text-sm text-muted">{newThisWeek > 0 ? `You added ${newThisWeek} new ${newThisWeek === 1 ? "contact" : "contacts"} this week. Keep the momentum.` : "Hunt for leads, score them with AI, and keep the deals moving."}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 lg:shrink-0">
          <Button variant="secondary" className="px-5" onPress={() => navigate(Routes.dashboard.leads_directory)}>
            <Sparkles className="size-4" />
            Find leads
          </Button>
          <Button className="px-5" onPress={() => navigate(Routes.dashboard.filters_new)}>
            <Plus className="size-4" />
            New filter
          </Button>
        </div>
      </div>
    </section>
  );
}

function HeroContours() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[48%] opacity-70 md:block">
      <div className="absolute right-[7%] top-[28%] h-24 w-64 rounded-[50%] border border-accent/15" />
      <div className="absolute right-[12%] top-[42%] h-20 w-80 rounded-[50%] border border-accent/12" />
      <div className="absolute right-[25%] top-[56%] h-20 w-72 rounded-[50%] border border-accent/10" />
    </div>
  );
}
