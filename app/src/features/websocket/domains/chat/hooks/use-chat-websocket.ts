import { useEffect, useCallback } from 'react';
import { useWebsocketStore } from '@/stores/websocket.store';
import { websocketSubscribe } from '../../../services/websocket.service';
import { WEBSOCKET_EVENTS } from '../../../interfaces/websocket-events.constants';
import type { ChatMessagePayload, ChatTypingPayload } from '../../../interfaces/websocket-payloads.interface';
import {
    chatWebsocketJoin,
    chatWebsocketLeave,
    chatWebsocketSendTyping,
    chatWebsocketSendStopTyping,
} from '../services/chat-websocket.service';

export const useChatWebsocket = (chatUuid: string | null) => {
    const { is_connected } = useWebsocketStore();

    useEffect(() => {
        if (!chatUuid || !is_connected) return;

        chatWebsocketJoin(chatUuid);

        return () => {
            chatWebsocketLeave(chatUuid);
        };
    }, [chatUuid, is_connected]);

    const sendTyping = useCallback(() => {
        if (chatUuid) {
            chatWebsocketSendTyping(chatUuid);
        }
    }, [chatUuid]);

    const sendStopTyping = useCallback(() => {
        if (chatUuid) {
            chatWebsocketSendStopTyping(chatUuid);
        }
    }, [chatUuid]);

    return {
        sendTyping,
        sendStopTyping,
    };
};

export const useChatMessages = (
    chatUuid: string | null,
    onMessage: (payload: ChatMessagePayload) => void
) => {
    const { is_connected } = useWebsocketStore();

    useEffect(() => {
        if (!chatUuid || !is_connected) return;

        chatWebsocketJoin(chatUuid);

        const subscription = websocketSubscribe<ChatMessagePayload>(
            WEBSOCKET_EVENTS.CHAT.MESSAGE_RECEIVED,
            (payload) => {
                if (payload.chat_uuid === chatUuid) {
                    onMessage(payload);
                }
            }
        );

        return () => {
            chatWebsocketLeave(chatUuid);
            subscription.unsubscribe();
        };
    }, [chatUuid, is_connected, onMessage]);
};

export const useChatTyping = (
    chatUuid: string | null,
    onTyping: (payload: ChatTypingPayload) => void
) => {
    useEffect(() => {
        if (!chatUuid) return;

        const typingSubscription = websocketSubscribe<ChatTypingPayload>(
            WEBSOCKET_EVENTS.CHAT.TYPING_RECEIVED,
            (payload) => {
                if (payload.chat_uuid === chatUuid) {
                    onTyping(payload);
                }
            }
        );

        const stopTypingSubscription = websocketSubscribe<ChatTypingPayload>(
            WEBSOCKET_EVENTS.CHAT.STOP_TYPING_RECEIVED,
            (payload) => {
                if (payload.chat_uuid === chatUuid) {
                    onTyping({ ...payload, is_typing: false });
                }
            }
        );

        return () => {
            typingSubscription.unsubscribe();
            stopTypingSubscription.unsubscribe();
        };
    }, [chatUuid, onTyping]);
};
