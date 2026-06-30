import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Routes } from "@/routes/routes";
import UserMenuPopover from "@/components/layout/user-menu-popover";
import { useThemeContext } from "@/components/providers/theme-provider";

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  [Routes.dashboard.root]: "Dashboard",
  [Routes.dashboard.contacts]: "Contacts",
  [Routes.dashboard.leads_directory]: "Leads Directory",
  [Routes.dashboard.map]: "Map Search",
  [Routes.dashboard.analytics]: "Analytics",
  [Routes.dashboard.settings]: "Settings",
  [Routes.dashboard.settings_usage]: "Usage",
};

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const location = useLocation();
  const currentTitle =
    location.pathname.startsWith("/dashboard/leads-directory/") &&
    location.pathname !== Routes.dashboard.leads_directory
      ? "Lead details"
      : pageTitles[location.pathname] ?? "Dashboard";
  const { theme, toggleTheme } = useThemeContext();

  return (
    <header
      className={cn(
        'mx-3 mt-3 rounded-xl shrink-0',
        'h-12 flex items-center justify-between px-3',
        'bg-surface border border-border',
      )}
      style={{
        boxShadow: `
          0 0 0 1px color-mix(in oklch, var(--accent) 6%, transparent),
          0 8px 20px -8px color-mix(in oklch, black 16%, transparent),
          0 2px 6px -2px color-mix(in oklch, black 8%, transparent)
        `,
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors duration-200"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="font-semibold text-foreground text-sm tracking-tight">{currentTitle}</span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors duration-200"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <UserMenuPopover collapsed={false} placement="bottom" />
      </div>
    </header>
  );
}
