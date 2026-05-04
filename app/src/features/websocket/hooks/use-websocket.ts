import { useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useWebsocketStore } from '@/stores/websocket.store';
import {
    websocketConnect,
    websocketDisconnect,
    websocketSubscribe,
    websocketUnsubscribe,
    websocketEmit,
    websocketEmitWithAck,
    websocketJoinRoom,
    websocketLeaveRoom,
    onWebsocketConnectionStateChange,
} from '../services/websocket.service';
import type {
    WebsocketConnectOptions,
    WebsocketEventCallback,
    WebsocketSubscription,
} from '../interfaces/websocket-client.interface';

export const useWebsocket = (options?: WebsocketConnectOptions) => {
    const { access_token, isLoggedIn } = useAuthStore();
    const { updateConnectionState, ...connectionState } = useWebsocketStore();
    const hasConnectedRef = useRef(false);

    useEffect(() => {
        if (!isLoggedIn || !access_token) {
            if (hasConnectedRef.current) {
                websocketDisconnect();
                hasConnectedRef.current = false;
            }
            return;
        }

        if (!hasConnectedRef.current) {
            websocketConnect(options);
            hasConnectedRef.current = true;
        }

        const unsubscribe = onWebsocketConnectionStateChange((state) => {
            updateConnectionState(state);
        });

        return () => {
            unsubscribe();
        };
    }, [isLoggedIn, access_token, options, updateConnectionState]);

    const connect = useCallback((connectOptions?: WebsocketConnectOptions) => {
        websocketConnect(connectOptions);
    }, []);

    const disconnect = useCallback(() => {
        websocketDisconnect();
        hasConnectedRef.current = false;
    }, []);

    const subscribe = useCallback(<T = unknown>(
        event: string,
        callback: WebsocketEventCallback<T>
    ): WebsocketSubscription => {
        return websocketSubscribe(event, callback);
    }, []);

    const unsubscribe = useCallback((event: string, callback?: WebsocketEventCallback) => {
        websocketUnsubscribe(event, callback);
    }, []);

    const emit = useCallback(<T = unknown>(event: string, data?: T) => {
        websocketEmit(event, data);
    }, []);

    const emitWithAck = useCallback(<T = unknown, R = unknown>(
        event: string,
        data?: T,
        timeout?: number
    ): Promise<R> => {
        return websocketEmitWithAck<T, R>(event, data, timeout);
    }, []);

    const joinRoom = useCallback((room: string) => {
        websocketJoinRoom(room);
    }, []);

    const leaveRoom = useCallback((room: string) => {
        websocketLeaveRoom(room);
    }, []);

    return {
        ...connectionState,
        connect,
        disconnect,
        subscribe,
        unsubscribe,
        emit,
        emitWithAck,
        joinRoom,
        leaveRoom,
        isConnected: connectionState.is_connected,
    };
};

export const useWebsocketEvent = <T = unknown>(
    event: string,
    callback: WebsocketEventCallback<T>,
    deps: React.DependencyList = []
) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const subscription = websocketSubscribe<T>(event, (data) => {
            callbackRef.current(data);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [event, ...deps]);
};
