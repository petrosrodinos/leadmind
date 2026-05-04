import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const contextType = ctx.getType();

        if (contextType === 'graphql' as any) {
            const gqlCtx = GqlExecutionContext.create(ctx);
            const { user } = gqlCtx.getContext();
            return data ? user?.[data] : user;
        }

        const request = ctx.switchToHttp().getRequest();
        const user = request.user;
        return data ? user?.[data] : user;
    },
);