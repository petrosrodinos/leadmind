import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

export function bullBoardAuthMiddleware(configService: ConfigService) {
    return (req: Request, res: Response, next: NextFunction) => {
        const adminUser = configService.get('BULL_BOARD_USER');
        const adminPass = configService.get('BULL_BOARD_PASSWORD');

        if (!adminUser || !adminPass) {
            return res.status(500).send('Bull Board credentials not configured');
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board Admin"');
            return res.status(401).send('Authentication required');
        }

        const credentials = Buffer.from(authHeader.slice(6), 'base64').toString();
        const [user, password] = credentials.split(':');

        if (user === adminUser && password === adminPass) {
            return next();
        }

        res.setHeader('WWW-Authenticate', 'Basic realm="Bull Board Admin"');
        return res.status(401).send('Invalid credentials');
    };
}

