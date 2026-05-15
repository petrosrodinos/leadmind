import { LeadStatus } from '@/generated/prisma';

export function emptyLeadStatusCounts(): Record<LeadStatus, number> {
    return Object.fromEntries(
        Object.values(LeadStatus).map((status) => [status, 0]),
    ) as Record<LeadStatus, number>;
}
