import { Transform, Type } from 'class-transformer';

export function parseQueryBoolean(value: unknown): boolean | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') return true;
        if (normalized === 'false' || normalized === '0') return false;
    }
    return undefined;
}

export function QueryBooleanTransform(
    target: object,
    propertyKey: string | symbol,
): void {
    Type(() => String)(target, propertyKey);
    Transform(({ value }) => parseQueryBoolean(value), { toClassOnly: true })(
        target,
        propertyKey,
    );
}
