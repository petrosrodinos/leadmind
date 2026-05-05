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
        'rounded-full bg-accent text-accent-foreground flex items-center justify-center font-semibold shrink-0 select-none shadow-sm',
        size === 'md' ? 'h-7 w-7 text-xs' : 'h-6 w-6 text-xs',
      )}
    >
      {initials}
    </div>
  );

  return (
    <Popover>
      <Popover.Trigger
        className={cn(
          'group w-full rounded-lg transition-all duration-150 cursor-pointer outline-none',
          collapsed
            ? 'flex justify-center p-1.5 hover:bg-surface-secondary'
            : 'flex items-center gap-2 px-2 py-1 hover:bg-surface-secondary',
        )}
      >
        {collapsed ? (
          <AvatarBadge />
        ) : (
          <>
            <AvatarBadge />
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-foreground truncate leading-snug">{displayName}</p>
              <p className="text-xs text-muted truncate leading-snug">{email ?? ''}</p>
            </div>
            <ChevronsUpDown className="h-3 w-3 text-muted shrink-0 group-hover:text-foreground transition-colors" />
          </>
        )}
      </Popover.Trigger>

      <Popover.Content
        placement={placement === 'top' ? 'top start' : 'bottom end'}
        className="w-40 p-0 rounded-xl border border-border bg-overlay shadow-overlay overflow-hidden"
      >
        <Popover.Dialog>
          <div className="py-1">
            {menuItems.map(({ label, icon: Icon, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="w-full flex items-center gap-2 px-2.5 py-1 text-sm text-foreground hover:bg-surface-secondary transition-colors duration-100 group/item"
              >
                <span className="h-5 w-5 rounded-md bg-default group-hover/item:bg-surface-tertiary flex items-center justify-center transition-colors duration-100 shrink-0">
                  <Icon className="h-3 w-3 text-muted" />
                </span>
                {label}
              </button>
            ))}
          </div>

          <div className="px-1.5 pb-1.5">
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 px-2 py-1 rounded-lg text-sm text-danger hover:bg-danger/10 transition-colors duration-100 group/logout"
            >
              <span className="h-5 w-5 rounded-md bg-danger/10 group-hover/logout:bg-danger/15 flex items-center justify-center transition-colors duration-100 shrink-0">
                <LogOut className="h-3 w-3 text-danger" />
              </span>
              Log out
            </button>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  );
}
