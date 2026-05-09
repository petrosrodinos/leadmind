import { Outlet } from "react-router-dom";
import { Drawer, useOverlayState } from "@heroui/react";
import Sidebar from "@/components/layout/sidebar";
import DashboardNavbar from "@/components/layout/dashboard-navbar";
import SidebarContent from "@/components/layout/sidebar-content";

export default function DashboardLayout() {
  const drawerState = useOverlayState();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <DashboardNavbar onMenuClick={drawerState.open} />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <Drawer state={drawerState}>
        <Drawer.Backdrop isDismissable />
        <Drawer.Content placement="left">
          <Drawer.Dialog>
            <Drawer.Header>
              <Drawer.Heading>Menu</Drawer.Heading>
              <Drawer.CloseTrigger />
            </Drawer.Header>
            <Drawer.Body>
              <SidebarContent collapsed={false} onNavigate={drawerState.close} />
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer>
    </div>
  );
}
