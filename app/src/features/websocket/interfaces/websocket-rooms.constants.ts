export const WEBSOCKET_ROOMS = {
    ACCOUNT: (accountUuid: string) => `account:${accountUuid}`,
    CHAT: (chatUuid: string) => `chat:${chatUuid}`,
    ADMIN: 'admin',
    GLOBAL: 'global',
} as const;

export type WebsocketRoomType =
    | ReturnType<typeof WEBSOCKET_ROOMS.ACCOUNT>
    | ReturnType<typeof WEBSOCKET_ROOMS.CHAT>
    | typeof WEBSOCKET_ROOMS.ADMIN
    | typeof WEBSOCKET_ROOMS.GLOBAL;
