import type { SenderProfile } from "@/features/sender-profiles/interfaces/sender-profile.interface";
import { defaultSenderProfile } from "@/lib/placeholder-render";

export function resolveDefaultSenderProfileUuid(
    profiles: SenderProfile[] | undefined,
): string | null {
    return defaultSenderProfile(profiles)?.uuid ?? null;
}

export function formatSenderProfileLabel(profile: SenderProfile): string {
    const name =
        profile.name?.trim() ||
        [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() ||
        "Unnamed profile";
    if (profile.company_name?.trim()) {
        return `${name} · ${profile.company_name.trim()}`;
    }
    return name;
}
