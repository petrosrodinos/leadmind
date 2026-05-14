import { NavLink, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";

const tabClass = (active: boolean) =>
    cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        active
            ? "bg-accent/15 text-foreground ring-1 ring-accent/25"
            : "text-muted hover:text-foreground hover:bg-surface-secondary",
    );

export default function DashboardFiltersLayout() {
    const { pathname } = useLocation();
    const scoringPath = Routes.dashboard.filters_scoring_instructions;
    const filtersPrefix = Routes.dashboard.filters;
    const onScoringInstructions =
        pathname === scoringPath || pathname.startsWith(`${scoringPath}/`);
    const onFiltersTab =
        pathname === filtersPrefix ||
        (pathname.startsWith(`${filtersPrefix}/`) && !onScoringInstructions);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-1 border-b border-border pb-2">
                <NavLink
                    to={Routes.dashboard.filters}
                    aria-current={onFiltersTab ? "page" : undefined}
                    className={() => tabClass(onFiltersTab)}
                >
                    Filters
                </NavLink>
                <NavLink
                    to={Routes.dashboard.filters_scoring_instructions}
                    aria-current={onScoringInstructions ? "page" : undefined}
                    className={() => tabClass(onScoringInstructions)}
                >
                    Scoring instructions
                </NavLink>
            </div>
            <Outlet />
        </div>
    );
}
