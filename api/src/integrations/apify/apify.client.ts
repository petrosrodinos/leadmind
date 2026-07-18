import { GatewayTimeoutException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApifyUsageStatus } from '@/generated/prisma';
import { ApifyUsageService } from '@/modules/apify-usage/apify-usage.service';
import {
    APIFY_API_BASE_URL,
    APIFY_MAX_RETRIES,
    APIFY_RETRY_DELAY_MS,
    APIFY_WAIT_FOR_FINISH_SECONDS,
} from './apify.constants';
import { ApifyRunInput } from './interfaces/apify.interfaces';
import { ApifyUsageContext } from './interfaces/apify-usage.interface';

@Injectable()
export class ApifyClient {
    private readonly logger = new Logger(ApifyClient.name);
    private readonly http: AxiosInstance;

    constructor(private readonly apifyUsageService: ApifyUsageService) {
        this.http = axios.create({
            baseURL: APIFY_API_BASE_URL,
            timeout: (APIFY_WAIT_FOR_FINISH_SECONDS + 30) * 1000,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async runActor<T = any>(
        token: string,
        actor_id: string,
        input: ApifyRunInput,
        usage?: ApifyUsageContext,
        signal?: AbortSignal,
    ): Promise<T[]> {
        if (signal) {
            return this.runActorCancellable<T>(token, actor_id, input, usage, signal);
        }

        const path = `/acts/${actor_id.replace('/', '~')}/run-sync-get-dataset-items`;
        const started_at = Date.now();

        let last_error: unknown;
        for (let attempt = 0; attempt <= APIFY_MAX_RETRIES; attempt++) {
            try {
                const { data } = await this.http.post<T[]>(path, input, {
                    params: { token, waitForFinish: APIFY_WAIT_FOR_FINISH_SECONDS },
                });
                const results = Array.isArray(data) ? data : [];
                this.logUsage({
                    usage,
                    actor_id,
                    status: ApifyUsageStatus.SUCCESS,
                    result_count: results.length,
                    duration_ms: Date.now() - started_at,
                });
                return results;
            } catch (error) {
                last_error = error;
                const axios_err = error as AxiosError<any>;
                const status = axios_err?.response?.status;

                if (status === 408) {
                    this.logger.warn(`Apify actor ${actor_id} timed out (HTTP 408)`);
                    this.logUsage({
                        usage,
                        actor_id,
                        status: ApifyUsageStatus.ERROR,
                        duration_ms: Date.now() - started_at,
                        error_message: `Apify actor ${actor_id} timed out`,
                        run_id: this.extractRunId(axios_err, null),
                    });
                    throw new GatewayTimeoutException(`Apify actor ${actor_id} timed out`);
                }

                const detail = await this.resolveApifyErrorDetail(token, axios_err);
                this.logger.warn(
                    `Apify actor ${actor_id} attempt ${attempt + 1} failed (HTTP ${status ?? '?'}): ${detail ?? axios_err.message}`,
                );

                if (attempt < APIFY_MAX_RETRIES) {
                    await this.sleep(APIFY_RETRY_DELAY_MS);
                }
            }
        }

        const axios_err =
            last_error && (last_error as AxiosError).isAxiosError
                ? (last_error as AxiosError<any>)
                : null;
        const detail = axios_err
            ? await this.resolveApifyErrorDetail(token, axios_err)
            : null;
        const fallback = last_error instanceof Error ? last_error.message : 'Unknown Apify error';
        const error_message = detail ?? fallback;
        this.logUsage({
            usage,
            actor_id,
            status: ApifyUsageStatus.ERROR,
            duration_ms: Date.now() - started_at,
            error_message,
            run_id: axios_err ? this.extractRunId(axios_err, detail) : null,
        });
        throw new InternalServerErrorException(`Apify actor ${actor_id} failed: ${error_message}`);
    }

    async runActorCancellable<T = any>(
        token: string,
        actor_id: string,
        input: ApifyRunInput,
        usage?: ApifyUsageContext,
        signal?: AbortSignal,
    ): Promise<T[]> {
        if (signal?.aborted) {
            throw new Error('Filter scrape aborted');
        }

        const started_at = Date.now();
        const startPath = `/acts/${actor_id.replace('/', '~')}/runs`;
        let run_id: string | null = null;

        try {
            const { data: startBody } = await this.http.post(
                startPath,
                input,
                { params: { token }, signal },
            );
            run_id = startBody?.data?.id ?? null;
            const dataset_id = startBody?.data?.defaultDatasetId ?? null;
            if (!run_id) {
                throw new InternalServerErrorException(
                    `Apify actor ${actor_id} started without a run id`,
                );
            }

            this.logger.log(`Apify actor ${actor_id} started run=${run_id}`);

            const terminal = await this.waitForRunTerminal(token, run_id, signal);
            if (terminal !== 'SUCCEEDED') {
                this.logUsage({
                    usage,
                    actor_id,
                    status: ApifyUsageStatus.ERROR,
                    duration_ms: Date.now() - started_at,
                    error_message: `Apify run ${run_id} ended with status ${terminal}`,
                    run_id,
                });
                if (terminal === 'ABORTED') {
                    throw new Error('Filter scrape aborted');
                }
                throw new InternalServerErrorException(
                    `Apify actor ${actor_id} failed with status ${terminal}`,
                );
            }

            const itemsPath = dataset_id
                ? `/datasets/${dataset_id}/items`
                : `/actor-runs/${run_id}/dataset/items`;
            const { data } = await this.http.get<T[]>(itemsPath, {
                params: { token },
                signal,
            });
            const results = Array.isArray(data) ? data : [];
            this.logUsage({
                usage,
                actor_id,
                status: ApifyUsageStatus.SUCCESS,
                result_count: results.length,
                duration_ms: Date.now() - started_at,
                run_id,
            });
            return results;
        } catch (error) {
            if (this.isAbortError(error) || signal?.aborted) {
                if (run_id) {
                    await this.abortRun(token, run_id);
                }
                this.logUsage({
                    usage,
                    actor_id,
                    status: ApifyUsageStatus.ERROR,
                    duration_ms: Date.now() - started_at,
                    error_message: 'Filter scrape aborted',
                    run_id,
                });
                throw new Error('Filter scrape aborted');
            }
            throw error;
        }
    }

    private async waitForRunTerminal(
        token: string,
        run_id: string,
        signal?: AbortSignal,
    ): Promise<string> {
        const deadline = Date.now() + APIFY_WAIT_FOR_FINISH_SECONDS * 1000;

        while (Date.now() < deadline) {
            if (signal?.aborted) {
                await this.abortRun(token, run_id);
                return 'ABORTED';
            }

            const { data } = await this.http.get(`/actor-runs/${run_id}`, {
                params: { token },
                signal,
            });
            const status = String(data?.data?.status ?? '');
            if (
                status === 'SUCCEEDED' ||
                status === 'FAILED' ||
                status === 'ABORTED' ||
                status === 'TIMED-OUT'
            ) {
                return status;
            }

            await this.sleep(2000, signal);
        }

        await this.abortRun(token, run_id);
        throw new GatewayTimeoutException(`Apify run ${run_id} timed out`);
    }

    private async abortRun(token: string, run_id: string): Promise<void> {
        try {
            await this.http.post(
                `/actor-runs/${run_id}/abort`,
                {},
                { params: { token } },
            );
            this.logger.warn(`Aborted Apify run ${run_id}`);
        } catch (error) {
            this.logger.warn(
                `Failed aborting Apify run ${run_id}: ${error instanceof Error ? error.message : error}`,
            );
        }
    }

    private isAbortError(error: unknown): boolean {
        if (!error || typeof error !== 'object') return false;
        const err = error as { code?: string; name?: string; message?: string };
        return (
            err.code === 'ERR_CANCELED' ||
            err.name === 'CanceledError' ||
            err.name === 'AbortError' ||
            /aborted|canceled|cancelled/i.test(err.message ?? '')
        );
    }

    private logUsage(params: {
        usage?: ApifyUsageContext;
        actor_id: string;
        status: ApifyUsageStatus;
        result_count?: number;
        duration_ms: number;
        error_message?: string;
        run_id?: string | null;
    }): void {
        if (!params.usage) {
            return;
        }

        this.apifyUsageService.log({
            user_uuid: params.usage.user_uuid,
            actor_id: params.actor_id,
            operation: params.usage.operation,
            status: params.status,
            result_count: params.result_count ?? null,
            duration_ms: params.duration_ms,
            run_id: params.run_id ?? null,
            reference_type: params.usage.reference_type ?? null,
            reference_uuid: params.usage.reference_uuid ?? null,
            error_message: params.error_message ?? null,
            metadata: params.usage.metadata,
        });
    }

    private async resolveApifyErrorDetail(token: string, error: AxiosError<any>): Promise<string | null> {
        const enveloped = this.extractApifyErrorDetail(error);
        const run_id = this.extractRunId(error, enveloped);

        if (run_id) {
            const status_message = await this.fetchRunStatusMessage(token, run_id);
            if (status_message) {
                return enveloped
                    ? `${enveloped} — ${status_message}`
                    : status_message;
            }
        }

        return enveloped;
    }

    private extractApifyErrorDetail(error: AxiosError<any>): string | null {
        const data = error?.response?.data;
        if (!data) return null;

        const enveloped = data?.error?.message ?? data?.error?.type;
        if (typeof enveloped === 'string' && enveloped.length > 0) return enveloped;

        if (typeof data === 'string' && data.length > 0) return data;
        if (typeof data?.message === 'string' && data.message.length > 0) return data.message;

        try {
            return JSON.stringify(data).slice(0, 500);
        } catch {
            return null;
        }
    }

    private extractRunId(error: AxiosError<any>, enveloped: string | null): string | null {
        const direct =
            error?.response?.data?.data?.id ??
            error?.response?.data?.runId ??
            error?.response?.data?.id;
        if (typeof direct === 'string' && direct.length > 0) return direct;

        if (enveloped) {
            const match = enveloped.match(/run ID:?\s*([A-Za-z0-9_-]+)/i);
            if (match) return match[1];
        }
        return null;
    }

    private async fetchRunStatusMessage(token: string, run_id: string): Promise<string | null> {
        try {
            const { data } = await this.http.get(`/actor-runs/${run_id}`, {
                params: { token },
            });
            const status_message = data?.data?.statusMessage;
            const exit_code = data?.data?.exitCode;
            if (typeof status_message === 'string' && status_message.length > 0) {
                return exit_code != null
                    ? `${status_message} (exit ${exit_code})`
                    : status_message;
            }
        } catch (error) {
            this.logger.warn(
                `Failed to fetch Apify run details for ${run_id}: ${(error as Error).message}`,
            );
        }
        return null;
    }

    private sleep(ms: number, signal?: AbortSignal): Promise<void> {
        return new Promise((resolve, reject) => {
            if (signal?.aborted) {
                reject(new Error('Filter scrape aborted'));
                return;
            }
            const timer = setTimeout(() => resolve(), ms);
            const onAbort = () => {
                clearTimeout(timer);
                reject(new Error('Filter scrape aborted'));
            };
            signal?.addEventListener('abort', onAbort, { once: true });
        });
    }
}
