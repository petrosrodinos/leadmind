import type { QueryClient } from "@tanstack/react-query";
import {
    LeadStatus,
    type Contact,
    type PaginatedContacts,
} from "@/features/contacts/interfaces/contact.interface";
import { contactsQueryKeys } from "@/features/contacts/hooks/use-contacts";
import { contactListQueryKeys } from "@/features/contact-lists/hooks/use-contact-lists";
import type { PaginatedListMembers } from "@/features/contact-lists/interfaces/contact-list.interface";
import { sendHistoryQueryKeys } from "@/features/outreach/hooks/use-send-history";

const SEND_STATUS_SYNC_DELAYS_MS = [2500, 8000] as const;

export function promoteContactNewToContacted(qc: QueryClient, contactUuid: string) {
    const detail = qc.getQueryData<Contact>(contactsQueryKeys.detail(contactUuid));
    if (detail?.status === LeadStatus.NEW) {
        qc.setQueryData<Contact>(contactsQueryKeys.detail(contactUuid), {
            ...detail,
            status: LeadStatus.CONTACTED,
        });
    }

    const lists = qc.getQueriesData<PaginatedContacts>({ queryKey: ["contacts", "list"] });
    for (const [key, value] of lists) {
        if (!value?.data.some((c) => c.uuid === contactUuid && c.status === LeadStatus.NEW)) {
            continue;
        }
        qc.setQueryData<PaginatedContacts>(key, {
            ...value,
            data: value.data.map((c) =>
                c.uuid === contactUuid && c.status === LeadStatus.NEW
                    ? { ...c, status: LeadStatus.CONTACTED }
                    : c,
            ),
        });
    }

    const listMembers = qc.getQueriesData<PaginatedListMembers>({
        queryKey: ["contact-lists", "members"],
    });
    for (const [key, value] of listMembers) {
        if (!value?.data.some((c) => c.uuid === contactUuid && c.status === LeadStatus.NEW)) {
            continue;
        }
        qc.setQueryData<PaginatedListMembers>(key, {
            ...value,
            data: value.data.map((c) =>
                c.uuid === contactUuid && c.status === LeadStatus.NEW
                    ? { ...c, status: LeadStatus.CONTACTED }
                    : c,
            ),
        });
    }
}

export async function syncCachesAfterOutreachSend(
    qc: QueryClient,
    vars: { contact_uuid?: string; campaign_uuid?: string; contact_uuids?: string[] },
) {
    const contactUuids = [
        ...new Set(
            [
                ...(vars.contact_uuid ? [vars.contact_uuid] : []),
                ...(vars.contact_uuids ?? []),
            ].filter(Boolean),
        ),
    ];

    await Promise.all([
        qc.invalidateQueries({ queryKey: sendHistoryQueryKeys.all }),
        ...contactUuids.flatMap((uuid) => [
            qc.invalidateQueries({ queryKey: contactsQueryKeys.detail(uuid) }),
            qc.invalidateQueries({ queryKey: contactsQueryKeys.messages(uuid) }),
            qc.invalidateQueries({ queryKey: contactsQueryKeys.interactions(uuid) }),
        ]),
        ...(vars.campaign_uuid
            ? [
                  qc.invalidateQueries({
                      queryKey: ["marketing-campaigns", "draft-messages", vars.campaign_uuid],
                  }),
                  qc.invalidateQueries({
                      queryKey: ["marketing-campaigns", "detail", vars.campaign_uuid],
                  }),
              ]
            : []),
    ]);

    for (const uuid of contactUuids) {
        promoteContactNewToContacted(qc, uuid);
    }

    for (const delayMs of SEND_STATUS_SYNC_DELAYS_MS) {
        window.setTimeout(() => {
            void qc.invalidateQueries({
                queryKey: contactsQueryKeys.all,
                refetchType: "all",
            });
            void qc.invalidateQueries({
                queryKey: contactListQueryKeys.all,
                refetchType: "all",
            });
            void qc.invalidateQueries({ queryKey: sendHistoryQueryKeys.all });
        }, delayMs);
    }
}
