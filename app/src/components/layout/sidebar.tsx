import { useState, useEffect } from 'react';
import { PanelLeftClose, PanelLeftOpen, Command } from 'lucide-react';
import { environments } from '@/config/environments';
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
          <button
            onClick={() => setCollapsed(false)}
            title="Expand sidebar"
            className="mx-auto p-1.5 rounded-lg text-muted hover:bg-surface-secondary hover:text-foreground transition-colors duration-200"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Command className="h-5 w-5 text-accent shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">
                {environments.APP_NAME}
              </span>
            </div>
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
