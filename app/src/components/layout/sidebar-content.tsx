import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Globe, Filter, IdCard, Megaphone, Layers } from "lucide-react";
import { Routes } from "@/routes/routes";
import { useAuthStore } from "@/stores/auth";
import { RoleTypes } from "@/features/user/interfaces/user.interface";

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: Routes.dashboard.root, end: true, adminOnly: false },
  { label: "Filters", icon: Filter, href: Routes.dashboard.filters, end: false, adminOnly: false },
  { label: "Contacts", icon: Users, href: Routes.dashboard.contacts, end: false, adminOnly: false },
  { label: "Leads Directory", icon: Globe, href: Routes.dashboard.leads_directory, end: false, adminOnly: false },
  { label: "Sender Profiles", icon: IdCard, href: Routes.dashboard.sender_profiles, end: false, adminOnly: false },
  { label: "Campaigns", icon: Megaphone, href: Routes.dashboard.campaigns, end: false, adminOnly: false },
  { label: "Batch Jobs", icon: Layers, href: Routes.dashboard.admin_batch_jobs, end: false, adminOnly: true },
];

export default function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  const { role } = useAuthStore();
  const isSuperAdmin = role === RoleTypes.SUPER_ADMIN;

  return (
    <ul className="space-y-0.5">
      {navItems.filter((item) => !item.adminOnly || isSuperAdmin).map(({ label, icon: Icon, href, end }) => (
        <li key={href}>
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
      ))}
    </ul>
  );
}
