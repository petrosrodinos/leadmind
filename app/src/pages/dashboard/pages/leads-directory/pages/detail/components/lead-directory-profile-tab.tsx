import { useMemo, useState } from "react";
import { Button, Input, Label, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { AtSign, Briefcase, Building2, CalendarClock, ExternalLink, Globe, Pencil, Tag, X } from "lucide-react";
import type { Lead } from "@/features/leads/interfaces/lead.interface";
import type { UpdateLeadPayload } from "@/features/leads/interfaces/lead.interface";
import { useUpdateLead } from "@/features/leads/hooks/use-leads";
import { useAuthStore } from "@/stores/auth";
import { RoleTypes } from "@/features/user/interfaces/user.interface";
import { EnrichmentSnapshotPanel } from "@/components/ui/enrichment-snapshot-panel";
import { SourceBadge } from "@/components/ui/source-badge";
import { OverviewUrlField } from "@/components/ui/overview-url-field";
import { SectionCard, Row, ProfileValue } from "@/components/ui/profile-section";
import { GemiLeadSourcePanel } from "@/components/ui/gemi-lead-source-panel";
import { initialsFromName, formatShortDate, normalizeUrl } from "@/lib/profile";

interface LeadDirectoryProfileTabProps {
    lead: Lead;
}

type LeadDraft = {
    name: string;
    email: string;
    phone: string;
    company: string;
    website: string;
    linkedin_url: string;
    title: string;
    location: string;
    industry: string;
    description: string;
};

function draftFromLead(lead: Lead): LeadDraft {
    return {
        name: lead.name ?? "",
        email: lead.email ?? "",
        phone: lead.phone ?? "",
        company: lead.company ?? "",
        website: lead.website ?? "",
        linkedin_url: lead.linkedin_url ?? "",
        title: lead.title ?? "",
        location: lead.location ?? "",
        industry: lead.industry ?? "",
        description: lead.description ?? "",
    };
}

export function LeadDirectoryProfileTab({ lead }: LeadDirectoryProfileTabProps) {
    const { role } = useAuthStore();
    const isAdmin = role === RoleTypes.ADMIN || role === RoleTypes.SUPER_ADMIN;
    const [editing, setEditing] = useState(false);

    return (
        <div className="flex flex-col gap-8 max-w-5xl lg:flex-row lg:items-start">
            <IdentitySidebar lead={lead} />
            <div className="flex-1 min-w-0">
                {editing ? (
                    <EditForm lead={lead} onDone={() => setEditing(false)} />
                ) : (
                    <DetailPanel lead={lead} isAdmin={isAdmin} onEdit={() => setEditing(true)} />
                )}
            </div>
        </div>
    );
}

function IdentitySidebar({ lead }: { lead: Lead }) {
    const websiteHref = lead.website?.trim() ? normalizeUrl(lead.website.trim()) : undefined;
    const linkedinHref = lead.linkedin_url?.trim() || undefined;
    const hasLinks = !!(linkedinHref || websiteHref);

    return (
        <aside className="flex flex-col gap-5 lg:w-56 lg:shrink-0 lg:border-r lg:border-border/50 lg:pr-8">
            {/* Avatar + identity */}
            <div className="flex flex-col gap-4">
                <div
                    className="flex size-[4.5rem] items-center justify-center rounded-2xl bg-linear-to-br from-accent/25 to-accent/5 text-xl font-semibold tracking-tight text-accent-foreground ring-2 ring-accent/20 ring-offset-2 ring-offset-[var(--background)]"
                    aria-hidden
                >
                    {initialsFromName(lead.name)}
                </div>

                <div className="space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground leading-snug">
                        {lead.name?.trim() || "Unnamed lead"}
                    </h2>
                    {lead.title?.trim() ? (
                        <p className="text-sm text-muted">{lead.title.trim()}</p>
                    ) : null}
                    {lead.company?.trim() ? (
                        <p className="flex items-center gap-1.5 pt-0.5 text-sm text-foreground/70">
                            <Building2 className="size-3.5 shrink-0 text-muted" strokeWidth={2} aria-hidden />
                            {lead.company.trim()}
                        </p>
                    ) : null}
                </div>

                <SourceBadge source={lead.source_type} />
            </div>

            <div className="border-t border-border/50" />

            {/* Quick links */}
            <div className="flex flex-col gap-0.5">
                {hasLinks ? (
                    <>
                        {linkedinHref ? (
                            <a
                                href={linkedinHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-surface-secondary/80 hover:text-foreground"
                            >
                                <ExternalLink className="size-4 shrink-0 text-accent" strokeWidth={2} aria-hidden />
                                LinkedIn
                            </a>
                        ) : null}
                        {websiteHref ? (
                            <a
                                href={websiteHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-surface-secondary/80 hover:text-foreground"
                            >
                                <Globe className="size-4 shrink-0 text-accent" strokeWidth={2} aria-hidden />
                                Website
                            </a>
                        ) : null}
                    </>
                ) : (
                    <p className="px-2 text-xs italic text-muted/50">No links on file.</p>
                )}
            </div>

            <div className="border-t border-border/50" />

            {/* Timestamps */}
            <div className="flex flex-col gap-1.5 text-xs text-muted/60">
                <span className="flex items-center gap-1.5">
                    <CalendarClock className="size-3.5 shrink-0 opacity-60" strokeWidth={2} aria-hidden />
                    Added {formatShortDate(lead.created_at)}
                </span>
                <span className="pl-5">Updated {formatShortDate(lead.updated_at)}</span>
            </div>
        </aside>
    );
}

function DetailPanel({ lead, isAdmin, onEdit }: { lead: Lead; isAdmin: boolean; onEdit: () => void }) {
    const websiteHref = lead.website?.trim() ? normalizeUrl(lead.website.trim()) : undefined;
    const linkedinHref = lead.linkedin_url?.trim() || undefined;

    return (
        <div className="space-y-4">
            {isAdmin ? (
                <div className="flex justify-end">
                    <Button size="sm" variant="secondary" onPress={onEdit}>
                        <Pencil className="size-3.5" />
                        Edit
                    </Button>
                </div>
            ) : null}

            <EnrichmentSnapshotPanel
                summary={lead.enrichment_summary}
                metadata={lead.enrichment_metadata}
                hideWhenEmpty
            />

            <SectionCard title="Contact" icon={AtSign}>
                <Row label="Email">
                    <ProfileValue
                        value={lead.email}
                        href={lead.email?.trim() ? `mailto:${lead.email.trim()}` : undefined}
                    />
                </Row>
                <Row label="Phone">
                    <ProfileValue
                        value={lead.phone}
                        href={lead.phone?.trim() ? `tel:${lead.phone.trim()}` : undefined}
                    />
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
                    <ProfileValue value={lead.location} />
                </Row>
            </SectionCard>

            <SectionCard title="Links & Presence" icon={Globe}>
                <Row label="Website">
                    <ProfileValue value={lead.website} href={websiteHref} />
                </Row>
                <Row label="LinkedIn">
                    <ProfileValue value={lead.linkedin_url} href={linkedinHref} />
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

            <GemiLeadSourcePanel lead={lead} />

        </div>
    );
}

function EditForm({ lead, onDone }: { lead: Lead; onDone: () => void }) {
    const updateLead = useUpdateLead();
    const [draft, setDraft] = useState<LeadDraft>(() => draftFromLead(lead));

    const dirty = useMemo(() => {
        const prev = draftFromLead(lead);
        return (Object.keys(prev) as (keyof LeadDraft)[]).some(
            (k) => draft[k].trim() !== prev[k].trim(),
        );
    }, [lead, draft]);

    const setField = <K extends keyof LeadDraft>(key: K, value: LeadDraft[K]) =>
        setDraft((p) => ({ ...p, [key]: value }));

    const handleSave = () => {
        const t = (s: string) => s.trim();
        const payload: UpdateLeadPayload = {
            name: t(draft.name) || undefined,
            email: t(draft.email) || undefined,
            phone: t(draft.phone) || undefined,
            company: t(draft.company) || undefined,
            website: t(draft.website) || undefined,
            title: t(draft.title) || undefined,
            location: t(draft.location) || undefined,
            linkedin_url: t(draft.linkedin_url) || undefined,
            industry: t(draft.industry) || undefined,
            description: t(draft.description) || undefined,
        };
        updateLead.mutate({ uuid: lead.uuid, payload }, { onSuccess: onDone });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Edit lead</h3>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onPress={onDone} isDisabled={updateLead.isPending}>
                        <X className="size-3.5" />
                        Cancel
                    </Button>
                    <ActionButtonWithPending
                        size="sm"
                        isDisabled={!dirty || updateLead.isPending}
                        isPending={updateLead.isPending}
                        onPress={handleSave}
                    >
                        Save changes
                    </ActionButtonWithPending>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="ld-name">Name</Label>
                    <Input id="ld-name" placeholder="Full name" value={draft.name} onChange={(e) => setField("name", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ld-company">Company</Label>
                    <Input id="ld-company" placeholder="Acme Inc." value={draft.company} onChange={(e) => setField("company", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ld-email">Email</Label>
                    <Input id="ld-email" type="email" placeholder="name@company.com" value={draft.email} onChange={(e) => setField("email", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ld-phone">Phone</Label>
                    <Input id="ld-phone" placeholder="+1 555 0100" value={draft.phone} onChange={(e) => setField("phone", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ld-title">Title</Label>
                    <Input id="ld-title" placeholder="Head of Sales" value={draft.title} onChange={(e) => setField("title", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ld-location">Location</Label>
                    <Input id="ld-location" placeholder="City, Country" value={draft.location} onChange={(e) => setField("location", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ld-industry">Industry</Label>
                    <Input id="ld-industry" placeholder="Software" value={draft.industry} onChange={(e) => setField("industry", e.target.value)} />
                </div>
                <OverviewUrlField
                    id="ld-website"
                    label="Website"
                    value={draft.website}
                    onChange={(e) => setField("website", e.target.value)}
                    placeholder="https://example.com"
                    Icon={Globe}
                    openAriaLabel="Open website in new tab"
                />
                <OverviewUrlField
                    id="ld-linkedin"
                    label="LinkedIn"
                    value={draft.linkedin_url}
                    onChange={(e) => setField("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    Icon={ExternalLink}
                    openAriaLabel="Open LinkedIn profile in new tab"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="ld-description">Description</Label>
                <TextArea
                    id="ld-description"
                    rows={4}
                    placeholder="Short summary or notes about this lead…"
                    value={draft.description}
                    onChange={(e) => setField("description", e.target.value)}
                />
            </div>
        </div>
    );
}
