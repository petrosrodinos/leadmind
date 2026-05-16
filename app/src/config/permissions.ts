import { RoleTypes, type RoleType } from "@/features/user/interfaces/user.interface";

export const Permissions = {
  admin_nav: [RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN],
  admin_batch_jobs: [RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN],
  lead_enrichment_bulk: [RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN],
  lead_delete: [RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN],
  lead_edit: [RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN],
  filter_outreach_instructions_edit: [RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN],
  campaign_extended_stats: [RoleTypes.ADMIN, RoleTypes.SUPER_ADMIN],
} as const satisfies Record<string, RoleType[]>;

export type PermissionKey = keyof typeof Permissions;
