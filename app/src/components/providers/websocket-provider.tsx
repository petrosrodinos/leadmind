import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import {
    websocketConnect,
    websocketDisconnect,
    onWebsocketConnectionStateChange,
} from '@/features/websocket/services/websocket.service';
import { useWebsocketStore } from '@/stores/websocket.store';

interface WebsocketProviderProps {
    children: React.ReactNode;
}

export const WebsocketProvider = ({ children }: WebsocketProviderProps) => {
    const { isLoggedIn, access_token } = useAuthStore();
    const { updateConnectionState } = useWebsocketStore();

    useEffect(() => {
        if (!isLoggedIn || !access_token) {
            websocketDisconnect();
            return;
        }

        websocketConnect();

        const unsubscribe = onWebsocketConnectionStateChange((state) => {
            updateConnectionState(state);
        });

        return () => {
            unsubscribe();
            websocketDisconnect();
        };
    }, [isLoggedIn, access_token, updateConnectionState]);

    return <>{children}</>;
};
