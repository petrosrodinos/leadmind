import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, MapPin, BarChart3, Settings, Globe, Filter } from "lucide-react";
import { Routes } from "@/routes/routes";

interface SidebarContentProps {
  collapsed: boolean;
  onNavigate?: () => void;
}

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: Routes.dashboard.root, end: true },
  { label: "Contacts", icon: Users, href: Routes.dashboard.contacts, end: false },
  { label: "Leads Directory", icon: Globe, href: Routes.dashboard.leads_directory, end: false },
  { label: "Filters", icon: Filter, href: Routes.dashboard.filters, end: false },
  { label: "Map Search", icon: MapPin, href: Routes.dashboard.map, end: false },
  { label: "Analytics", icon: BarChart3, href: Routes.dashboard.analytics, end: false },
  { label: "Settings", icon: Settings, href: Routes.dashboard.settings, end: false },
];

const activeClass = "bg-accent/15 text-accent font-medium";
const inactiveClass = "text-muted hover:bg-surface-secondary hover:text-foreground";
const baseClass = "flex items-center rounded-lg transition-all duration-200 w-full";

export default function SidebarContent({ collapsed, onNavigate }: SidebarContentProps) {
  return (
    <ul className="space-y-1">
      {navItems.map(({ label, icon: Icon, href, end }) => (
        <li key={href}>
          <NavLink to={href} end={end} title={collapsed ? label : undefined} onClick={onNavigate} className={({ isActive }) => `${baseClass} ${isActive ? activeClass : inactiveClass} ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}`}>
            <Icon className="h-5 w-5 shrink-0" />
            {!collapsed && <span className="text-sm truncate">{label}</span>}
          </NavLink>
        </li>
      ))}
    </ul>
  );
}
