import { Lead } from '@/generated/prisma';
import { GemiCompany, GemiCompanyActivity } from '@/integrations/gemi/gemi.interfaces';

export function parseGemiCompanyFromLead(lead: Lead): GemiCompany | null {
    const raw = lead.raw_data;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }
    const o = raw as Record<string, unknown>;
    if (o.arGemi == null && o.coNameEl == null && o.afm == null) {
        return null;
    }
    return raw as GemiCompany;
}

export function extractArGemiFromLead(lead: Lead): number | null {
    const raw = lead.raw_data;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return null;
    }
    const ar = (raw as Record<string, unknown>).arGemi;
    if (typeof ar === 'number' && Number.isFinite(ar)) {
        return ar;
    }
    if (typeof ar === 'string' && /^\d+$/.test(ar.trim())) {
        return Number(ar.trim());
    }
    return null;
}

export function isGemiActivityActive(activity: GemiCompanyActivity): boolean {
    if (!activity.dtTo) {
        return true;
    }
    const end = new Date(activity.dtTo);
    if (Number.isNaN(end.getTime())) {
        return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return end >= today;
}

export function buildGemiEnrichmentSummary(company: GemiCompany): string {
    const parts: string[] = [];
    if (company.coNameEl?.trim()) {
        parts.push(company.coNameEl.trim());
    }
    if (company.status?.descr) {
        parts.push(company.status.descr);
    }
    if (company.legalType?.descr) {
        parts.push(company.legalType.descr);
    }
    const activeCount = company.activities?.filter(isGemiActivityActive).length ?? 0;
    if (activeCount > 0) {
        parts.push(`${activeCount} active KAD`);
    }
    if (company.city?.trim()) {
        parts.push(company.city.trim());
    }
    if (parts.length === 0) {
        return 'GEMI registry data on file.';
    }
    return `GEMI: ${parts.join(' · ')}`;
}

export function buildGemiDocumentsEnrichmentSummary(
    company: GemiCompany,
    documents_fetched: boolean,
): string {
    const base = buildGemiEnrichmentSummary(company);
    if (!documents_fetched) {
        return base;
    }
    return `${base} · public documents fetched`;
}
