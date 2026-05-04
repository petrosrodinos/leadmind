export const WEBSOCKET_EVENTS = {
    CONNECTION: {
        CONNECT: 'connection',
        DISCONNECT: 'disconnect',
        ERROR: 'error',
    },
    CHAT: {
        JOIN: 'join_chat',
        JOINED: 'chat_joined',
        LEAVE: 'leave_chat',
        LEFT: 'chat_left',
        MESSAGE_RECEIVED: 'chat:message_received',
        MESSAGE_SENT: 'chat:message_sent',
        TYPING: 'typing',
        TYPING_RECEIVED: 'chat:typing',
        STOP_TYPING: 'stop_typing',
        STOP_TYPING_RECEIVED: 'chat:stop_typing',
        READ: 'chat:read',
    },
} as const;

export type WebsocketEventCategory = keyof typeof WEBSOCKET_EVENTS;
export type WebsocketEventType<T extends WebsocketEventCategory> = typeof WEBSOCKET_EVENTS[T][keyof typeof WEBSOCKET_EVENTS[T]];
