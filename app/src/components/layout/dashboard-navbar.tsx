import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Routes } from '@/routes/routes';
import UserMenuPopover from '@/components/layout/user-menu-popover';

interface DashboardNavbarProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  [Routes.dashboard.root]:      'Dashboard',
  [Routes.dashboard.leads]:     'Leads',
  [Routes.dashboard.map]:       'Map Search',
  [Routes.dashboard.analytics]: 'Analytics',
  [Routes.dashboard.settings]:  'Settings',
};

export default function DashboardNavbar({ onMenuClick }: DashboardNavbarProps) {
  const location = useLocation();
  const currentTitle = pageTitles[location.pathname] ?? 'Dashboard';

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-gray-900 text-sm">{currentTitle}</span>
      </div>

      <div className="w-52">
        <UserMenuPopover collapsed={false} placement="bottom" />
      </div>
    </header>
  );
}
