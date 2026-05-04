import { Outlet } from "react-router-dom";
import { Drawer, useOverlayState } from "@heroui/react";
import Sidebar from "@/components/layout/sidebar";
import DashboardNavbar from "@/components/layout/dashboard-navbar";
import SidebarContent from "@/components/layout/sidebar-content";

export default function DashboardLayout() {
  const drawerState = useOverlayState();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardNavbar onMenuClick={drawerState.open} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
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
