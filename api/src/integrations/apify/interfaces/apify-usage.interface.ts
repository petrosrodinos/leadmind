import { ApifyUsageOperation, Prisma } from '@/generated/prisma';

export interface ApifyUsageContext {
    user_uuid: string;
    operation: ApifyUsageOperation;
    reference_type?: string | null;
    reference_uuid?: string | null;
    metadata?: Prisma.InputJsonValue;
}

export type ApifyUsageOptions = Omit<ApifyUsageContext, 'user_uuid'>;
