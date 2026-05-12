import type { Lead } from "@/features/leads/interfaces/lead.interface";
import { EnrichmentSnapshotPanel } from "@/components/ui/enrichment-snapshot-panel";
import { SourceBadge } from "@/components/ui/source-badge";
import { SectionCard, Row, ProfileValue } from "@/components/ui/profile-section";
import { initialsFromName, formatShortDate, normalizeUrl } from "@/lib/profile";
import { AtSign, Briefcase, Building2, CalendarClock, ExternalLink, Globe, MapPin, Tag } from "lucide-react";

export function LeadDirectoryProfileTab({ lead }: { lead: Lead }) {
    const websiteHref = lead.website?.trim() ? normalizeUrl(lead.website.trim()) : undefined;
    const linkedinHref = lead.linkedin_url?.trim() || undefined;

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-accent/[0.07] via-surface to-surface-secondary/30 p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-link/5 blur-3xl" aria-hidden />
                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                        <div className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent/25 to-accent/5 text-xl font-semibold tracking-tight text-accent-foreground ring-2 ring-accent/25 ring-offset-2 ring-offset-[var(--surface)] shadow-lg" aria-hidden>
                            {initialsFromName(lead.name)}
                        </div>
                        <div className="min-w-0 space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground truncate">{lead.name?.trim() || "Unnamed lead"}</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {lead.title?.trim() ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-secondary/80 px-3 py-1 text-xs font-medium text-foreground">
                                        <Briefcase className="size-3.5 text-muted" strokeWidth={2} />
                                        {lead.title.trim()}
                                    </span>
                                ) : null}
                                {lead.company?.trim() ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-secondary/80 px-3 py-1 text-xs font-medium text-foreground">
                                        <Building2 className="size-3.5 text-muted" strokeWidth={2} />
                                        {lead.company.trim()}
                                    </span>
                                ) : null}
                                <SourceBadge source={lead.source_type} className="shrink-0" />
                            </div>
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarClock className="size-3.5 shrink-0 opacity-80" strokeWidth={2} />
                                    Added {formatShortDate(lead.created_at)}
                                </span>
                                <span className="hidden sm:inline text-border">·</span>
                                <span className="inline-flex items-center gap-1.5">Updated {formatShortDate(lead.updated_at)}</span>
                            </p>
                        </div>
                    </div>
                    {(websiteHref || linkedinHref) && (
                        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                            {websiteHref ? (
                                <a href={websiteHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface-secondary/90 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-accent/40 hover:bg-surface-tertiary/80">
                                    <Globe className="size-4 text-accent" strokeWidth={2} />
                                    Website
                                </a>
                            ) : null}
                            {linkedinHref ? (
                                <a href={linkedinHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface-secondary/90 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-accent/40 hover:bg-surface-tertiary/80">
                                    <ExternalLink className="size-4 text-accent" strokeWidth={2} />
                                    LinkedIn
                                </a>
                            ) : null}
                        </div>
                    )}
                </div>
                <EnrichmentSnapshotPanel summary={lead.enrichment_summary} className="relative mt-6" hideWhenEmpty />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <SectionCard title="Contact" icon={AtSign}>
                    <Row label="Email">
                        <ProfileValue value={lead.email} href={lead.email?.trim() ? `mailto:${lead.email.trim()}` : undefined} />
                    </Row>
                    <Row label="Phone">
                        <ProfileValue value={lead.phone} href={lead.phone?.trim() ? `tel:${lead.phone.trim()}` : undefined} />
                    </Row>
                </SectionCard>

                <SectionCard title="Professional" icon={Briefcase}>
                    <Row label="Title">
                        <ProfileValue value={lead.title} />
                    </Row>
                    <Row label="Company">
                        <ProfileValue value={lead.company} />
                    </Row>
                    <Row label="Industry">
                        <ProfileValue value={lead.industry} />
                    </Row>
                    <Row label="Location">
                        <div className="flex items-start gap-2 min-w-0">
                            {lead.location?.trim() ? <MapPin className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden /> : null}
                            <div className="min-w-0 flex-1">
                                <ProfileValue value={lead.location} />
                            </div>
                        </div>
                    </Row>
                </SectionCard>

                <SectionCard title="Links & presence" icon={Globe}>
                    <Row label="Website">
                        <div className="flex items-start gap-2">
                            {websiteHref ? <Globe className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden /> : null}
                            <ProfileValue value={lead.website} href={websiteHref} />
                        </div>
                    </Row>
                    <Row label="LinkedIn">
                        <div className="flex items-start gap-2">
                            {linkedinHref ? <ExternalLink className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden /> : null}
                            <ProfileValue value={lead.linkedin_url} href={linkedinHref} />
                        </div>
                    </Row>
                </SectionCard>

                <SectionCard title="Context" icon={Tag}>
                    <Row label="Source">
                        <SourceBadge source={lead.source_type} />
                    </Row>
                    <Row label="About">
                        <ProfileValue value={lead.description} emptyLabel="No description on file." />
                    </Row>
                </SectionCard>
            </div>
        </div>
    );
}
