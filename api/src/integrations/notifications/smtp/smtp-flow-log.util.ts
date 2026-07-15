import { Logger } from '@nestjs/common';

export function formatSmtpLog(fields: Record<string, unknown>): string {
    const parts = Object.entries(fields)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => {
            const text = typeof value === 'string' ? value : JSON.stringify(value);
            if (text.includes(' ') || text.includes('=')) {
                return `${key}=${JSON.stringify(text)}`;
            }
            return `${key}=${text}`;
        });
    return `[SMTP] ${parts.join(' ')}`;
}

export function logSmtp(
    logger: Logger,
    level: 'log' | 'warn' | 'error' | 'debug',
    fields: Record<string, unknown>,
): void {
    logger[level](formatSmtpLog(fields));
}

export class SmtpFlowTimer {
    private readonly startedAt = Date.now();
    private readonly marks = new Map<string, number>();

    mark(label: string): void {
        this.marks.set(label, Date.now());
    }

    sinceStart(): number {
        return Date.now() - this.startedAt;
    }

    sinceMark(label: string): number | null {
        const mark = this.marks.get(label);
        if (!mark) {
            return null;
        }
        return Date.now() - mark;
    }
}

export function createNodemailerLogger(logger: Logger) {
    const write = (level: 'debug' | 'log' | 'warn' | 'error', detail: string) => {
        logSmtp(logger, level === 'log' ? 'log' : level, {
            step: 'transport',
            detail,
        });
    };

    return {
        debug: (detail: unknown) => write('debug', stringifyTransportLog(detail)),
        info: (detail: unknown) => write('log', stringifyTransportLog(detail)),
        warn: (detail: unknown) => write('warn', stringifyTransportLog(detail)),
        error: (detail: unknown) => write('error', stringifyTransportLog(detail)),
    };
}

function stringifyTransportLog(detail: unknown): string {
    if (typeof detail === 'string') {
        return detail;
    }
    if (detail && typeof detail === 'object') {
        const record = detail as Record<string, unknown>;
        if (typeof record.msg === 'string') {
            return record.msg;
        }
        return JSON.stringify(record);
    }
    return String(detail);
}
