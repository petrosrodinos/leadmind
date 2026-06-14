import { Prisma } from '@/generated/prisma';

export function mergeContactWhereClauses(
    base: Prisma.ContactWhereInput,
    andClauses: Prisma.ContactWhereInput[],
): Prisma.ContactWhereInput {
    if (andClauses.length === 0) return base;

    const baseAnd = base.AND
        ? Array.isArray(base.AND)
            ? base.AND
            : [base.AND]
        : [];
    const { AND: _and, ...rest } = base;
    return { ...rest, AND: [...baseAnd, ...andClauses] };
}
