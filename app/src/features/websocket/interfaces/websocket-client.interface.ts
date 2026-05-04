export interface WebsocketConnectionState {
    is_connected: boolean;
    socket_id: string | null;
    account_uuid: string | null;
    reconnect_attempts: number;
    last_connected_at: Date | null;
    last_disconnected_at: Date | null;
}

export interface WebsocketConnectOptions {
    auto_reconnect?: boolean;
    reconnect_delay?: number;
    max_reconnect_attempts?: number;
}

export interface WebsocketEmitOptions {
    timeout?: number;
    retry_on_fail?: boolean;
}

export interface WebsocketEventCallback<T = unknown> {
    (data: T): void;
}

export interface WebsocketSubscription {
    event: string;
    callback: WebsocketEventCallback;
    unsubscribe: () => void;
}
