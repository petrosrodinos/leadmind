import { useMemo } from "react";
import { Chip } from "@heroui/react";
import { Briefcase, Building2, MapPin, Scale, Users } from "lucide-react";
import type { GemiCompany, GemiCompanyActivity, GemiCompanyPerson } from "@/features/gemi/interfaces/gemi-company.interface";
import {
    formatGemiActivityPeriod,
    formatGemiAddress,
    formatGemiDate,
    partitionGemiActivities,
} from "@/features/gemi/utils/gemi-profile.utils";
import { normalizeUrl } from "@/lib/profile";
import { Row, SectionCard, ProfileValue } from "@/components/ui/profile-section";

interface GemiCompanyPanelProps {
    company: GemiCompany;
}

export function GemiCompanyPanel({ company }: GemiCompanyPanelProps) {
    const address = formatGemiAddress(company);
    const websiteHref = company.url?.trim() ? normalizeUrl(company.url.trim()) : undefined;
    const englishNames = company.coNamesEn?.filter(Boolean).join(", ");
    const greekTitles = company.coTitlesEl?.filter(Boolean).join(", ");
    const englishTitles = company.coTitlesEn?.filter(Boolean).join(", ");
    const { active: activeActivities, historical: historicalActivities } = useMemo(
        () => partitionGemiActivities(company.activities),
        [company.activities],
    );
    const persons = company.persons?.filter((p) => p.personName || p.businessName) ?? [];
    const capitalLines = company.capital?.filter((c) => c.capitalStock != null) ?? [];
    const stockLines = company.stocks?.filter((s) => s.amount != null) ?? [];

    return (
        <div className="space-y-4">
            <SectionCard title="GEMI registry" icon={Scale}>
                <Row label="GEMI no.">
                    <ProfileValue value={company.arGemi != null ? String(company.arGemi) : undefined} />
                </Row>
                <Row label="AFM">
                    <ProfileValue value={company.afm} />
                </Row>
                <Row label="Legal form">
                    <ProfileValue value={company.legalType?.descr} />
                </Row>
                <Row label="Status">
                    <ProfileValue value={company.status?.descr} />
                </Row>
                <Row label="GEMI office">
                    <ProfileValue value={company.gemiOffice?.descr} />
                </Row>
                <Row label="Incorporated">
                    <ProfileValue value={formatGemiDate(company.incorporationDate) ?? undefined} />
                </Row>
                <Row label="Status changed">
                    <ProfileValue value={formatGemiDate(company.lastStatusChange) ?? undefined} />
                </Row>
                {company.isBranch ? (
                    <Row label="Branch">
                        <ProfileValue value="Yes" />
                    </Row>
                ) : null}
                {company.autoRegistered ? (
                    <Row label="Auto-registered">
                        <ProfileValue value="Yes" />
                    </Row>
                ) : null}
            </SectionCard>

            <SectionCard title="Company names" icon={Building2}>
                <Row label="Greek name">
                    <ProfileValue value={company.coNameEl} />
                </Row>
                {englishNames ? (
                    <Row label="English names">
                        <ProfileValue value={englishNames} />
                    </Row>
                ) : null}
                {greekTitles ? (
                    <Row label="Greek titles">
                        <ProfileValue value={greekTitles} />
                    </Row>
                ) : null}
                {englishTitles ? (
                    <Row label="English titles">
                        <ProfileValue value={englishTitles} />
                    </Row>
                ) : null}
                {company.objective?.trim() ? (
                    <Row label="Objective">
                        <ProfileValue value={company.objective} />
                    </Row>
                ) : null}
            </SectionCard>

            <SectionCard title="Address & contact" icon={MapPin}>
                <Row label="Address">
                    <ProfileValue value={address} />
                </Row>
                {company.prefecture?.descr ? (
                    <Row label="Prefecture">
                        <ProfileValue value={company.prefecture.descr} />
                    </Row>
                ) : null}
                {company.municipality?.descr ? (
                    <Row label="Municipality">
                        <ProfileValue value={company.municipality.descr} />
                    </Row>
                ) : null}
                {company.poBox?.trim() ? (
                    <Row label="P.O. box">
                        <ProfileValue value={company.poBox} />
                    </Row>
                ) : null}
                <Row label="Phone">
                    <ProfileValue
                        value={company.phone}
                        href={company.phone?.trim() ? `tel:${company.phone.trim()}` : undefined}
                    />
                </Row>
                {company.fax?.trim() ? (
                    <Row label="Fax">
                        <ProfileValue value={company.fax} />
                    </Row>
                ) : null}
                <Row label="Email">
                    <ProfileValue
                        value={company.email}
                        href={company.email?.trim() ? `mailto:${company.email.trim()}` : undefined}
                    />
                </Row>
                <Row label="Website">
                    <ProfileValue value={company.url} href={websiteHref} />
                </Row>
            </SectionCard>

            {activeActivities.length > 0 || historicalActivities.length > 0 ? (
                <SectionCard title="Activities (ΚΑΔ)" icon={Briefcase}>
                    {activeActivities.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-xs font-medium uppercase tracking-wide text-muted">Current</p>
                            <ul className="space-y-3">
                                {activeActivities.map((activity, i) => (
                                    <ActivityItem key={`active-${activity.activity?.id ?? i}`} activity={activity} />
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {historicalActivities.length > 0 ? (
                        <div className={activeActivities.length > 0 ? "pt-2 border-t border-border/60 space-y-3" : "space-y-3"}>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted">Historical</p>
                            <ul className="space-y-3">
                                {historicalActivities.map((activity, i) => (
                                    <ActivityItem key={`hist-${activity.activity?.id ?? i}`} activity={activity} muted />
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </SectionCard>
            ) : null}

            {persons.length > 0 ? (
                <SectionCard title="People" icon={Users}>
                    <ul className="space-y-4">
                        {persons.map((person, i) => (
                            <PersonItem key={`${person.personName ?? person.businessName}-${i}`} person={person} />
                        ))}
                    </ul>
                </SectionCard>
            ) : null}

            {capitalLines.length > 0 || stockLines.length > 0 ? (
                <SectionCard title="Capital & shares" icon={Scale}>
                    {capitalLines.map((entry, i) => (
                        <Row key={`cap-${i}`} label={entry.currency ? `Capital (${entry.currency})` : "Capital"}>
                            <ProfileValue
                                value={
                                    entry.capitalStock != null
                                        ? entry.capitalStock.toLocaleString(undefined, { maximumFractionDigits: 2 })
                                        : undefined
                                }
                            />
                        </Row>
                    ))}
                    {stockLines.map((entry, i) => (
                        <Row key={`stock-${i}`} label={entry.stockType ?? "Shares"}>
                            <ProfileValue
                                value={
                                    entry.amount != null
                                        ? [
                                              `${entry.amount.toLocaleString()} units`,
                                              entry.nominalPrice != null
                                                  ? `@ ${entry.nominalPrice.toLocaleString()} nominal`
                                                  : null,
                                          ]
                                              .filter(Boolean)
                                              .join(" · ")
                                        : undefined
                                }
                            />
                        </Row>
                    ))}
                </SectionCard>
            ) : null}
        </div>
    );
}

function ActivityItem({ activity, muted }: { activity: GemiCompanyActivity; muted?: boolean }) {
    const period = formatGemiActivityPeriod(activity);
    const code = activity.activity?.id;
    const descr = activity.activity?.descr;
    const kadVersion = activity.activity?.kadVersion;

    return (
        <li
            className={`rounded-xl border border-border/70 bg-surface-secondary/30 p-3 space-y-2 ${muted ? "opacity-75" : ""}`}
        >
            <div className="flex flex-wrap items-center gap-2">
                {activity.type ? (
                    <Chip size="sm" variant="soft">
                        <Chip.Label>{activity.type}</Chip.Label>
                    </Chip>
                ) : null}
                {!muted && !activity.dtTo ? (
                    <Chip size="sm" variant="soft" color="success">
                        <Chip.Label>Active</Chip.Label>
                    </Chip>
                ) : null}
                {kadVersion ? (
                    <span className="text-[10px] font-mono uppercase tracking-wide text-muted">{kadVersion}</span>
                ) : null}
            </div>
            {code ? (
                <p className="text-xs font-mono text-muted tabular-nums">{code}</p>
            ) : null}
            {descr ? <p className="text-sm font-medium text-foreground leading-snug">{descr}</p> : null}
            {period ? <p className="text-xs text-muted">{period}</p> : null}
        </li>
    );
}

function PersonItem({ person }: { person: GemiCompanyPerson }) {
    const name = person.personName ?? person.businessName;
    const period =
        person.dtFrom || person.dtTo
            ? [person.dtFrom ? formatGemiDate(person.dtFrom) : null, person.dtTo ? formatGemiDate(person.dtTo) : "present"]
                  .filter(Boolean)
                  .join(" – ")
            : null;

    return (
        <li className="rounded-xl border border-border/70 bg-surface-secondary/30 p-3 space-y-1">
            <p className="text-sm font-medium text-foreground">{name}</p>
            {person.role ? <p className="text-sm text-muted">{person.role}</p> : null}
            {person.percentage ? <p className="text-xs text-muted">Share: {person.percentage}</p> : null}
            {period ? <p className="text-xs text-muted">{period}</p> : null}
        </li>
    );
}
