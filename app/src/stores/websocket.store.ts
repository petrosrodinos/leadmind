import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { WebsocketConnectionState } from '@/features/websocket/interfaces/websocket-client.interface';

interface WebsocketStore extends WebsocketConnectionState {
    updateConnectionState: (state: Partial<WebsocketConnectionState>) => void;
    resetState: () => void;
}

const initialState: WebsocketConnectionState = {
    is_connected: false,
    socket_id: null,
    account_uuid: null,
    reconnect_attempts: 0,
    last_connected_at: null,
    last_disconnected_at: null,
};

export const useWebsocketStore = create<WebsocketStore>()(
    devtools(
        (set) => ({
            ...initialState,
            updateConnectionState: (state: Partial<WebsocketConnectionState>) => {
                set((prev) => ({ ...prev, ...state }));
            },
            resetState: () => {
                set(initialState);
            },
        }),
        { name: 'websocket-store' }
    )
);

export const getWebsocketStoreState = () => useWebsocketStore.getState();
