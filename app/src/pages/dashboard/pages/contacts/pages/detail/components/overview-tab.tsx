import { useMemo, useState } from "react";
import { Button, Chip, Input, Label, ListBox, Select, TextArea } from "@heroui/react";
import {
    AtSign,
    Briefcase,
    Building2,
    CalendarClock,
    ExternalLink,
    Globe,
    MapPin,
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
import { Section } from "./section";
import type { ProfileDraft } from "../types";
import { profileDraftFromContact } from "../utils/profile-draft";

interface OverviewTabProps {
    contact: Contact;
}

export function OverviewTab({ contact }: OverviewTabProps) {
    const [editing, setEditing] = useState(false);

    return (
        <div className="space-y-6 max-w-5xl">
            {editing ? (
                <EditForm contact={contact} onDone={() => setEditing(false)} />
            ) : (
                <ReadOnlyView contact={contact} onEdit={() => setEditing(true)} />
            )}
        </div>
    );
}

function ReadOnlyView({ contact, onEdit }: { contact: Contact; onEdit: () => void }) {
    const { data: filters = [] } = useFilters();
    const filterName = useMemo(
        () => filters.find((f) => f.uuid === contact.filter_uuid)?.name ?? null,
        [filters, contact.filter_uuid],
    );

    const websiteHref = contact.website?.trim()
        ? /^https?:\/\//i.test(contact.website.trim())
            ? contact.website.trim()
            : `https://${contact.website.trim()}`
        : undefined;
    const linkedinHref = contact.linkedin_url?.trim() || undefined;

    return (
        <div className="space-y-6">
            {/* Hero banner */}
            <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-linear-to-br from-accent/[0.07] via-surface to-surface-secondary/30 p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-accent/10 blur-3xl" aria-hidden />
                <div className="pointer-events-none absolute -bottom-20 -left-12 size-48 rounded-full bg-link/5 blur-3xl" aria-hidden />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                        {/* Initials avatar */}
                        <div
                            className="flex size-[4.5rem] shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent/25 to-accent/5 text-xl font-semibold tracking-tight text-accent-foreground ring-2 ring-accent/25 ring-offset-2 ring-offset-[var(--surface)] shadow-lg"
                            aria-hidden
                        >
                            {initialsFromName(contact.name)}
                        </div>

                        <div className="min-w-0 space-y-2">
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground truncate">
                                {contact.name?.trim() || "Unnamed contact"}
                            </h2>
                            <div className="flex flex-wrap items-center gap-2">
                                {contact.title?.trim() ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-secondary/80 px-3 py-1 text-xs font-medium text-foreground">
                                        <Briefcase className="size-3.5 text-muted" strokeWidth={2} />
                                        {contact.title.trim()}
                                    </span>
                                ) : null}
                                {contact.company?.trim() ? (
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-secondary/80 px-3 py-1 text-xs font-medium text-foreground">
                                        <Building2 className="size-3.5 text-muted" strokeWidth={2} />
                                        {contact.company.trim()}
                                    </span>
                                ) : null}
                                <StatusChip status={contact.status} />
                            </div>
                            {contact.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                    {contact.tags.map((tag) => (
                                        <Chip key={tag} size="sm" variant="soft">
                                            <Chip.Label>{tag}</Chip.Label>
                                        </Chip>
                                    ))}
                                </div>
                            )}
                            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                                <span className="inline-flex items-center gap-1.5">
                                    <CalendarClock className="size-3.5 shrink-0 opacity-80" strokeWidth={2} />
                                    Added {formatShortDate(contact.created_at)}
                                </span>
                                <span className="hidden sm:inline text-border">·</span>
                                <span className="inline-flex items-center gap-1.5">
                                    Updated {formatShortDate(contact.updated_at)}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Right side: links + edit button */}
                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end sm:items-start">
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
                        <Button size="sm" variant="secondary" onPress={onEdit}>
                            <Pencil className="size-3.5" />
                            Edit
                        </Button>
                    </div>
                </div>

                <EnrichmentSnapshotPanel
                    summary={contact.lead.enrichment_summary}
                    className="relative mt-6"
                    hideWhenEmpty
                />
            </div>

            {/* Info cards */}
            <div className="grid gap-4 lg:grid-cols-2">
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
                        <div className="flex items-start gap-2 min-w-0">
                            {contact.location?.trim() ? (
                                <MapPin className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden />
                            ) : null}
                            <div className="min-w-0 flex-1">
                                <ProfileValue value={contact.location} />
                            </div>
                        </div>
                    </Row>
                </SectionCard>

                <SectionCard title="Links & presence" icon={Globe}>
                    <Row label="Website">
                        <div className="flex items-start gap-2">
                            {websiteHref ? (
                                <Globe className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden />
                            ) : null}
                            <ProfileValue value={contact.website} href={websiteHref} />
                        </div>
                    </Row>
                    <Row label="LinkedIn">
                        <div className="flex items-start gap-2">
                            {linkedinHref ? (
                                <ExternalLink className="size-4 shrink-0 text-muted mt-0.5" strokeWidth={2} aria-hidden />
                            ) : null}
                            <ProfileValue value={contact.linkedin_url} href={linkedinHref} />
                        </div>
                    </Row>
                </SectionCard>

                <SectionCard title="Context" icon={Tag}>
                    {filterName && (
                        <Row label="Filter">
                            <ProfileValue value={filterName} />
                        </Row>
                    )}
                    <Row label="About">
                        <ProfileValue value={contact.description} emptyLabel="No description on file." />
                    </Row>
                    {contact.notes && (
                        <Row label="Notes">
                            <ProfileValue value={contact.notes} />
                        </Row>
                    )}
                </SectionCard>
            </div>
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
        <Section
            title="Edit contact"
            action={
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onPress={onDone} isDisabled={updateProfile.isPending}>
                        <X className="size-3.5" />
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        isDisabled={!dirty || updateProfile.isPending}
                        isPending={updateProfile.isPending}
                        onPress={handleSave}
                    >
                        Save changes
                    </Button>
                </div>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
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
                <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
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
                <OverviewUrlField id="pf-website" label="Website" value={draft.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://example.com" Icon={Globe} openAriaLabel="Open website in new tab" />
                <OverviewUrlField id="pf-linkedin" label="LinkedIn" value={draft.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/…" Icon={ExternalLink} openAriaLabel="Open LinkedIn profile in new tab" />
            </div>
            <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-description">Description</Label>
                <TextArea id="pf-description" rows={4} placeholder="Short summary or notes about this contact…" value={draft.description} onChange={(e) => setField("description", e.target.value)} />
            </div>
            <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wide">Source</p>
                <div className="mt-0.5">
                    <SourceBadge source={contact.lead.source_type} />
                </div>
            </div>
        </Section>
    );
}

