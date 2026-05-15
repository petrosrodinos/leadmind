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
    <div className="flex items-start justify-between gap-6 py-2 pb-6 border-b border-border/50">
      <div className="min-w-0">
        <p className="text-sm text-muted mb-1">{greeting}</p>
        <h1 className="text-2xl font-semibold text-foreground tracking-tight">{name}</h1>
        <div className="mt-1.5 h-5">
          {statsLoading ? (
            <div className="h-3.5 w-52 rounded bg-surface-secondary animate-pulse mt-0.5" aria-hidden />
          ) : newThisWeek > 0 ? (
            <p className="text-sm text-muted">
              <span className="text-accent font-medium">{newThisWeek}</span>{" "}
              new {newThisWeek === 1 ? "contact" : "contacts"} added this week
            </p>
          ) : (
            <p className="text-sm text-muted">Your pipeline overview</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 pt-1">
        <Button
          variant="secondary"
          size="sm"
          onPress={() => navigate(Routes.dashboard.leads_directory)}
        >
          <Sparkles className="size-3.5" />
          Find leads
        </Button>
        <Button size="sm" onPress={() => navigate(Routes.dashboard.filters_new)}>
          <Plus className="size-3.5" />
          New filter
        </Button>
      </div>
    </div>
  );
}
