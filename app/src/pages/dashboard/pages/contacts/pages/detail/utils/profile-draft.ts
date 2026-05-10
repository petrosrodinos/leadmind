import type { Contact } from "@/features/contacts/interfaces/contact.interface";
import type { ProfileDraft } from "../types";

export function profileDraftFromContact(contact: Contact): ProfileDraft {
  return {
    name: contact.name ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    company: contact.company ?? "",
    website: contact.website ?? "",
    title: contact.title ?? "",
    location: contact.location ?? "",
    linkedin_url: contact.linkedin_url ?? "",
    industry: contact.industry ?? "",
    description: contact.description ?? "",
  };
}
