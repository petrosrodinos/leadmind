import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    AddListContactsPayload,
    AddListContactsResult,
    BulkAddListContactsPayload,
    ContactList,
    CreateContactListPayload,
    ListContactListMembersQuery,
    ListContactListsQuery,
    PaginatedContactLists,
    PaginatedListMembers,
    RemoveListContactsResult,
    UpdateContactListPayload,
} from "../interfaces/contact-list.interface";

export const listContactLists = async (
    query: ListContactListsQuery = {},
): Promise<PaginatedContactLists> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.contact_lists.list, { params: query });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load contact lists.");
    }
};

export const getContactList = async (uuid: string): Promise<ContactList> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.contact_lists.get(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load contact list.");
    }
};

export const createContactList = async (
    payload: CreateContactListPayload,
): Promise<ContactList> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.contact_lists.create, payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to create contact list.");
    }
};

export const updateContactList = async (
    uuid: string,
    payload: UpdateContactListPayload,
): Promise<ContactList> => {
    try {
        const response = await axiosInstance.patch(ApiRoutes.contact_lists.update(uuid), payload);
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to update contact list.");
    }
};

export const deleteContactList = async (uuid: string): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.contact_lists.remove(uuid));
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to delete contact list.");
    }
};

export const listContactListMembers = async (
    listUuid: string,
    query: ListContactListMembersQuery = {},
): Promise<PaginatedListMembers> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.contact_lists.contacts(listUuid), {
            params: query,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to load list contacts.");
    }
};

export const addListContacts = async (
    listUuid: string,
    payload: AddListContactsPayload,
): Promise<AddListContactsResult> => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.contact_lists.add_contacts(listUuid),
            payload,
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to add contacts to list.");
    }
};

export const bulkAddListContacts = async (
    listUuid: string,
    payload: BulkAddListContactsPayload,
): Promise<AddListContactsResult> => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.contact_lists.bulk_add_contacts(listUuid),
            payload,
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to bulk add contacts to list.");
    }
};

export const removeListContact = async (
    listUuid: string,
    contactUuid: string,
): Promise<{ contact_uuid: string }> => {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.contact_lists.remove_contact(listUuid, contactUuid),
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to remove contact from list.");
    }
};

export const removeListContactsBulk = async (
    listUuid: string,
    contact_uuids: string[],
): Promise<RemoveListContactsResult> => {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.contact_lists.bulk_remove_contacts(listUuid),
            { contact_uuids },
        );
        return response.data;
    } catch (error: any) {
        throw new Error(error?.response?.data?.message || "Failed to remove contacts from list.");
    }
};
