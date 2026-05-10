import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createContact,
    createContactFromLead,
    deleteContact,
    enrichContact,
    getContact,
    listContactInteractions,
    listContactMessages,
    listContacts,
    triggerContactScore,
    triggerDraftMessages,
    updateContact,
    updateContactNotes,
    updateContactStatus,
    updateContactTags,
} from "../services/contacts.service";
import type {
    Contact,
    CreateContactPayload,
    LeadStatus,
    ListContactsQuery,
    PaginatedContacts,
    UpdateContactPayload,
} from "../interfaces/contact.interface";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";
import { toast } from "@/hooks/use-toast";

export const contactsQueryKeys = {
    all: ["contacts"] as const,
    list: (query: ListContactsQuery) => ["contacts", "list", query] as const,
    detail: (uuid: string) => ["contacts", "detail", uuid] as const,
    messages: (uuid: string) => ["outreach-messages", uuid] as const,
    interactions: (uuid: string) => ["contact-interactions", uuid] as const,
};

const anyContactProcessing = (page: PaginatedContacts | undefined): boolean => {
    if (!page) return false;
    return page.data.some((c) => c.score == null);
};

export function useContacts(query: ListContactsQuery) {
    return useQuery({
        queryKey: contactsQueryKeys.list(query),
        queryFn: () => listContacts(query),
        placeholderData: (prev) => prev,
        refetchInterval: (q) => (anyContactProcessing(q.state.data) ? 30_000 : false),
    });
}

export function useContact(uuid: string | null | undefined) {
    return useQuery({
        queryKey: uuid ? contactsQueryKeys.detail(uuid) : ["contacts", "detail", "none"],
        queryFn: () => getContact(uuid as string),
        enabled: !!uuid,
        refetchInterval: (q) => {
            const c = q.state.data as Contact | undefined;
            if (!c) return false;
            const drafting = c.outreach_messages?.length === 0;
            const scoring = c.score == null;
            return drafting || scoring ? 30_000 : false;
        },
    });
}

export function useContactMessages(uuid: string | null | undefined) {
    return useQuery({
        queryKey: uuid ? contactsQueryKeys.messages(uuid) : ["outreach-messages", "none"],
        queryFn: () => listContactMessages(uuid as string),
        enabled: !!uuid,
    });
}

export function useContactInteractions(uuid: string | null | undefined) {
    return useQuery({
        queryKey: uuid ? contactsQueryKeys.interactions(uuid) : ["contact-interactions", "none"],
        queryFn: () => listContactInteractions(uuid as string),
        enabled: !!uuid,
    });
}

export function useCreateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateContactPayload) => createContact(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
            toast({ title: "Lead added", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not add lead",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useDeleteContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteContact(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
            toast({ title: "Contact deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete contact",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useAddLeadToCrm() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (lead_uuid: string) => createContactFromLead(lead_uuid),
        onSuccess: () => {
            toast({
                title: "Added to your CRM",
                description: "The lead is now in your contacts.",
                duration: 2500,
            });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not add lead",
                description: error.message,
                duration: 3000,
                variant: (error as any).status === 409 ? undefined : "error",
            });
        },
    });
}

export function useUpdateContactStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; status: LeadStatus; note?: string }) =>
            updateContactStatus(vars.uuid, {
                status: vars.status,
                note: vars.note,
            }),
        onMutate: async (vars) => {
            await qc.cancelQueries({ queryKey: contactsQueryKeys.all });
            const lists = qc.getQueriesData<PaginatedContacts>({ queryKey: ["contacts", "list"] });
            for (const [key, value] of lists) {
                if (!value) continue;
                qc.setQueryData<PaginatedContacts>(key, {
                    ...value,
                    data: value.data.map((c) =>
                        c.uuid === vars.uuid ? { ...c, status: vars.status } : c,
                    ),
                });
            }
            const detail = qc.getQueryData<Contact>(contactsQueryKeys.detail(vars.uuid));
            if (detail) {
                qc.setQueryData<Contact>(contactsQueryKeys.detail(vars.uuid), {
                    ...detail,
                    status: vars.status,
                });
            }
            return { lists, detail };
        },
        onError: (error: Error, _vars, ctx) => {
            for (const [key, value] of ctx?.lists ?? []) {
                qc.setQueryData(key, value);
            }
            if (ctx?.detail) {
                qc.setQueryData(contactsQueryKeys.detail(ctx.detail.uuid), ctx.detail);
            }
            toast({
                title: "Could not update status",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
        onSettled: (_data, _error, vars) => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.interactions(vars.uuid) });
        },
    });
}

export function useUpdateContactTags() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; tags: string[] }) =>
            updateContactTags(vars.uuid, vars.tags),
        onMutate: async (vars) => {
            await qc.cancelQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
            const detail = qc.getQueryData<Contact>(contactsQueryKeys.detail(vars.uuid));
            if (detail) {
                qc.setQueryData<Contact>(contactsQueryKeys.detail(vars.uuid), {
                    ...detail,
                    tags: vars.tags,
                });
            }
            return { detail };
        },
        onError: (error: Error, vars, ctx) => {
            if (ctx?.detail) {
                qc.setQueryData(contactsQueryKeys.detail(vars.uuid), ctx.detail);
            }
            toast({
                title: "Could not update tags",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
        },
    });
}

export function useUpdateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateContactPayload }) =>
            updateContact(vars.uuid, vars.payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
            toast({ title: "Contact updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not update contact",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useUpdateContactNotes() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; notes: string }) =>
            updateContactNotes(vars.uuid, vars.notes),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.interactions(vars.uuid) });
            toast({ title: "Notes saved", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not save notes",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useRescoreContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => triggerContactScore(uuid),
        onSuccess: (_data, uuid) => {
            toast({
                title: "Rescore queued",
                description: "We'll refresh the AI score shortly.",
                duration: 2500,
            });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(uuid) });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not enqueue rescore",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useRedraftMessages() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => triggerDraftMessages(uuid),
        onSuccess: (_data, uuid) => {
            toast({
                title: "Redraft queued",
                description: "AI is generating new outreach drafts.",
                duration: 2500,
            });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(uuid) });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.messages(uuid) });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not enqueue redraft",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useEnrichContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; sources?: EnrichmentSource[] }) =>
            enrichContact(vars.uuid, { sources: vars.sources }),
        onSuccess: (_data, vars) => {
            toast({
                title: "Enrichment queued",
                description: "We will refresh public enrichment data shortly.",
                duration: 2500,
            });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not queue enrichment",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
