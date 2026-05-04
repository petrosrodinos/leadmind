import { io, Socket } from 'socket.io-client';
import { environments } from '@/config/environments';
import { getAuthStoreState } from '@/stores/auth';
import type {
    WebsocketConnectionState,
    WebsocketConnectOptions,
    WebsocketEventCallback,
    WebsocketSubscription,
} from '../interfaces/websocket-client.interface';
import { WEBSOCKET_EVENTS } from '../interfaces/websocket-events.constants';

const DEFAULT_OPTIONS: WebsocketConnectOptions = {
    auto_reconnect: true,
    reconnect_delay: 3000,
    max_reconnect_attempts: 10,
};

let socket: Socket | null = null;
let options: WebsocketConnectOptions = DEFAULT_OPTIONS;
const subscriptions: Map<string, Set<WebsocketEventCallback>> = new Map();
const connectionListeners: Set<(state: WebsocketConnectionState) => void> = new Set();
let currentAuthToken: string | null = null;

let state: WebsocketConnectionState = {
    is_connected: false,
    socket_id: null,
    account_uuid: null,
    reconnect_attempts: 0,
    last_connected_at: null,
    last_disconnected_at: null,
};

const updateState = (partialState: Partial<WebsocketConnectionState>): void => {
    state = { ...state, ...partialState };
    connectionListeners.forEach((listener) => listener(state));
};

const setupEventListeners = (): void => {
    if (!socket) return;

    socket.on('connect', () => {
        updateState({
            is_connected: true,
            socket_id: socket?.id || null,
            reconnect_attempts: 0,
            last_connected_at: new Date(),
        });
    });

    socket.on('connected', (data: { socket_id: string; account_uuid: string }) => {
        updateState({
            socket_id: data.socket_id,
            account_uuid: data.account_uuid,
        });
    });

    socket.on('disconnect', (reason: string) => {
        updateState({
            is_connected: false,
            last_disconnected_at: new Date(),
        });
        console.warn('[WebSocket] Disconnected:', reason);
    });

    socket.on('connect_error', (error: Error) => {
        console.error('[WebSocket] Connection error:', error.message);
        updateState({
            reconnect_attempts: state.reconnect_attempts + 1,
        });
    });

    socket.on(WEBSOCKET_EVENTS.CONNECTION.ERROR, (data: { message: string }) => {
        console.error('[WebSocket] Server error:', data.message);
    });

    socket.onAny((event: string, data: unknown) => {
        const callbacks = subscriptions.get(event);
        if (callbacks) {
            callbacks.forEach((callback) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[WebSocket] Error in callback for event "${event}":`, error);
                }
            });
        }
    });
};

export const websocketConnect = (connectOptions?: WebsocketConnectOptions): void => {
    options = { ...DEFAULT_OPTIONS, ...connectOptions };

    const authState = getAuthStoreState();
    if (!authState.access_token) {
        console.warn('[WebSocket] Cannot connect: No authentication token');
        return;
    }

    if (socket) {
        if (currentAuthToken !== authState.access_token) {
            currentAuthToken = authState.access_token;
            socket.auth = { token: authState.access_token };
        }

        if (!socket.connected) {
            socket.connect();
        }

        return;
    }


    currentAuthToken = authState.access_token;
    socket = io(environments.API_URL, {
        auth: {
            token: authState.access_token,
        },
        transports: ['websocket', 'polling'],
        reconnection: options.auto_reconnect,
        reconnectionDelay: options.reconnect_delay,
        reconnectionAttempts: options.max_reconnect_attempts,
        timeout: 20000,
    });

    setupEventListeners();
};

export const websocketDisconnect = (): void => {
    if (socket) {
        socket.removeAllListeners();
        socket.disconnect();
        socket = null;
        currentAuthToken = null;
        updateState({
            is_connected: false,
            socket_id: null,
            last_disconnected_at: new Date(),
        });
    }
};

export const getWebsocketState = (): WebsocketConnectionState => {
    return { ...state };
};

export const isWebsocketConnected = (): boolean => {
    return socket?.connected ?? false;
};

export const getWebsocketSocketId = (): string | null => {
    return socket?.id ?? null;
};

export const onWebsocketConnectionStateChange = (
    listener: (state: WebsocketConnectionState) => void
): (() => void) => {
    connectionListeners.add(listener);
    return () => {
        connectionListeners.delete(listener);
    };
};

export const websocketSubscribe = <T = unknown>(
    event: string,
    callback: WebsocketEventCallback<T>
): WebsocketSubscription => {
    if (!subscriptions.has(event)) {
        subscriptions.set(event, new Set());
    }

    const callbacks = subscriptions.get(event)!;
    callbacks.add(callback as WebsocketEventCallback);

    return {
        event,
        callback: callback as WebsocketEventCallback,
        unsubscribe: () => {
            callbacks.delete(callback as WebsocketEventCallback);
            if (callbacks.size === 0) {
                subscriptions.delete(event);
            }
        },
    };
};

export const websocketUnsubscribe = (event: string, callback?: WebsocketEventCallback): void => {
    if (!callback) {
        subscriptions.delete(event);
        return;
    }

    const callbacks = subscriptions.get(event);
    if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
            subscriptions.delete(event);
        }
    }
};

export const websocketEmit = <T = unknown>(event: string, data?: T): void => {
    if (!socket?.connected) {
        console.warn('[WebSocket] Cannot emit: Not connected');
        return;
    }
    socket.emit(event, data);
};

export const websocketEmitWithAck = <T = unknown, R = unknown>(
    event: string,
    data?: T,
    timeout = 5000
): Promise<R> => {
    return new Promise((resolve, reject) => {
        if (!socket?.connected) {
            reject(new Error('WebSocket not connected'));
            return;
        }

        const timeoutId = setTimeout(() => {
            reject(new Error('WebSocket emit timeout'));
        }, timeout);

        socket.emit(event, data, (response: R) => {
            clearTimeout(timeoutId);
            resolve(response);
        });
    });
};

export const websocketJoinRoom = (room: string): void => {
    websocketEmit('join_room', { room });
};

export const websocketLeaveRoom = (room: string): void => {
    websocketEmit('leave_room', { room });
};

export const websocketPing = (): void => {
    websocketEmit('ping');
};
