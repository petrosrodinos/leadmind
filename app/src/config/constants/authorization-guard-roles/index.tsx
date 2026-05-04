import { RoleTypes } from "@/features/user/interfaces/user.interface";
import { type RoleType } from "@/features/user/interfaces/user.interface";

export interface AuthorizationGuardRole {
  [key: string]: RoleType[];
}

export const AuthorizationGuardRoles: AuthorizationGuardRole = {
  DELETE_BOOKING: [RoleTypes.ADMIN, RoleTypes.SUPPORT],
  VIEW_BOOKING_CLIENT_TIMEZONE: [RoleTypes.ADMIN, RoleTypes.SUPPORT],
} as AuthorizationGuardRole;
