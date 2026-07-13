import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    aiDraftMessage,
    bulkAiDraftMessages,
    createContact,
    createContactFromLead,
    deleteContact,
    enrichContact,
    getContact,
    getContactTags,
    listContactInteractions,
    listContactMessages,
    listContacts,
    logCall,
    logEmail,
    logMeeting,
    logSms,
    triggerContactScore,
    triggerContactsBulkScore,
    bulkScrapeContactEmails,
    triggerDraftMessages,
    updateContact,
    updateContactNotes,
    updateContactStatus,
    updateContactTags,
} from "../services/contacts.service";
import type {
    AiDraftMessagePayload,
    BulkAiDraftMessagesPayload,
    BulkCreateMessageResult,
    BulkTriggerContactScorePayload,
    BulkScrapeContactEmailsPayload,
    Contact,
    CreateContactPayload,
    LeadStatus,
    ListContactsQuery,
    LogCallPayload,
    LogEmailPayload,
    LogMeetingPayload,
    LogSmsPayload,
    PaginatedContacts,
    UpdateContactPayload,
} from "../interfaces/contact.interface";
import { enrichmentQueryKeys } from "@/features/enrichment/hooks/use-enrichment";
import { contactListQueryKeys } from "@/features/contact-lists/hooks/use-contact-lists";
import type { PaginatedListMembers } from "@/features/contact-lists/interfaces/contact-list.interface";
import type { EnrichmentSource } from "@/features/enrichment/constants/enrichment-sources";
import { toast } from "@/hooks/use-toast";

export const contactsQueryKeys = {
    all: ["contacts"] as const,
    list: (query: ListContactsQuery) => ["contacts", "list", query] as const,
    detail: (uuid: string) => ["contacts", "detail", uuid] as const,
    messages: (uuid: string) => ["outreach-messages", uuid] as const,
    interactions: (uuid: string) => ["contact-interactions", uuid] as const,
    tags: ["contact-tags"] as const,
};

function contactNeedsScoring(c: Contact): boolean {
    const defs = c.filter?.scoring_instructions ?? [];
    if (defs.length === 0) return false;
    const scored = new Set((c.contact_scores ?? []).map((s) => s.scoring_instruction_uuid));
    return defs.some((d) => !scored.has(d.uuid));
}

const anyContactProcessing = (page: PaginatedContacts | undefined): boolean => {
    if (!page) return false;
    return page.data.some((c) => contactNeedsScoring(c));
};

export function useContactTags() {
    return useQuery({
        queryKey: contactsQueryKeys.tags,
        queryFn: getContactTags,
        staleTime: 30_000,
    });
}

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
            const scoring = contactNeedsScoring(c);
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
            const listMembers = qc.getQueriesData<PaginatedListMembers>({
                queryKey: ["contact-lists", "members"],
            });
            for (const [key, value] of lists) {
                if (!value) continue;
                qc.setQueryData<PaginatedContacts>(key, {
                    ...value,
                    data: value.data.map((c) =>
                        c.uuid === vars.uuid ? { ...c, status: vars.status } : c,
                    ),
                });
            }
            for (const [key, value] of listMembers) {
                if (!value) continue;
                qc.setQueryData<PaginatedListMembers>(key, {
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
            return { lists, listMembers, detail };
        },
        onError: (error: Error, _vars, ctx) => {
            for (const [key, value] of ctx?.lists ?? []) {
                qc.setQueryData(key, value);
            }
            for (const [key, value] of ctx?.listMembers ?? []) {
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
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
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
            qc.invalidateQueries({ queryKey: contactsQueryKeys.tags });
        },
    });
}

export function useUpdateContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateContactPayload }) =>
            updateContact(vars.uuid, vars.payload),
        onMutate: async (vars) => {
            await qc.cancelQueries({ queryKey: contactsQueryKeys.all });
            await qc.cancelQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
            const lists = qc.getQueriesData<PaginatedContacts>({ queryKey: ["contacts", "list"] });
            const listMembers = qc.getQueriesData<PaginatedListMembers>({
                queryKey: ["contact-lists", "members"],
            });
            for (const [key, value] of lists) {
                if (!value) continue;
                qc.setQueryData<PaginatedContacts>(key, {
                    ...value,
                    data: value.data.map((c) =>
                        c.uuid === vars.uuid ? ({ ...c, ...vars.payload } as Contact) : c,
                    ),
                });
            }
            for (const [key, value] of listMembers) {
                if (!value) continue;
                qc.setQueryData<PaginatedListMembers>(key, {
                    ...value,
                    data: value.data.map((c) =>
                        c.uuid === vars.uuid ? ({ ...c, ...vars.payload } as Contact) : c,
                    ),
                });
            }
            const detail = qc.getQueryData<Contact>(contactsQueryKeys.detail(vars.uuid));
            if (detail) {
                qc.setQueryData<Contact>(contactsQueryKeys.detail(vars.uuid), {
                    ...detail,
                    ...vars.payload,
                } as Contact);
            }
            return { lists, listMembers, detail };
        },
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
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

function ensureContactCanRescore(contact: Contact): void {
    if (!contact.filter) {
        throw new Error("This contact has no filter. Assign a filter before rescoring.");
    }
    const defs = contact.filter.scoring_instructions ?? [];
    if (defs.length === 0) {
        throw new Error("Attach scoring instructions to the filter before rescoring.");
    }
}

export function useRescoreContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { contact: Contact; scoring_instruction_uuids?: string[] }) => {
            ensureContactCanRescore(vars.contact);
            return triggerContactScore(
                vars.contact.uuid,
                vars.scoring_instruction_uuids,
            );
        },
        onSuccess: (_data, vars) => {
            toast({
                title: "Rescore queued",
                description: "We'll refresh the AI score shortly.",
                duration: 2500,
            });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.contact.uuid) });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
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

export function useBulkTriggerContactScore() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: BulkTriggerContactScorePayload) => triggerContactsBulkScore(payload),
        onSuccess: (data, vars) => {
            const skip = data.skipped_contacts > 0 ? ` (${data.skipped_contacts} skipped — no matching rules on their filter.)` : "";
            if (data.is_batch) {
                toast({
                    title: "Batch scoring submitted",
                    description: `${data.queued} request${data.queued === 1 ? "" : "s"} queued for batch processing — results available within 24h (50% cheaper).${skip}`,
                    duration: 5000,
                });
            } else {
                toast({
                    title: "Scoring queued",
                    description: `${data.queued} job${data.queued === 1 ? "" : "s"} enqueued.${skip}`,
                    duration: 3500,
                });
                qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
                for (const uuid of vars.contact_uuids) {
                    qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(uuid) });
                }
            }
        },
        onError: (error: Error) => {
            toast({
                title: "Could not enqueue scoring",
                description: error.message,
                duration: 4000,
                variant: "error",
            });
        },
    });
}

export function useBulkScrapeContactEmails() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: BulkScrapeContactEmailsPayload) => bulkScrapeContactEmails(payload),
        onSuccess: (data) => {
            const skip =
                data.skipped > 0
                    ? ` (${data.skipped} skipped — already have email or no website)`
                    : "";
            toast({
                title: "Website email lookup started",
                description: `${data.queued} contact${data.queued === 1 ? "" : "s"} queued${skip}. Results will appear as crawls finish.`,
                duration: 4500,
            });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not start email lookup",
                description: error.message,
                duration: 4000,
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

export function useAiDraftMessage() {
    return useMutation({
        mutationFn: (payload: AiDraftMessagePayload) => aiDraftMessage(payload),
        onError: (error: Error) => {
            toast({
                title: "AI draft failed",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useLogCall() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: LogCallPayload }) =>
            logCall(vars.uuid, vars.payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.interactions(vars.uuid) });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
            toast({ title: "Call logged", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not log call",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useLogMeeting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: LogMeetingPayload }) =>
            logMeeting(vars.uuid, vars.payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.interactions(vars.uuid) });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
            toast({ title: "Meeting logged", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not log meeting",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useLogEmail() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: LogEmailPayload }) =>
            logEmail(vars.uuid, vars.payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.interactions(vars.uuid) });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
            toast({ title: "Email logged", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not log email",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useLogSms() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: LogSmsPayload }) =>
            logSms(vars.uuid, vars.payload),
        onSuccess: (_data, vars) => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.interactions(vars.uuid) });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
            toast({ title: "SMS logged", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not log SMS",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

function formatBulkAiDraftResult(result: BulkCreateMessageResult, send?: boolean): string {
    const parts: string[] = [];
    if (result.created > 0) parts.push(`${result.created} generated`);
    if (result.skipped > 0) parts.push(`${result.skipped} skipped`);
    if (result.failed > 0) parts.push(`${result.failed} failed`);
    if (send && result.queued != null) parts.push(`${result.queued} queued for send`);
    return parts.length > 0 ? parts.join(", ") : "No drafts created";
}

export function useBulkAiDraftMessages() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: BulkAiDraftMessagesPayload) => bulkAiDraftMessages(payload),
        onSuccess: (result, vars) => {
            qc.invalidateQueries({ queryKey: contactsQueryKeys.all });
            for (const uuid of vars.contact_uuids) {
                qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(uuid) });
                qc.invalidateQueries({ queryKey: contactsQueryKeys.messages(uuid) });
            }
            toast({
                title: vars.send ? "Messages generated" : "Drafts generated",
                description: formatBulkAiDraftResult(result, vars.send),
                duration: 3500,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not generate messages",
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
                description: "We will refresh contact enrichment data shortly.",
                duration: 2500,
            });
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(vars.uuid) });
            qc.invalidateQueries({ queryKey: [...enrichmentQueryKeys.all, "list", "contact", vars.uuid] });
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
