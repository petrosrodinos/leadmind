import { UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { GqlExecutionContext } from '@nestjs/graphql';

export class JwtGuard extends AuthGuard('jwt') {
    constructor() {
        super();
    }

    getRequest(context: any) {
        const ctx = GqlExecutionContext.create(context);
        return ctx.getContext().req;
    }

    handleRequest(err: any, user: any, info: any, context: any, status: any) {
        if (info instanceof JsonWebTokenError) {
            throw new UnauthorizedException({
                message: 'Invalid token',
                code: 'invalid_token',
            });
        }

        if (err || !user) {
            throw new UnauthorizedException({
                message: 'Authentication required',
                code: 'authentication_required',
            });
        }

        const ctx = GqlExecutionContext.create(context);
        const gqlContext = ctx.getContext();
        gqlContext.user = user;

        return super.handleRequest(err, user, info, context, status);
    }
}