import { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { environments } from '@/config/environments';
import { Routes } from '@/routes/routes';
import { AppLogo } from '@/components/layout/app-logo';
import SidebarContent from '@/components/layout/sidebar-content';
import UserMenuPopover from '@/components/layout/user-menu-popover';

const STORAGE_KEY = 'sidebar_collapsed';

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  return (
    <aside
      className={`hidden lg:flex flex-col bg-surface border-r border-border transition-all duration-300 shrink-0 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center shrink-0 px-3">
        {collapsed ? (
          <div className="flex flex-col items-center justify-center w-full gap-1.5 py-1">
            <NavLink
              to={Routes.dashboard.root}
              aria-label="Dashboard"
              title="Dashboard"
              className="rounded-lg p-0.5 text-muted hover:bg-surface-secondary hover:text-foreground transition-colors duration-200"
            >
              <AppLogo className="h-7 w-7" />
            </NavLink>
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="p-1.5 rounded-lg text-muted hover:bg-surface-secondary hover:text-foreground transition-colors duration-200"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <NavLink
              to={Routes.dashboard.root}
              className="flex items-center gap-2 flex-1 min-w-0 rounded-lg p-0.5 -m-0.5 hover:bg-surface-secondary/80 transition-colors duration-200"
            >
              <AppLogo className="h-7 w-7" />
              <span className="text-sm font-semibold text-foreground truncate">
                {environments.APP_NAME}
              </span>
            </NavLink>
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="shrink-0 p-1.5 rounded-lg text-muted hover:bg-surface-secondary hover:text-foreground transition-colors duration-200"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <SidebarContent collapsed={collapsed} />
      </nav>

      {/* User menu */}
      <div className="shrink-0 p-2 border-t border-border">
        <UserMenuPopover collapsed={collapsed} placement="top" />
      </div>
    </aside>
  );
}
