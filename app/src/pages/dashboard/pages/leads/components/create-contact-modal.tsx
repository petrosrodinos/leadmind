import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Chip, FieldError, Input, Label, Modal, TextArea } from "@heroui/react";
import { ActionButtonWithPending } from "@/components/ui/action-button-with-pending";
import { MultiSelect } from "@/components/ui/multi-select";
import { Plus, X } from "lucide-react";
import { useCreateContact } from "@/features/contacts/hooks/use-contacts";
import type { CreateContactPayload } from "@/features/contacts/interfaces/contact.interface";
import { useFilters } from "@/features/filters/hooks/use-filters";
import { Routes } from "@/routes/routes";

interface CreateContactModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyForm = (): CreateContactPayload => ({
  filter_uuid: "",
  name: "",
  email: "",
  phone: "",
  company: "",
  website: "",
  title: "",
  location: "",
  linkedin_url: "",
  industry: "",
  description: "",
  tags: [],
  notes: "",
});

export function CreateContactModal({ isOpen, onOpenChange }: CreateContactModalProps) {
  const navigate = useNavigate();
  const createContact = useCreateContact();
  const { data: filters = [] } = useFilters();

  const [form, setForm] = useState<CreateContactPayload>(emptyForm());
  const [tagDraft, setTagDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(emptyForm());
      setTagDraft("");
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || filters.length === 0) return;
    setForm((prev) => {
      if (prev.filter_uuid && filters.some((f) => f.uuid === prev.filter_uuid)) {
        return prev;
      }
      return { ...prev, filter_uuid: filters[0].uuid };
    });
  }, [isOpen, filters]);

  const set = <K extends keyof CreateContactPayload>(key: K, value: CreateContactPayload[K]) => setForm((f) => ({ ...f, [key]: value }));

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    const tags = form.tags ?? [];
    if (tags.includes(t)) {
      setTagDraft("");
      return;
    }
    set("tags", [...tags, t]);
    setTagDraft("");
  };

  const removeTag = (tag: string) =>
    set(
      "tags",
      (form.tags ?? []).filter((t) => t !== tag),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed: Partial<CreateContactPayload> = {};
    for (const k of ["name", "email", "phone", "company", "website", "title", "location", "linkedin_url", "industry", "description", "notes"] as const) {
      const v = form[k]?.trim();
      if (v) trimmed[k] = v;
    }
    if (form.tags && form.tags.length > 0) trimmed.tags = form.tags;

    const filterUuid = form.filter_uuid?.trim() ?? "";
    if (!filterUuid) {
      setError(filters.length === 0 ? "Create a filter in Filters before adding a lead." : "Select a filter.");
      return;
    }

    const hasIdentifier = !!trimmed.name || !!trimmed.email || !!trimmed.phone || !!trimmed.company;
    if (!hasIdentifier) {
      setError("Provide at least one of: name, email, phone, or company.");
      return;
    }

    try {
      const created = await createContact.mutateAsync({
        ...trimmed,
        filter_uuid: filterUuid,
      } as CreateContactPayload);
      onOpenChange(false);
      navigate(Routes.dashboard.contacts_detail.replace(":uuid", created.uuid));
    } catch {
      // toast already shown by hook
    }
  };

  return (
    <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
      <Modal.Container>
        <Modal.Dialog className="sm:max-w-2xl max-h-[90dvh]">
          <Modal.CloseTrigger />
          <Modal.Header className="shrink-0">
            <Modal.Heading>Add contact manually</Modal.Heading>
          </Modal.Header>
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
            <Modal.Body className="min-h-0 flex-1 overflow-y-auto p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label>Filter</Label>
                  <MultiSelect
                    selectionMode="single"
                    aria-label="Filter"
                    placeholder={filters.length === 0 ? "No filters yet" : "Select a filter"}
                    searchPlaceholder="Search filters…"
                    disabled={filters.length === 0}
                    options={[...filters]
                      .toSorted((a, b) => a.name.localeCompare(b.name))
                      .map((f) => ({ value: f.uuid, label: f.name }))}
                    value={form.filter_uuid ? [form.filter_uuid] : []}
                    onChange={(next) => set("filter_uuid", next[0] ?? "")}
                  />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="cl-name">Name</Label>
                  <Input id="cl-name" placeholder="Jane Doe" value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-email">Email</Label>
                  <Input id="cl-email" type="email" placeholder="jane@example.com" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-phone">Phone</Label>
                  <Input id="cl-phone" placeholder="+1 555 0100" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-company">Company</Label>
                  <Input id="cl-company" placeholder="Acme Inc" value={form.company ?? ""} onChange={(e) => set("company", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-website">Website</Label>
                  <Input id="cl-website" placeholder="acme.com" value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-title">Title</Label>
                  <Input id="cl-title" placeholder="Head of Sales" value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-location">Location</Label>
                  <Input id="cl-location" placeholder="Athens, Greece" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-linkedin">LinkedIn URL</Label>
                  <Input id="cl-linkedin" placeholder="https://linkedin.com/in/..." value={form.linkedin_url ?? ""} onChange={(e) => set("linkedin_url", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cl-industry">Industry</Label>
                  <Input id="cl-industry" placeholder="Software" value={form.industry ?? ""} onChange={(e) => set("industry", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="cl-description">Description</Label>
                  <TextArea id="cl-description" rows={3} placeholder="Short summary…" value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-2 py-1.5">
                    {(form.tags ?? []).map((tag) => (
                      <Chip key={tag} size="sm" variant="soft">
                        <Chip.Label>{tag}</Chip.Label>
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-muted hover:text-danger" aria-label={`Remove ${tag}`}>
                          <X className="size-3" />
                        </button>
                      </Chip>
                    ))}
                    <Input
                      value={tagDraft}
                      onChange={(e) => setTagDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          addTag();
                        } else if (e.key === "Backspace" && tagDraft === "" && (form.tags ?? []).length > 0) {
                          set("tags", (form.tags ?? []).slice(0, -1));
                        }
                      }}
                      placeholder={(form.tags ?? []).length === 0 ? "Type a tag and press Enter" : ""}
                      className="flex-1 min-w-32 h-7 px-1 text-sm bg-transparent border-0 shadow-none focus-visible:ring-0"
                      aria-label="New tag"
                    />
                  </div>
                  <p className="text-xs text-muted">Press Enter or comma to add. Backspace removes the last tag.</p>
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label htmlFor="cl-notes">Notes</Label>
                  <TextArea id="cl-notes" rows={4} placeholder="Anything you want to remember about this lead…" value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
                </div>
              </div>

              {error && (
                <div className="mt-3">
                  <FieldError>{error}</FieldError>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer className="shrink-0">
              <Button slot="close" variant="secondary" type="button">
                Cancel
              </Button>
              <ActionButtonWithPending
                type="submit"
                isDisabled={createContact.isPending || filters.length === 0}
                isPending={createContact.isPending}
                idleLeading={<Plus className="size-4" />}
              >
                Add contact
              </ActionButtonWithPending>
            </Modal.Footer>
          </form>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  );
}
