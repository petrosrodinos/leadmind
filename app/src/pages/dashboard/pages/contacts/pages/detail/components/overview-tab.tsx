import { useMemo, useState } from "react";
import { Button, Chip, Input, Label, ListBox, Select, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import {
    AtSign,
    Briefcase,
    Building2,
    CalendarClock,
    ExternalLink,
    Globe,
    Pencil,
    Tag,
    X,
} from "lucide-react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { useUpdateContact } from "@/features/contacts/hooks/use-contacts";
import type { UpdateContactPayload } from "@/features/contacts/interfaces/contact.interface";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { SourceBadge } from "@/components/ui/source-badge";
import { OverviewUrlField } from "@/components/ui/overview-url-field";
import { EnrichmentSnapshotPanel } from "@/components/ui/enrichment-snapshot-panel";
import { SectionCard, Row, ProfileValue } from "@/components/ui/profile-section";
import { initialsFromName, formatShortDate, normalizeUrl } from "@/lib/profile";
import { StatusChip } from "@/pages/dashboard/pages/leads/components/badges";
import type { ProfileDraft } from "../types";
import { profileDraftFromContact } from "../utils/profile-draft";

interface OverviewTabProps {
    contact: Contact;
}

export function OverviewTab({ contact }: OverviewTabProps) {
    const [editing, setEditing] = useState(false);

    return (
        <div className="flex flex-col gap-8 max-w-5xl lg:flex-row lg:items-start">
            <IdentitySidebar contact={contact} />
            <div className="flex-1 min-w-0">
                {editing ? (
                    <EditForm contact={contact} onDone={() => setEditing(false)} />
                ) : (
                    <DetailPanel contact={contact} onEdit={() => setEditing(true)} />
                )}
            </div>
        </div>
    );
}

function IdentitySidebar({ contact }: { contact: Contact }) {
    const websiteHref = contact.website?.trim() ? normalizeUrl(contact.website.trim()) : undefined;
    const linkedinHref = contact.linkedin_url?.trim() || undefined;
    const hasLinks = !!(linkedinHref || websiteHref);

    return (
        <aside className="flex flex-col gap-5 lg:w-56 lg:shrink-0 lg:border-r lg:border-border/50 lg:pr-8">
            {/* Avatar + identity */}
            <div className="flex flex-col gap-4">
                <div
                    className="flex size-[4.5rem] items-center justify-center rounded-2xl bg-linear-to-br from-accent/25 to-accent/5 text-xl font-semibold tracking-tight text-accent-foreground ring-2 ring-accent/20 ring-offset-2 ring-offset-[var(--background)]"
                    aria-hidden
                >
                    {initialsFromName(contact.name)}
                </div>

                <div className="space-y-0.5">
                    <h2 className="text-xl font-semibold tracking-tight text-foreground leading-snug">
                        {contact.name?.trim() || "Unnamed contact"}
                    </h2>
                    {contact.title?.trim() ? (
                        <p className="text-sm text-muted">{contact.title.trim()}</p>
                    ) : null}
                    {contact.company?.trim() ? (
                        <p className="flex items-center gap-1.5 pt-0.5 text-sm text-foreground/70">
                            <Building2 className="size-3.5 shrink-0 text-muted" strokeWidth={2} aria-hidden />
                            {contact.company.trim()}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <StatusChip status={contact.status} />
                    <SourceBadge source={contact.lead.source_type} />
                </div>

                {contact.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                        {contact.tags.map((tag) => (
                            <Chip key={tag} size="sm" variant="soft">
                                <Chip.Label>{tag}</Chip.Label>
                            </Chip>
                        ))}
                    </div>
                ) : null}
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
                    Added {formatShortDate(contact.created_at)}
                </span>
                <span className="pl-5">Updated {formatShortDate(contact.updated_at)}</span>
            </div>
        </aside>
    );
}

function DetailPanel({ contact, onEdit }: { contact: Contact; onEdit: () => void }) {
    const { data: filters = [] } = useFilters();
    const filterName = useMemo(
        () => filters.find((f) => f.uuid === contact.filter_uuid)?.name ?? null,
        [filters, contact.filter_uuid],
    );

    const websiteHref = contact.website?.trim() ? normalizeUrl(contact.website.trim()) : undefined;
    const linkedinHref = contact.linkedin_url?.trim() || undefined;

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <Button size="sm" variant="secondary" onPress={onEdit}>
                    <Pencil className="size-3.5" />
                    Edit
                </Button>
            </div>

            <EnrichmentSnapshotPanel
                summary={contact.lead.enrichment_summary}
                metadata={contact.lead.enrichment_metadata}
                hideWhenEmpty
            />

            <SectionCard title="Contact" icon={AtSign}>
                <Row label="Email">
                    <ProfileValue
                        value={contact.email}
                        href={contact.email?.trim() ? `mailto:${contact.email.trim()}` : undefined}
                    />
                </Row>
                <Row label="Phone">
                    <ProfileValue
                        value={contact.phone}
                        href={contact.phone?.trim() ? `tel:${contact.phone.trim()}` : undefined}
                    />
                </Row>
            </SectionCard>

            <SectionCard title="Professional" icon={Briefcase}>
                <Row label="Title">
                    <ProfileValue value={contact.title} />
                </Row>
                <Row label="Company">
                    <ProfileValue value={contact.company} />
                </Row>
                <Row label="Industry">
                    <ProfileValue value={contact.industry} />
                </Row>
                <Row label="Location">
                    <ProfileValue value={contact.location} />
                </Row>
            </SectionCard>

            <SectionCard title="Links & Presence" icon={Globe}>
                <Row label="Website">
                    <ProfileValue value={contact.website} href={websiteHref} />
                </Row>
                <Row label="LinkedIn">
                    <ProfileValue value={contact.linkedin_url} href={linkedinHref} />
                </Row>
            </SectionCard>

            <SectionCard title="Context" icon={Tag}>
                {filterName ? (
                    <Row label="Filter">
                        <ProfileValue value={filterName} />
                    </Row>
                ) : null}
                <Row label="About">
                    <ProfileValue value={contact.description} emptyLabel="No description on file." />
                </Row>
                {contact.notes ? (
                    <Row label="Notes">
                        <ProfileValue value={contact.notes} />
                    </Row>
                ) : null}
            </SectionCard>
        </div>
    );
}

function EditForm({ contact, onDone }: { contact: Contact; onDone: () => void }) {
    const updateProfile = useUpdateContact();
    const { data: filters = [] } = useFilters();
    const [draft, setDraft] = useState<ProfileDraft>(() => profileDraftFromContact(contact));

    const filterOptions = useMemo(() => {
        const enabled = filters.filter((f) => f.enabled);
        return enabled.length > 0 ? enabled : filters;
    }, [filters]);

    const dirty = useMemo(() => {
        const prev = profileDraftFromContact(contact);
        return (Object.keys(prev) as (keyof ProfileDraft)[]).some(
            (k) => draft[k].trim() !== prev[k].trim(),
        );
    }, [contact, draft]);

    const setField = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) =>
        setDraft((p) => ({ ...p, [key]: value }));

    const handleSave = () => {
        const t = (s: string) => s.trim();
        const payload: UpdateContactPayload = {
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
        const filterTrim = t(draft.filter_uuid);
        if (filterTrim && filterTrim !== (contact.filter_uuid ?? "")) {
            payload.filter_uuid = filterTrim;
        }
        updateProfile.mutate({ uuid: contact.uuid, payload }, { onSuccess: onDone });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-foreground">Edit contact</h3>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onPress={onDone} isDisabled={updateProfile.isPending}>
                        <X className="size-3.5" />
                        Cancel
                    </Button>
                    <ActionButtonWithPending
                        size="sm"
                        isDisabled={!dirty || updateProfile.isPending}
                        isPending={updateProfile.isPending}
                        onPress={handleSave}
                    >
                        Save changes
                    </ActionButtonWithPending>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Select
                        className="w-full"
                        placeholder={filterOptions.length === 0 ? "No filters yet" : "Select a filter"}
                        value={draft.filter_uuid || null}
                        onChange={(v) => setField("filter_uuid", (v as string) ?? "")}
                        isDisabled={filterOptions.length === 0}
                    >
                        <Label>Filter</Label>
                        <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                            <ListBox>
                                {filterOptions.map((f) => (
                                    <ListBox.Item key={f.uuid} id={f.uuid} textValue={f.name}>
                                        {f.name}
                                        <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                ))}
                            </ListBox>
                        </Select.Popover>
                    </Select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="pf-name">Name</Label>
                    <Input id="pf-name" placeholder="Full name" value={draft.name} onChange={(e) => setField("name", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pf-company">Company</Label>
                    <Input id="pf-company" placeholder="Acme Inc." value={draft.company} onChange={(e) => setField("company", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pf-email">Email</Label>
                    <Input id="pf-email" type="email" placeholder="name@company.com" value={draft.email} onChange={(e) => setField("email", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pf-phone">Phone</Label>
                    <Input id="pf-phone" placeholder="+1 555 0100" value={draft.phone} onChange={(e) => setField("phone", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pf-title">Title</Label>
                    <Input id="pf-title" placeholder="Head of Sales" value={draft.title} onChange={(e) => setField("title", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pf-location">Location</Label>
                    <Input id="pf-location" placeholder="City, Country" value={draft.location} onChange={(e) => setField("location", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pf-industry">Industry</Label>
                    <Input id="pf-industry" placeholder="Software" value={draft.industry} onChange={(e) => setField("industry", e.target.value)} />
                </div>
                <OverviewUrlField
                    id="pf-website"
                    label="Website"
                    value={draft.website}
                    onChange={(e) => setField("website", e.target.value)}
                    placeholder="https://example.com"
                    Icon={Globe}
                    openAriaLabel="Open website in new tab"
                />
                <OverviewUrlField
                    id="pf-linkedin"
                    label="LinkedIn"
                    value={draft.linkedin_url}
                    onChange={(e) => setField("linkedin_url", e.target.value)}
                    placeholder="https://linkedin.com/in/…"
                    Icon={ExternalLink}
                    openAriaLabel="Open LinkedIn profile in new tab"
                />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-description">Description</Label>
                <TextArea
                    id="pf-description"
                    rows={4}
                    placeholder="Short summary or notes about this contact…"
                    value={draft.description}
                    onChange={(e) => setField("description", e.target.value)}
                />
            </div>
        </div>
    );
}
