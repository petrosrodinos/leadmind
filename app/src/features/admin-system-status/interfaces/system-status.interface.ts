export const SystemServiceStatuses = {
    UP: "up",
    DOWN: "down",
    NOT_CONFIGURED: "not_configured",
} as const;

export type SystemServiceStatus = (typeof SystemServiceStatuses)[keyof typeof SystemServiceStatuses];

export interface SystemServiceHealth {
    status: SystemServiceStatus;
    latency_ms: number | null;
    message?: string;
}

export interface ApiSystemHealth extends SystemServiceHealth {
    uptime_seconds: number;
}

export interface SystemStatusResponse {
    api: ApiSystemHealth;
    database: SystemServiceHealth;
    redis: SystemServiceHealth;
}
