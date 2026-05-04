import { Popover } from '@heroui/react';
import { User, CreditCard, LogOut, ChevronsUpDown } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';
import { cn } from '@/lib/utils';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

interface UserMenuPopoverProps {
  collapsed?: boolean;
  placement?: 'top' | 'bottom';
}

export default function UserMenuPopover({ collapsed = false, placement = 'top' }: UserMenuPopoverProps) {
  const { full_name, email, logout } = useAuthStore();

  const displayName = full_name || email || 'User';
  const initials = getInitials(displayName);

  const menuItems = [
    { label: 'Account', icon: User, onClick: () => {} },
    { label: 'Billing', icon: CreditCard, onClick: () => {} },
  ];

  const AvatarBadge = ({ size = 'md' }: { size?: 'sm' | 'md' }) => (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-violet-500 to-violet-700 text-white flex items-center justify-center font-semibold shrink-0 select-none shadow-sm',
        size === 'md' ? 'h-8 w-8 text-xs' : 'h-7 w-7 text-xs',
      )}
    >
      {initials}
    </div>
  );

  return (
    <Popover>
      <Popover.Trigger
        className={cn(
          'group w-full rounded-xl transition-all duration-150 cursor-pointer outline-none',
          collapsed
            ? 'flex justify-center p-1.5 hover:bg-gray-100'
            : 'flex items-center gap-2.5 px-3 py-1.5 hover:bg-gray-100',
        )}
      >
        {collapsed ? (
          <AvatarBadge />
        ) : (
          <>
            <AvatarBadge />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-gray-900 truncate leading-snug">{displayName}</p>
              <p className="text-xs text-gray-400 truncate leading-snug">{email ?? ''}</p>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-gray-400 shrink-0 group-hover:text-gray-600 transition-colors ml-2" />
          </>
        )}
      </Popover.Trigger>

      <Popover.Content
        placement={placement === 'top' ? 'top start' : 'bottom end'}
        className="w-48 p-0 rounded-xl border border-gray-100 bg-white shadow-lg shadow-black/10 overflow-hidden"
      >
        <Popover.Dialog>
          {/* Menu items */}
          <div className="py-1">
            {menuItems.map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-100 group/item"
              >
                <span className="h-5 w-5 rounded-md bg-gray-100 group-hover/item:bg-gray-200 flex items-center justify-center transition-colors duration-100 shrink-0">
                  <Icon className="h-3 w-3 text-gray-500" />
                </span>
                {label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="px-1.5 pb-1.5">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors duration-100 group/logout"
            >
              <span className="h-5 w-5 rounded-md bg-red-50 group-hover/logout:bg-red-100 flex items-center justify-center transition-colors duration-100 shrink-0">
                <LogOut className="h-3 w-3 text-red-500" />
              </span>
              Log out
            </button>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
