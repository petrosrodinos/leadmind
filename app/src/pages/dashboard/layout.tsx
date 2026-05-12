import { Outlet, NavLink } from "react-router-dom";
import { Drawer, useOverlayState } from "@heroui/react";
import Sidebar from "@/components/layout/sidebar";
import DashboardNavbar from "@/components/layout/dashboard-navbar";
import SidebarContent from "@/components/layout/sidebar-content";
import { AppLogo } from "@/components/layout/app-logo";
import UserMenuPopover from "@/components/layout/user-menu-popover";
import { environments } from "@/config/environments";
import { Routes } from "@/routes/routes";

export default function DashboardLayout() {
  const drawerState = useOverlayState();

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden mr-3">
        <DashboardNavbar onMenuClick={drawerState.open} />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <Drawer state={drawerState}>
        <Drawer.Backdrop
          isDismissable
          className="backdrop-blur-sm"
          style={{ background: 'color-mix(in oklch, black 30%, transparent)' }}
        />
        <Drawer.Content placement="left">
          <Drawer.Dialog
            className="bg-surface"
            style={{
              boxShadow: `
                0 0 0 1px color-mix(in oklch, var(--accent) 8%, transparent),
                4px 0 32px -4px color-mix(in oklch, black 20%, transparent)
              `,
            }}
          >
            {/* Header — matches desktop sidebar header */}
            <Drawer.Header className="border-b border-border h-[54px] px-3 shrink-0 flex items-center gap-2">
              <NavLink
                to={Routes.dashboard.root}
                onClick={drawerState.close}
                className="flex items-center gap-2.5 flex-1 min-w-0 rounded-xl px-2 py-1.5 hover:bg-surface-secondary transition-colors duration-200"
              >
                <AppLogo className="h-7 w-7 shrink-0" />
                <span className="text-[13px] font-semibold text-foreground truncate tracking-tight">
                  {environments.APP_NAME}
                </span>
              </NavLink>
              <Drawer.CloseTrigger className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-secondary transition-colors shrink-0" />
            </Drawer.Header>

            {/* Nav items + user section */}
            <Drawer.Body className="px-2 pt-2.5 pb-2 flex flex-col gap-0">
              <SidebarContent collapsed={false} onNavigate={drawerState.close} />
              <div className="mt-4 pt-2 border-t border-border">
                <UserMenuPopover collapsed={false} placement="top" />
              </div>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
