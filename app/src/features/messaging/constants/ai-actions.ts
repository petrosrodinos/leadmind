import type { LucideIcon } from "lucide-react";
import { Edit3, Minimize2, Sparkles, Briefcase, Heart, Zap, UserCheck } from "lucide-react";

export const AI_ACTIONS = {
    generate: "generate",
    improve: "improve",
    shorten: "shorten",
    tone_professional: "tone_professional",
    tone_friendly: "tone_friendly",
    tone_direct: "tone_direct",
    personalize: "personalize",
} as const;

export type AiAction = (typeof AI_ACTIONS)[keyof typeof AI_ACTIONS];

export interface AiActionMeta {
    key: AiAction;
    label: string;
    description: string;
    icon: LucideIcon;
    requiresExisting: boolean;
}

export const AI_ACTION_META: Record<AiAction, AiActionMeta> = {
    generate: {
        key: "generate",
        label: "Generate",
        description: "Fresh draft from your prompt",
        icon: Sparkles,
        requiresExisting: false,
    },
    improve: {
        key: "improve",
        label: "Improve",
        description: "Tighten and sharpen the existing draft",
        icon: Edit3,
        requiresExisting: true,
    },
    shorten: {
        key: "shorten",
        label: "Shorten",
        description: "Trim length while keeping the CTA",
        icon: Minimize2,
        requiresExisting: true,
    },
    tone_professional: {
        key: "tone_professional",
        label: "More professional",
        description: "Tone: polished and formal",
        icon: Briefcase,
        requiresExisting: true,
    },
    tone_friendly: {
        key: "tone_friendly",
        label: "More friendly",
        description: "Tone: warm and conversational",
        icon: Heart,
        requiresExisting: true,
    },
    tone_direct: {
        key: "tone_direct",
        label: "More direct",
        description: "Tone: concise and to the point",
        icon: Zap,
        requiresExisting: true,
    },
    personalize: {
        key: "personalize",
        label: "Personalize",
        description: "Ensure contact placeholders read naturally",
        icon: UserCheck,
        requiresExisting: true,
    },
};

export const DEFAULT_SINGLE_CONTACT_ACTIONS: AiAction[] = ["generate"];

export const DEFAULT_CAMPAIGN_ACTIONS: AiAction[] = [
    "generate",
    "improve",
    "shorten",
    "tone_professional",
    "tone_friendly",
    "tone_direct",
    "personalize",
];
