import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
    addListContacts,
    bulkAddListContacts,
    createContactList,
    deleteContactList,
    getContactList,
    listContactListMembers,
    listContactLists,
    removeListContact,
    removeListContactsBulk,
    updateContactList,
} from "../services/contact-lists.service";
import type {
    AddListContactsPayload,
    BulkAddListContactsPayload,
    CreateContactListPayload,
    ListContactListMembersQuery,
    ListContactListsQuery,
    UpdateContactListPayload,
} from "../interfaces/contact-list.interface";

export const contactListQueryKeys = {
    all: ["contact-lists"] as const,
    list: (query: ListContactListsQuery) => ["contact-lists", "list", query] as const,
    detail: (uuid: string) => ["contact-lists", "detail", uuid] as const,
    members: (uuid: string, query: ListContactListMembersQuery) =>
        ["contact-lists", "members", uuid, query] as const,
};

export function useContactLists(query: ListContactListsQuery = {}, enabled = true) {
    return useQuery({
        queryKey: contactListQueryKeys.list(query),
        queryFn: () => listContactLists(query),
        staleTime: 30_000,
        enabled,
    });
}

export function useContactList(uuid: string) {
    return useQuery({
        queryKey: contactListQueryKeys.detail(uuid),
        queryFn: () => getContactList(uuid),
        staleTime: 30_000,
        enabled: !!uuid,
    });
}

export function useContactListMembers(listUuid: string, query: ListContactListMembersQuery = {}) {
    return useQuery({
        queryKey: contactListQueryKeys.members(listUuid, query),
        queryFn: () => listContactListMembers(listUuid, query),
        staleTime: 30_000,
        enabled: !!listUuid,
    });
}

export function useCreateContactList() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateContactListPayload) => createContactList(payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
            toast({ title: "List created", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not create list",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useUpdateContactList() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { uuid: string; payload: UpdateContactListPayload }) =>
            updateContactList(vars.uuid, vars.payload),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.detail(vars.uuid) });
            toast({ title: "List updated", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not update list",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useDeleteContactList() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (uuid: string) => deleteContactList(uuid),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
            toast({ title: "List deleted", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not delete list",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useAddListContacts() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { listUuid: string; payload: AddListContactsPayload }) =>
            addListContacts(vars.listUuid, vars.payload),
        onSuccess: (result, vars) => {
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.detail(vars.listUuid) });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.members(vars.listUuid, {}) });
            qc.invalidateQueries({ queryKey: ["contacts"] });
            toast({
                title: "Contacts added",
                description: `${result.added} contact${result.added === 1 ? "" : "s"} added to list`,
                duration: 2000,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not add contacts",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useBulkAddListContacts() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { listUuid: string; payload: BulkAddListContactsPayload }) =>
            bulkAddListContacts(vars.listUuid, vars.payload),
        onSuccess: (result, vars) => {
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.detail(vars.listUuid) });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.members(vars.listUuid, {}) });
            qc.invalidateQueries({ queryKey: ["contacts"] });
            toast({
                title: "Bulk add complete",
                description: `${result.added} contact${result.added === 1 ? "" : "s"} added to list`,
                duration: 2000,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not bulk add contacts",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useRemoveListContact() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { listUuid: string; contactUuid: string }) =>
            removeListContact(vars.listUuid, vars.contactUuid),
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.detail(vars.listUuid) });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.members(vars.listUuid, {}) });
            toast({ title: "Contact removed from list", duration: 1500 });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not remove contact",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}

export function useRemoveListContactsBulk() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (vars: { listUuid: string; contactUuids: string[] }) =>
            removeListContactsBulk(vars.listUuid, vars.contactUuids),
        onSuccess: (data, vars) => {
            qc.invalidateQueries({ queryKey: contactListQueryKeys.all });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.detail(vars.listUuid) });
            qc.invalidateQueries({ queryKey: contactListQueryKeys.members(vars.listUuid, {}) });
            toast({
                title: data.removed === 1 ? "Contact removed from list" : "Contacts removed from list",
                description:
                    data.removed === 1
                        ? undefined
                        : `${data.removed} contacts removed from this list.`,
                duration: 2000,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Could not remove contacts",
                description: error.message,
                duration: 3000,
                variant: "error",
            });
        },
    });
}
