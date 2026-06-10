import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Disclosure } from "@heroui/react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Globe, Filter, IdCard, Megaphone, Layers, ShieldCheck, ChevronDown, Plug, Bell, ClipboardList } from "lucide-react";
import { Routes } from "@/routes/routes";
import { usePermission } from "@/hooks/use-permission";

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: Routes.dashboard.root, end: true },
  { label: "Filters", icon: Filter, href: Routes.dashboard.filters, end: false },
  { label: "Contacts", icon: Users, href: Routes.dashboard.contacts, end: false },
  { label: "Reminders", icon: Bell, href: Routes.dashboard.reminders, end: false },
  { label: "Forms", icon: ClipboardList, href: Routes.dashboard.forms, end: false },
  { label: "Leads Directory", icon: Globe, href: Routes.dashboard.leads_directory, end: false },
  { label: "Sender Profiles", icon: IdCard, href: Routes.dashboard.sender_profiles, end: false },
  { label: "Integrations", icon: Plug, href: Routes.dashboard.integrations, end: false },
  { label: "Campaigns", icon: Megaphone, href: Routes.dashboard.campaigns, end: false },
];

const adminSubItems = [
  { label: "Batch Jobs", icon: Layers, href: Routes.dashboard.admin_batch_jobs, end: false },
];

function pathMatchesAnyAdminRoute(pathname: string) {
  return adminSubItems.some(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
}

function NavItem({
  label,
  icon: Icon,
  href,
  end,
  collapsed,
  onNavigate,
  indent = false,
}: {
  label: string;
  icon: React.ElementType;
  href: string;
  end: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
  indent?: boolean;
}) {
  return (
    <li>
      <NavLink
        to={href}
        end={end}
        title={collapsed ? label : undefined}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            'group flex items-center w-full rounded-xl transition-all duration-200 outline-none',
            'focus-visible:ring-1 focus-visible:ring-accent/50',
            collapsed ? 'justify-center py-2.5 px-0' : 'gap-2.5 px-2.5 py-[8px]',
            indent && !collapsed && 'ml-3 w-[calc(100%-12px)]',
            isActive
              ? 'text-foreground'
              : 'text-muted hover:text-foreground hover:bg-surface-secondary',
          )
        }
        style={({ isActive }) =>
          isActive
            ? {
                background: 'color-mix(in oklch, var(--accent) 12%, transparent)',
                boxShadow: 'inset 0 0 0 1px color-mix(in oklch, var(--accent) 22%, transparent)',
              }
            : {}
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className="shrink-0 transition-transform duration-200 group-hover:scale-[1.07]"
              style={{ width: 16, height: 16, color: isActive ? 'var(--accent)' : undefined }}
            />
            {!collapsed && (
              <span
                className="text-[13px] font-medium truncate leading-none"
                style={{ letterSpacing: '-0.005em' }}
              >
                {label}
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}

export default function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const { pathname } = useLocation();
  const canViewAdminNav = usePermission("admin_nav");
  const prevPathname = useRef(pathname);
  const [adminOpen, setAdminOpen] = useState(() => pathMatchesAnyAdminRoute(pathname));

  useEffect(() => {
    const now = pathMatchesAnyAdminRoute(pathname);
    const prev = pathMatchesAnyAdminRoute(prevPathname.current);
    prevPathname.current = pathname;
    if (now && !prev) {
      setAdminOpen(true);
    }
  }, [pathname]);

  return (
    <div className="flex flex-col gap-4">
      {canViewAdminNav && (
        <Disclosure
          isExpanded={adminOpen}
          onExpandedChange={setAdminOpen}
          className="w-full min-w-0"
        >
          <Disclosure.Heading className="w-full">
            <Disclosure.Trigger
              aria-label={collapsed ? "Admin" : undefined}
              className={cn(
                'group flex w-full rounded-xl transition-all duration-200 outline-none',
                'focus-visible:ring-1 focus-visible:ring-accent/50',
                'text-muted hover:text-foreground hover:bg-surface-secondary',
                collapsed ? 'flex-col items-center justify-center gap-0.5 py-2' : 'items-center justify-between gap-2 px-2.5 py-[8px]',
              )}
            >
              <span
                className={cn(
                  'flex items-center min-w-0',
                  collapsed ? 'flex-col gap-0.5' : 'gap-2.5 flex-1',
                )}
              >
                <ShieldCheck style={{ width: 16, height: 16 }} className="shrink-0 text-muted" />
                {!collapsed && (
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-muted select-none truncate">
                    Admin
                  </span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  'shrink-0 text-muted transition-transform duration-200',
                  collapsed ? 'size-3' : 'size-4',
                  adminOpen && 'rotate-180',
                )}
              />
            </Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className="pt-0.5 pb-0 px-0">
              <ul className="space-y-0.5">
                {adminSubItems.map(({ label, icon, href, end }) => (
                  <NavItem
                    key={href}
                    label={label}
                    icon={icon}
                    href={href}
                    end={end}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    indent={true}
                  />
                ))}
              </ul>
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      )}

      <ul className="space-y-0.5">
        {navItems.map(({ label, icon, href, end }) => (
          <NavItem
            key={href}
            label={label}
            icon={icon}
            href={href}
            end={end}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </ul>
    </div>
  );
}
