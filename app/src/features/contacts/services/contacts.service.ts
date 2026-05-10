import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type { EnrichmentSource } from "@/features/lead-enrichment/constants/enrichment-sources";
import type {
    Contact,
    CreateContactPayload,
    Interaction,
    ListContactsQuery,
    OutreachMessage,
    PaginatedContacts,
    UpdateContactPayload,
} from "../interfaces/contact.interface";
import type { LeadStatus } from "../interfaces/contact.interface";

export const listContacts = async (
    query: ListContactsQuery = {},
): Promise<PaginatedContacts> => {
    try {
        const params: Record<string, unknown> = { ...query };
        if (Array.isArray(query.tags)) {
            params.tags = query.tags.length > 0 ? query.tags.join(",") : undefined;
        }
        const response = await axiosInstance.get(ApiRoutes.contacts.list, { params });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load contacts.");
    }
};

export const getContact = async (uuid: string): Promise<Contact> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.contacts.get(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load contact.");
    }
};

export const createContact = async (payload: CreateContactPayload): Promise<Contact> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.contacts.create, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create contact.");
    }
};

export const deleteContact = async (uuid: string): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.contacts.remove(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete contact.");
    }
};

export const createContactFromLead = async (lead_uuid: string): Promise<Contact> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.contacts.from_lead(lead_uuid));
        return response.data;
    } catch (error: any) {
        if (error?.response?.status === 409) {
            const err = new Error("This lead is already in your CRM.");
            (err as any).status = 409;
            throw err;
        }
        throw new Error(error?.response?.data?.message || "Failed to add lead to CRM.");
    }
};

export const updateContactStatus = async (
    uuid: string,
    payload: { status: LeadStatus; note?: string },
): Promise<Contact> => {
    try {
        const body: { status: LeadStatus; note?: string } = { status: payload.status };
        const trimmed = payload.note?.trim();
        if (trimmed) {
            body.note = trimmed;
        }
        const response = await axiosInstance.put(ApiRoutes.contacts.update_status(uuid), body);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update status.");
    }
};

export const updateContactTags = async (
    uuid: string,
    tags: string[],
): Promise<Contact> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.contacts.update_tags(uuid), {
            tags,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update tags.");
    }
};

export const updateContact = async (
    uuid: string,
    payload: UpdateContactPayload,
): Promise<Contact> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.contacts.update(uuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update contact.");
    }
};

export const updateContactNotes = async (
    uuid: string,
    notes: string,
): Promise<Contact> => {
    return updateContact(uuid, { notes });
};

export const triggerContactScore = async (uuid: string): Promise<{ jobId: string }> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.contacts.score(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to enqueue rescore.");
    }
};

export const triggerDraftMessages = async (uuid: string): Promise<{ jobId: string }> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.contacts.draft_messages(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to enqueue redraft.");
    }
};

export const enrichContact = async (
    uuid: string,
    payload: { sources?: EnrichmentSource[] } = {},
): Promise<{ jobId: string }> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.contacts.enrich(uuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to queue enrichment.");
    }
};

export const listContactMessages = async (uuid: string): Promise<OutreachMessage[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.contacts.messages(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load messages.");
    }
};

export const listContactInteractions = async (uuid: string): Promise<Interaction[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.contacts.interactions(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load interactions.");
    }
};
