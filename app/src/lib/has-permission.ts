import { Permissions, type PermissionKey } from "@/config/permissions";
import { RoleTypes, type RoleType } from "@/features/user/interfaces/user.interface";

export function hasPermission(
  role: RoleType | null | undefined,
  permission: PermissionKey,
): boolean {
  if (!role) {
    return false;
  }
  if (role === RoleTypes.SUPER_ADMIN) {
    return true;
  }
  return (Permissions[permission] as readonly RoleType[]).includes(role);
}
