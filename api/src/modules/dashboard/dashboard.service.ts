import { Injectable } from '@nestjs/common';
import { LeadStatus, MsgStatus } from '@/generated/prisma';
import { PrismaService } from '@/core/databases/prisma/prisma.service';
import { emptyLeadStatusCounts } from '@/modules/contacts/constants/lead-status.constants';
import { DashboardStats } from './interfaces/dashboard.interface';

const DAY_MS = 24 * 60 * 60 * 1000;

function maxContactScore(c: { contact_scores?: { score: number }[] }): number {
    if (!c.contact_scores?.length) return 0;
    return Math.max(...c.contact_scores.map((s) => s.score));
}

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) {}

    async getStats(user_uuid: string): Promise<DashboardStats> {
        const since = new Date(Date.now() - 7 * DAY_MS);

        const [statusGroups, newThisWeek, pendingDrafts, activeFilters] = await Promise.all([
            this.prisma.contact.groupBy({
                by: ['status'],
                where: { user_uuid },
                _count: { _all: true },
            }),
            this.prisma.contact.count({
                where: { user_uuid, created_at: { gte: since } },
            }),
            this.prisma.outreachMessage.count({
                where: { user_uuid, status: MsgStatus.PENDING },
            }),
            this.prisma.filter.count({ where: { user_uuid, enabled: true } }),
        ]);

        const by_status = emptyLeadStatusCounts();
        for (const row of statusGroups) {
            by_status[row.status] = row._count._all;
        }

        const total_contacts = Object.values(by_status).reduce((sum, n) => sum + n, 0);

        const considered =
            by_status[LeadStatus.NEW] +
            by_status[LeadStatus.CONTACTED] +
            by_status[LeadStatus.QUALIFIED] +
            by_status[LeadStatus.NURTURING] +
            by_status[LeadStatus.CONVERTED];
        const conversion_rate =
            considered > 0
                ? Number(((by_status[LeadStatus.CONVERTED] / considered) * 100).toFixed(1))
                : 0;

        return {
            total_contacts,
            new_this_week: newThisWeek,
            pending_drafts: pendingDrafts,
            conversion_rate,
            by_status,
            active_filters: activeFilters,
        };
    }

    async getTopContacts(user_uuid: string, limit: number) {
        const contacts = await this.prisma.contact.findMany({
            where: { user_uuid, contact_scores: { some: {} } },
            include: { lead: true, tags: true, contact_scores: true },
            orderBy: { updated_at: 'desc' },
            take: Math.max(limit * 20, 80),
        });
        const sorted = [...contacts]
            .sort((a, b) => maxContactScore(b) - maxContactScore(a))
            .slice(0, limit);
        return sorted.map((c) => ({
            ...c,
            tags: c.tags.map((t) => t.tag),
        }));
    }

    async getPendingDrafts(user_uuid: string, limit: number) {
        const drafts = await this.prisma.outreachMessage.findMany({
            where: { user_uuid, status: MsgStatus.PENDING },
            orderBy: { created_at: 'desc' },
            include: {
                contact: {
                    include: { lead: true, tags: true, contact_scores: true },
                },
            },
        });

        type DraftRow = (typeof drafts)[number];
        type Message = Omit<DraftRow, 'contact'>;
        type ContactRow = DraftRow['contact'];
        type ContactWithTags = Omit<ContactRow, 'tags'> & { tags: string[] };

        const byContact = new Map<string, { contact: ContactWithTags; drafts: Message[] }>();

        for (const d of drafts) {
            const { contact, ...message } = d;
            const entry = byContact.get(d.contact_uuid);
            if (entry) {
                entry.drafts.push(message);
                continue;
            }
            const flat: ContactWithTags = {
                ...contact,
                tags: contact.tags.map((t) => t.tag),
            };
            byContact.set(d.contact_uuid, { contact: flat, drafts: [message] });
        }

        return Array.from(byContact.values())
            .sort((a, b) => maxContactScore(b.contact) - maxContactScore(a.contact))
            .slice(0, limit);
    }
}
