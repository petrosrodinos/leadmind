import { Scalar } from '@nestjs/graphql';
import { GraphQLScalarType, Kind } from 'graphql';

@Scalar('JSON')
export class JSONScalar {
    description = 'JSON custom scalar type';

    parseValue(value: any) {
        return value;
    }

    serialize(value: any) {
        return value;
    }

    parseLiteral(ast: any) {
        switch (ast.kind) {
            case Kind.STRING:
                return ast.value;
            case Kind.INT:
                return parseInt(ast.value, 10);
            case Kind.FLOAT:
                return parseFloat(ast.value);
            case Kind.BOOLEAN:
                return ast.value;
            case Kind.NULL:
                return null;
            default:
                return null;
        }
    }
} 