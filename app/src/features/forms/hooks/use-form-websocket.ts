import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { websocketSubscribe } from "@/features/websocket/services/websocket.service";
import { WEBSOCKET_EVENTS } from "@/features/websocket/interfaces/websocket-events.constants";
import { formQueryKeys } from "./use-forms";

export function useFormWebSocket() {
    const qc = useQueryClient();

    useEffect(() => {
        const invalidateAll = () => qc.invalidateQueries({ queryKey: formQueryKeys.all });

        const onCreated = websocketSubscribe(WEBSOCKET_EVENTS.FORM.CREATED, () => invalidateAll());

        const onUpdated = websocketSubscribe<{ uuid: string }>(
            WEBSOCKET_EVENTS.FORM.UPDATED,
            (data) => {
                invalidateAll();
                if (data?.uuid) {
                    qc.invalidateQueries({ queryKey: formQueryKeys.detail(data.uuid) });
                }
            },
        );

        const onDeleted = websocketSubscribe(WEBSOCKET_EVENTS.FORM.DELETED, () => invalidateAll());

        const onCompletionCreated = websocketSubscribe<{ form_uuid: string }>(
            WEBSOCKET_EVENTS.FORM_COMPLETION.CREATED,
            (data) => {
                if (data?.form_uuid) {
                    qc.invalidateQueries({ queryKey: ["forms", data.form_uuid, "completions"] });
                    qc.invalidateQueries({ queryKey: formQueryKeys.detail(data.form_uuid) });
                }
                qc.invalidateQueries({ queryKey: ["form-completions"] });
            },
        );

        const onCompletionUpdated = websocketSubscribe<{ form_uuid: string }>(
            WEBSOCKET_EVENTS.FORM_COMPLETION.UPDATED,
            (data) => {
                if (data?.form_uuid) {
                    qc.invalidateQueries({ queryKey: ["forms", data.form_uuid, "completions"] });
                }
            },
        );

        const onCompletionDeleted = websocketSubscribe<{ form_uuid: string }>(
            WEBSOCKET_EVENTS.FORM_COMPLETION.DELETED,
            (data) => {
                if (data?.form_uuid) {
                    qc.invalidateQueries({ queryKey: ["forms", data.form_uuid, "completions"] });
                    qc.invalidateQueries({ queryKey: formQueryKeys.detail(data.form_uuid) });
                }
                qc.invalidateQueries({ queryKey: ["form-completions"] });
            },
        );

        return () => {
            onCreated.unsubscribe();
            onUpdated.unsubscribe();
            onDeleted.unsubscribe();
            onCompletionCreated.unsubscribe();
            onCompletionUpdated.unsubscribe();
            onCompletionDeleted.unsubscribe();
        };
    }, [qc]);
}
