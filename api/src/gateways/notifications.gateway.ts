import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
            const allowed =
                process.env.NODE_ENV !== 'local'
                    ? [process.env.APP_URL, process.env.LANDING_URL]
                    : ['http://localhost:5173', 'http://localhost:3001'];
            callback(null, !origin || allowed.includes(origin));
        },
        credentials: true,
    },
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private readonly userSockets = new Map<string, Set<string>>();
    private readonly jwtSecret: string;

    constructor(
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
    ) {
        this.jwtSecret = this.config.get<string>('JWT_SECRET')!;
    }

    afterInit() {
        this.logger.log('WebSocket gateway initialized');
    }

    async handleConnection(client: Socket) {
        try {
            const token =
                (client.handshake.auth?.token as string) ||
                (client.handshake.headers?.authorization as string)?.replace('Bearer ', '');

            if (!token) {
                client.emit('error', { message: 'No authentication token' });
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify<{ uuid: string }>(token, {
                secret: this.jwtSecret,
            });
            client.data.user_uuid = payload.uuid;

            if (!this.userSockets.has(payload.uuid)) {
                this.userSockets.set(payload.uuid, new Set());
            }
            this.userSockets.get(payload.uuid)!.add(client.id);

            client.emit('connected', { socket_id: client.id, account_uuid: payload.uuid });
            this.logger.log(`Client connected: ${client.id} (user: ${payload.uuid})`);
        } catch {
            client.emit('error', { message: 'Authentication failed' });
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const user_uuid = client.data?.user_uuid as string | undefined;
        if (user_uuid) {
            const sockets = this.userSockets.get(user_uuid);
            if (sockets) {
                sockets.delete(client.id);
                if (sockets.size === 0) {
                    this.userSockets.delete(user_uuid);
                }
            }
        }
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    emitToUser(user_uuid: string, event: string, data: unknown) {
        if (!this.server) return;
        const socketIds = this.userSockets.get(user_uuid);
        if (!socketIds) return;
        for (const socketId of socketIds) {
            this.server.to(socketId).emit(event, data);
        }
    }
}
