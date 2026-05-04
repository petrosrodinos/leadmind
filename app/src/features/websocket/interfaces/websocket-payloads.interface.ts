export interface BaseWebsocketPayload {
    timestamp: string;
    event_id: string;
}

export interface SystemPayload extends BaseWebsocketPayload {
    message: string;
    severity: 'info' | 'warning' | 'critical';
    action_required?: boolean;
}

export interface ChatMessagePayload extends BaseWebsocketPayload {
    chat_uuid: string;
    message: string;
    sender_uuid: string;
}

export interface ChatTypingPayload extends BaseWebsocketPayload {
    chat_uuid: string;
    user_uuid: string;
    is_typing?: boolean;
}

export type WebsocketPayload =
    | SystemPayload
    | ChatMessagePayload
    | ChatTypingPayload;
