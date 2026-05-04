import { Module } from '@nestjs/common';
import { GraphQLModule as NestGraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { JSONScalar } from 'src/shared/models/graphql/json.scalar';

@Module({
    imports: [
        NestGraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            playground: process.env.NODE_ENV !== 'production',
            debug: process.env.NODE_ENV !== 'production',
            context: ({ req, res }) => {
                return {
                    req,
                    res,
                    user: req?.user,
                };
            },
            formatError: (error) => ({
                message: error.message,
                code: error.extensions?.code,
                path: error.path,
            }),
        })
    ],
    providers: [JSONScalar],
    exports: [NestGraphQLModule],
})
export class GraphQLModule { }