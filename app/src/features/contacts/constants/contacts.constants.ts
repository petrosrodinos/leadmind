import { LeadStatus } from "../interfaces/contact.interface";

export type ContactStatusChipColor = "default" | "success" | "warning" | "danger";

export type ContactStatusOption = {
    id: LeadStatus;
    label: string;
    pipeline?: boolean;
    pipelineTone?: string;
    chipColor: ContactStatusChipColor;
    barColor: string;
};

export const CONTACT_STATUS_OPTIONS: readonly ContactStatusOption[] = [
    {
        id: LeadStatus.NEW,
        label: "New",
        pipeline: true,
        pipelineTone: "bg-surface-secondary",
        chipColor: "default",
        barColor: "bg-accent",
    },
    {
        id: LeadStatus.CONTACTED,
        label: "Contacted",
        pipeline: true,
        pipelineTone: "bg-warning-soft/30",
        chipColor: "warning",
        barColor: "bg-warning",
    },
    {
        id: LeadStatus.QUALIFIED,
        label: "Qualified",
        pipeline: true,
        pipelineTone: "bg-accent/10",
        chipColor: "default",
        barColor: "bg-accent/80",
    },
    {
        id: LeadStatus.NURTURING,
        label: "Nurturing",
        pipeline: true,
        pipelineTone: "bg-warning-soft/20",
        chipColor: "warning",
        barColor: "bg-warning/70",
    },
    {
        id: LeadStatus.CONVERTED,
        label: "Converted",
        pipeline: true,
        pipelineTone: "bg-success-soft/30",
        chipColor: "success",
        barColor: "bg-success",
    },
    {
        id: LeadStatus.LOST,
        label: "Lost",
        chipColor: "danger",
        barColor: "bg-danger/80",
    },
    {
        id: LeadStatus.ARCHIVED,
        label: "Archived",
        chipColor: "danger",
        barColor: "bg-muted",
    },
] as const;

export const STATUS_OPTIONS = CONTACT_STATUS_OPTIONS.map(({ id, label }) => ({ id, label }));

export const LEAD_STATUS_VALUES = CONTACT_STATUS_OPTIONS.map((o) => o.id);

export const PIPELINE_STATUS_OPTIONS = CONTACT_STATUS_OPTIONS.filter(
    (o): o is ContactStatusOption & { pipeline: true } => o.pipeline === true,
);

export const STATUS_LABEL = Object.fromEntries(
    CONTACT_STATUS_OPTIONS.map((o) => [o.id, o.label]),
) as Record<LeadStatus, string>;

export const STATUS_CHIP_COLOR = Object.fromEntries(
    CONTACT_STATUS_OPTIONS.map((o) => [o.id, o.chipColor]),
) as Record<LeadStatus, ContactStatusChipColor>;

export const STATUS_BAR_COLOR = Object.fromEntries(
    CONTACT_STATUS_OPTIONS.map((o) => [o.id, o.barColor]),
) as Record<LeadStatus, string>;

export function isLeadStatus(value: string | null | undefined): value is LeadStatus {
    return !!value && LEAD_STATUS_VALUES.includes(value as LeadStatus);
}

export function emptyByStatus(): Record<LeadStatus, number> {
    return Object.fromEntries(LEAD_STATUS_VALUES.map((s) => [s, 0])) as Record<LeadStatus, number>;
}

export const EMPTY_BY_STATUS = emptyByStatus();

export function emptyContactsByStatus<T>(): Record<LeadStatus, T[]> {
    return LEAD_STATUS_VALUES.reduce(
        (acc, status) => {
            acc[status] = [];
            return acc;
        },
        {} as Record<LeadStatus, T[]>,
    );
}
