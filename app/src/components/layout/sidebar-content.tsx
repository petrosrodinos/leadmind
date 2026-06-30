import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Disclosure } from "@heroui/react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Globe, Filter, IdCard, Megaphone, Layers, ShieldCheck, ChevronDown, Plug, Bell, ClipboardList, List, Settings, BarChart2, Activity } from "lucide-react";
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
  { label: "Lists", icon: List, href: Routes.dashboard.lists, end: false },
  { label: "Reminders", icon: Bell, href: Routes.dashboard.reminders, end: false },
  { label: "Forms", icon: ClipboardList, href: Routes.dashboard.forms, end: false },
  { label: "Leads Directory", icon: Globe, href: Routes.dashboard.leads_directory, end: false },
  { label: "Sender Profiles", icon: IdCard, href: Routes.dashboard.sender_profiles, end: false },
  { label: "Integrations", icon: Plug, href: Routes.dashboard.integrations, end: false },
  { label: "Campaigns", icon: Megaphone, href: Routes.dashboard.campaigns, end: false },
];

const adminSubItems = [
  { label: "Batch Jobs", icon: Layers, href: Routes.dashboard.admin_batch_jobs, end: false },
  { label: "System Status", icon: Activity, href: Routes.dashboard.admin_system_status, end: false },
];

const settingsSubItems = [
  { label: "Usage", icon: BarChart2, href: Routes.dashboard.settings_usage, end: false },
];

function pathMatchesAnyAdminRoute(pathname: string) {
  return adminSubItems.some(({ href }) => pathname === href || pathname.startsWith(`${href}/`));
}

function pathMatchesAnySettingsRoute(pathname: string) {
  return (
    pathname === Routes.dashboard.settings ||
    settingsSubItems.some(({ href }) => pathname === href || pathname.startsWith(`${href}/`))
  );
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
  const [settingsOpen, setSettingsOpen] = useState(() => pathMatchesAnySettingsRoute(pathname));

  useEffect(() => {
    const nowAdmin = pathMatchesAnyAdminRoute(pathname);
    const prevAdmin = pathMatchesAnyAdminRoute(prevPathname.current);
    const nowSettings = pathMatchesAnySettingsRoute(pathname);
    const prevSettings = pathMatchesAnySettingsRoute(prevPathname.current);
    prevPathname.current = pathname;
    if (nowAdmin && !prevAdmin) {
      setAdminOpen(true);
    }
    if (nowSettings && !prevSettings) {
      setSettingsOpen(true);
    }
  }, [pathname]);

  const disclosureTriggerClass = cn(
    'group flex w-full rounded-xl transition-all duration-200 outline-none',
    'focus-visible:ring-1 focus-visible:ring-accent/50',
    'text-muted hover:text-foreground hover:bg-surface-secondary',
    collapsed ? 'justify-center py-2.5 px-0' : 'items-center justify-between gap-2 px-2.5 py-[8px]',
  );

  return (
    <ul className="space-y-0.5">
      {canViewAdminNav && (
        <li>
          <Disclosure
            isExpanded={adminOpen}
            onExpandedChange={setAdminOpen}
            className="w-full min-w-0 gap-0"
          >
            <Disclosure.Heading className="w-full p-0 m-0">
              <Disclosure.Trigger
                aria-label={collapsed ? "Admin" : undefined}
                className={disclosureTriggerClass}
              >
                <span
                  className={cn(
                    'flex items-center min-w-0',
                    collapsed ? 'justify-center' : 'gap-2.5 flex-1',
                  )}
                >
                  <ShieldCheck style={{ width: 16, height: 16 }} className="shrink-0" />
                  {!collapsed && (
                    <span
                      className="text-[13px] font-medium truncate leading-none"
                      style={{ letterSpacing: '-0.005em' }}
                    >
                      Admin
                    </span>
                  )}
                </span>
                {!collapsed && (
                  <ChevronDown
                    className={cn(
                      'size-4 shrink-0 text-muted transition-transform duration-200',
                      adminOpen && 'rotate-180',
                    )}
                  />
                )}
              </Disclosure.Trigger>
            </Disclosure.Heading>
            <Disclosure.Content className="p-0 m-0">
              <Disclosure.Body className="p-0 m-0">
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
        </li>
      )}

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

      <li>
        <Disclosure
          isExpanded={settingsOpen}
          onExpandedChange={setSettingsOpen}
          className="w-full min-w-0 gap-0"
        >
          <Disclosure.Heading className="w-full p-0 m-0">
            <Disclosure.Trigger
              aria-label={collapsed ? "Settings" : undefined}
              className={disclosureTriggerClass}
            >
              <span
                className={cn(
                  'flex items-center min-w-0',
                  collapsed ? 'justify-center' : 'gap-2.5 flex-1',
                )}
              >
                <Settings style={{ width: 16, height: 16 }} className="shrink-0" />
                {!collapsed && (
                  <span
                    className="text-[13px] font-medium truncate leading-none"
                    style={{ letterSpacing: '-0.005em' }}
                  >
                    Settings
                  </span>
                )}
              </span>
              {!collapsed && (
                <ChevronDown
                  className={cn(
                    'size-4 shrink-0 text-muted transition-transform duration-200',
                    settingsOpen && 'rotate-180',
                  )}
                />
              )}
            </Disclosure.Trigger>
          </Disclosure.Heading>
          <Disclosure.Content className="p-0 m-0">
            <Disclosure.Body className="p-0 m-0">
              <ul className="space-y-0.5">
                {settingsSubItems.map(({ label, icon, href, end }) => (
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
      </li>
    </ul>
  );
}
