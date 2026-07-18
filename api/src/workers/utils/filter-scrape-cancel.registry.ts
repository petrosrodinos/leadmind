const controllers = new Map<string, AbortController>();
const stopRequested = new Set<string>();

export function beginFilterScrapeCancel(filter_uuid: string): AbortSignal {
    const existing = controllers.get(filter_uuid);
    if (existing && !existing.signal.aborted) {
        existing.abort();
    }
    const controller = new AbortController();
    controllers.set(filter_uuid, controller);
    if (stopRequested.has(filter_uuid)) {
        stopRequested.delete(filter_uuid);
        controller.abort();
    }
    return controller.signal;
}

export function abortFilterScrape(filter_uuid: string): boolean {
    stopRequested.add(filter_uuid);
    const controller = controllers.get(filter_uuid);
    if (!controller) {
        return false;
    }
    if (!controller.signal.aborted) {
        controller.abort();
    }
    return true;
}

export function clearFilterScrapeStopRequest(filter_uuid: string): void {
    stopRequested.delete(filter_uuid);
}

export function endFilterScrapeCancel(filter_uuid: string, signal?: AbortSignal): void {
    const controller = controllers.get(filter_uuid);
    if (!controller) {
        stopRequested.delete(filter_uuid);
        return;
    }
    if (signal && controller.signal !== signal) {
        return;
    }
    controllers.delete(filter_uuid);
    stopRequested.delete(filter_uuid);
}
