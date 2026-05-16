import type { GemiCompany, GemiCompanyActivity } from "../interfaces/gemi-company.interface";

export function parseGemiCompany(raw: unknown): GemiCompany | null {
    if (!raw || typeof raw !== "object") return null;
    const o = raw as Record<string, unknown>;
    if (o.arGemi == null && o.coNameEl == null && o.afm == null) return null;
    return raw as GemiCompany;
}

export function formatGemiDate(value: string | null | undefined): string | null {
    if (!value?.trim()) return null;
    try {
        return new Date(value.trim()).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return value.trim();
    }
}

export function formatGemiAddress(company: GemiCompany): string | null {
    const streetLine = [company.street, company.streetNumber].filter(Boolean).join(" ");
    const locality = [company.zipCode, company.city].filter(Boolean).join(" ");
    const region = company.municipality?.descr ?? company.prefecture?.descr;
    const parts = [streetLine, locality, region].map((p) => p?.trim()).filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
}

export function isGemiActivityActive(activity: GemiCompanyActivity): boolean {
    if (!activity.dtTo) return true;
    const end = new Date(activity.dtTo);
    if (Number.isNaN(end.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return end >= today;
}

export function partitionGemiActivities(activities: GemiCompanyActivity[] | undefined) {
    const list = activities ?? [];
    const active: GemiCompanyActivity[] = [];
    const historical: GemiCompanyActivity[] = [];
    for (const item of list) {
        if (isGemiActivityActive(item)) active.push(item);
        else historical.push(item);
    }
    return { active, historical };
}

export function formatGemiActivityPeriod(activity: GemiCompanyActivity): string | null {
    const from = formatGemiDate(activity.dtFrom);
    const to = activity.dtTo ? formatGemiDate(activity.dtTo) : "present";
    if (!from && !activity.dtTo) return null;
    if (!from) return to === "present" ? null : `until ${to}`;
    return to === "present" ? `from ${from}` : `${from} – ${to}`;
}
