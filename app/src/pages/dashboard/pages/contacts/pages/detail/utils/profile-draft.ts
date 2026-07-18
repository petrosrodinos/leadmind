import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import type { ProfileDraft } from "../types";

export function profileDraftFromContact(contact: Contact): ProfileDraft {
  return {
    list_uuids: (contact.lists ?? []).map((l) => l.uuid),
    name: contact.name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
    website: contact.website ?? "",
    google_maps_url: contact.google_maps_url ?? "",
    title: contact.title ?? "",
    location: contact.location ?? "",
    linkedin_url: contact.linkedin_url ?? "",
    industry: contact.industry ?? "",
    description: contact.description ?? "",
  };
}

export function sameUuidSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((id) => set.has(id));
}
