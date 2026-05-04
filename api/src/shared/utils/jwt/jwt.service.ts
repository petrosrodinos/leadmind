import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CreateJwtService {
    private secret: string;
    private expiration: string;

    constructor(
        private jwt: JwtService,
        private config: ConfigService,
    ) {
        this.secret = this.config.get('JWT_SECRET');
        this.expiration = this.config.get('JWT_EXPIRATION_TIME');
    }

    async signToken(payload: any): Promise<string> {


        const token = await this.jwt.signAsync(payload, {
            expiresIn: this.expiration,
            secret: this.secret,
        });

        return token;
    }

    async verifyToken(token: string): Promise<any> {
        try {
            return this.jwt.verifyAsync(token, { secret: this.secret });
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }

    getExpirationTime(token: string): number {
        const decoded = this.jwt.decode(token);
        return decoded.exp;

    }
}