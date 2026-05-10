import { useMemo, useState } from "react";
import { Button, Input, Label, TextArea } from "@heroui/react";
import { Globe, Link as LinkIcon } from "lucide-react";
import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import { useEnrichContact, useUpdateContact } from "@/features/contacts/hooks/use-contacts";
import { SourceBadge } from "@/components/ui/source-badge";
import { OverviewUrlField } from "@/components/ui/overview-url-field";
import { EnrichmentActionPopover } from "@/components/ui/enrichment-action-popover";
import { EnrichmentSnapshotPanel } from "@/components/ui/enrichment-snapshot-panel";
import { Section } from "./section";
import type { ProfileDraft } from "../types";
import { profileDraftFromContact } from "../utils/profile-draft";

interface OverviewTabProps {
  contact: Contact;
}

export function OverviewTab({ contact }: OverviewTabProps) {
  const updateProfile = useUpdateContact();
  const enrichContactMut = useEnrichContact();
  const [draft, setDraft] = useState<ProfileDraft>(() => profileDraftFromContact(contact));
  const dirty = useMemo(() => {
    const prev = profileDraftFromContact(contact);
    return (Object.keys(prev) as (keyof ProfileDraft)[]).some((k) => draft[k].trim() !== prev[k].trim());
  }, [contact, draft]);

  const setField = <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => setDraft((p) => ({ ...p, [key]: value }));

  const handleSave = () => {
    const t = (s: string) => s.trim();
    updateProfile.mutate({
      uuid: contact.uuid,
      payload: {
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
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Section
        title="Contact"
        action={
          <Button size="sm" variant="secondary" isDisabled={!dirty || updateProfile.isPending} isPending={updateProfile.isPending} onPress={handleSave}>
            Save changes
          </Button>
        }
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          <OverviewUrlField id="pf-linkedin" label="LinkedIn" value={draft.linkedin_url} onChange={(e) => setField("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/…" Icon={LinkIcon} openAriaLabel="Open LinkedIn profile in new tab" />
          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="pf-name">Name</Label>
            <Input id="pf-name" placeholder="Full name" value={draft.name} onChange={(e) => setField("name", e.target.value)} />
          </div>
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

      <EnrichmentSnapshotPanel className="max-w-5xl" summary={contact.lead.enrichment_summary} emptyLabel="No enrichment available yet." action={<EnrichmentActionPopover mode="contact" initialSources={contact.filter?.enrichment_sources} isPending={enrichContactMut.isPending} onEnrich={(sources) => enrichContactMut.mutate({ uuid: contact.uuid, sources })} />} />
    </div>
  );
}
