import { LeadStatus } from '@/generated/prisma';

export interface DashboardStats {
    total_contacts: number;
    new_this_week: number;
    pending_drafts: number;
    conversion_rate: number;
    by_status: Record<LeadStatus, number>;
    active_filters: number;
}
