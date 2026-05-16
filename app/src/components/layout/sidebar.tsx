import { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
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
      className={cn(
        'hidden lg:flex flex-col shrink-0',
        'my-3 ml-3 rounded-2xl overflow-hidden',
        'bg-surface border border-border',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-[64px]' : 'w-[220px]',
      )}
      style={{
        boxShadow: `
          0 0 0 1px color-mix(in oklch, var(--accent) 8%, transparent),
          0 20px 40px -12px color-mix(in oklch, black 22%, transparent),
          0 6px 16px -6px color-mix(in oklch, black 12%, transparent)
        `,
      }}
    >
      {/* Header */}
      <div className="h-[54px] flex items-center shrink-0 px-3 border-b border-border">
        {collapsed ? (
          <div className="flex flex-col items-center justify-center w-full gap-1.5 py-0.5">
            <NavLink
              to={Routes.root}
              aria-label={environments.APP_NAME}
              title={environments.APP_NAME}
              className="rounded-xl p-1 transition-colors duration-200 hover:bg-surface-secondary"
            >
              <AppLogo className="h-7 w-7" />
            </NavLink>
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              className="p-1 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-all duration-200"
            >
              <PanelLeftOpen className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <>
            <NavLink
              to={Routes.root}
              className="flex items-center gap-2.5 flex-1 min-w-0 rounded-xl px-2 py-1.5 hover:bg-surface-secondary transition-colors duration-200"
            >
              <AppLogo className="h-7 w-7 shrink-0" />
              <span className="text-[13px] font-semibold text-foreground truncate tracking-tight">
                {environments.APP_NAME}
              </span>
            </NavLink>
            <button
              onClick={() => setCollapsed(true)}
              title="Collapse sidebar"
              className="shrink-0 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-all duration-200"
            >
              <PanelLeftClose className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-2.5 px-2 overflow-y-auto">
        <SidebarContent collapsed={collapsed} />
      </nav>

      {/* User menu */}
      <div className="shrink-0 p-2 border-t border-border">
        <UserMenuPopover collapsed={collapsed} placement="top" />
      </div>
    </aside>
  );
}
