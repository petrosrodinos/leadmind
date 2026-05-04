import { websocketEmit } from '../../../services/websocket.service';
import { WEBSOCKET_EVENTS } from '../../../interfaces/websocket-events.constants';
import { WEBSOCKET_ROOMS } from '../../../interfaces/websocket-rooms.constants';

export const chatWebsocketJoin = (chatUuid: string): void => {
    const room = WEBSOCKET_ROOMS.CHAT(chatUuid);
    websocketEmit(WEBSOCKET_EVENTS.CHAT.JOIN, { chat_uuid: chatUuid });
    console.log('[WebSocket:Chat] Joining chat room:', room);
};

export const chatWebsocketLeave = (chatUuid: string): void => {
    websocketEmit(WEBSOCKET_EVENTS.CHAT.LEAVE, { chat_uuid: chatUuid });
    console.log('[WebSocket:Chat] Leaving chat room:', chatUuid);
};

export const chatWebsocketSendTyping = (chatUuid: string): void => {
    websocketEmit(WEBSOCKET_EVENTS.CHAT.TYPING, { chat_uuid: chatUuid });
};

export const chatWebsocketSendStopTyping = (chatUuid: string): void => {
    websocketEmit(WEBSOCKET_EVENTS.CHAT.STOP_TYPING, { chat_uuid: chatUuid });
};

export const chatWebsocketSendMessage = (chatUuid: string, content: string): void => {
    websocketEmit(WEBSOCKET_EVENTS.CHAT.MESSAGE_SENT, { chat_uuid: chatUuid, content });
};
