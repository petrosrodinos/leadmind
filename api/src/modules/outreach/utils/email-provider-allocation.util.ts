import { BadRequestException } from '@nestjs/common';
import { ExternalIntegrationProvider } from '@/generated/prisma';
import {
    EmailProviderAllocation,
    EmailProviderTarget,
} from '@/modules/integrations/interfaces/email-credentials.interface';
import { EmailProviderAllocationDto } from '../dto/email-provider.dto';

export function parseEmailProviderMetadata(
    metadata: unknown,
): EmailProviderTarget | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return null;
    }
    const record = metadata as Record<string, unknown>;
    const provider = record.email_provider;
    const account = record.email_account;
    if (
        (provider !== ExternalIntegrationProvider.RESEND &&
            provider !== ExternalIntegrationProvider.SMTP) ||
        typeof account !== 'string' ||
        !account.trim()
    ) {
        return null;
    }
    return { provider, account: account.trim() };
}

export function buildEmailProviderMetadata(
    target: EmailProviderTarget,
): Record<string, string> {
    return {
        email_provider: target.provider,
        email_account: target.account,
    };
}

export function mergeEmailProviderMetadata(
    existing: unknown,
    target: EmailProviderTarget,
): Record<string, unknown> {
    const base =
        existing && typeof existing === 'object' && !Array.isArray(existing)
            ? { ...(existing as Record<string, unknown>) }
            : {};
    return {
        ...base,
        ...buildEmailProviderMetadata(target),
    };
}

export function assignEmailProviders(
    contactUuids: string[],
    allocations: EmailProviderAllocation[],
): Map<string, EmailProviderTarget> {
    const sorted = [...contactUuids].sort();
    const assignments = new Map<string, EmailProviderTarget>();
    let index = 0;

    for (const allocation of allocations) {
        for (let count = 0; count < allocation.count; count++) {
            if (index >= sorted.length) break;
            assignments.set(sorted[index], {
                provider: allocation.provider,
                account: allocation.account,
            });
            index++;
        }
    }

    return assignments;
}

export function validateEmailProviderAllocations(
    allocations: EmailProviderAllocationDto[] | undefined,
    totalCount: number,
): EmailProviderAllocation[] | undefined {
    if (allocations === undefined) {
        return undefined;
    }

    if (allocations.length === 0) {
        throw new BadRequestException('At least one email provider allocation is required');
    }

    const sum = allocations.reduce((acc, row) => acc + row.count, 0);
    if (sum !== totalCount) {
        throw new BadRequestException(
            `Email provider allocations must sum to ${totalCount} (got ${sum})`,
        );
    }

    return allocations.map((row) => ({
        provider: row.provider,
        account: row.account.trim(),
        count: row.count,
    }));
}

export function parseStoredEmailProviderAllocations(
    value: unknown,
): EmailProviderAllocation[] | null {
    if (!Array.isArray(value)) {
        return null;
    }
    const parsed: EmailProviderAllocation[] = [];
    for (const row of value) {
        if (!row || typeof row !== 'object' || Array.isArray(row)) continue;
        const record = row as Record<string, unknown>;
        const provider = record.provider;
        const account = record.account;
        const count = record.count;
        if (
            (provider !== ExternalIntegrationProvider.RESEND &&
                provider !== ExternalIntegrationProvider.SMTP) ||
            typeof account !== 'string' ||
            typeof count !== 'number' ||
            count < 0
        ) {
            continue;
        }
        parsed.push({
            provider,
            account: account.trim(),
            count,
        });
    }
    return parsed.length > 0 ? parsed : null;
}

export function buildEqualAllocations(
    accounts: EmailProviderTarget[],
    totalCount: number,
): EmailProviderAllocation[] {
    if (accounts.length === 0 || totalCount <= 0) {
        return [];
    }
    const base = Math.floor(totalCount / accounts.length);
    let remainder = totalCount % accounts.length;
    return accounts.map((account) => {
        const extra = remainder > 0 ? 1 : 0;
        if (remainder > 0) remainder--;
        return {
            ...account,
            count: base + extra,
        };
    });
}
