import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JsonWebTokenError } from 'jsonwebtoken';
import { GqlExecutionContext } from '@nestjs/graphql';

export class JwtGuard extends AuthGuard('jwt') {
    constructor() {
        super();
    }

    getRequest(context: ExecutionContext) {
        if (context.getType<'graphql' | 'http'>() === 'graphql') {
            const ctx = GqlExecutionContext.create(context);
            return ctx.getContext().req;
        }
        return context.switchToHttp().getRequest();
    }

    handleRequest(err: any, user: any, info: any, context: ExecutionContext, status: any) {
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

        if (context.getType<'graphql' | 'http'>() === 'graphql') {
            const ctx = GqlExecutionContext.create(context);
            ctx.getContext().user = user;
        }

        return super.handleRequest(err, user, info, context, status);
    }
}