import { useLocation } from "react-router-dom";
import { Menu, Sun, Moon } from "lucide-react";
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
};

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] ?? "Dashboard";
  const { theme, toggleTheme } = useThemeContext();

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-muted hover:bg-surface-secondary hover:text-foreground transition-colors duration-200" aria-label="Open menu">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-foreground text-sm">{currentTitle}</span>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} aria-label="Toggle theme" className="p-2 rounded-lg text-muted hover:bg-surface-secondary hover:text-foreground transition-colors duration-200">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <UserMenuPopover collapsed={false} placement="bottom" />
      </div>
    </header>
  );
}
