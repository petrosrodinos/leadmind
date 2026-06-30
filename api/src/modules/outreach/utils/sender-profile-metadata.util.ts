export function parseSenderProfileMetadata(metadata: unknown): string | null {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return null;
    }
    const record = metadata as Record<string, unknown>;
    const uuid = record.sender_profile_uuid;
    if (typeof uuid !== 'string' || !uuid.trim()) {
        return null;
    }
    return uuid.trim();
}

export function buildSenderProfileMetadata(sender_profile_uuid: string): Record<string, string> {
    return { sender_profile_uuid: sender_profile_uuid.trim() };
}

export function mergeSenderProfileMetadata(
    existing: unknown,
    sender_profile_uuid: string,
): Record<string, unknown> {
    const base =
        existing && typeof existing === 'object' && !Array.isArray(existing)
            ? { ...(existing as Record<string, unknown>) }
            : {};
    return {
        ...base,
        ...buildSenderProfileMetadata(sender_profile_uuid),
    };
}
