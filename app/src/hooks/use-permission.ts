import { type PermissionKey } from "@/config/permissions";
import { hasPermission } from "@/lib/has-permission";
import { useAuthStore } from "@/stores/auth";

export function usePermission(permission: PermissionKey): boolean {
  const role = useAuthStore((state) => state.role);
  return hasPermission(role, permission);
}
