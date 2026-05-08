import { GatewayTimeoutException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
    APIFY_API_BASE_URL,
    APIFY_MAX_RETRIES,
    APIFY_RETRY_DELAY_MS,
    APIFY_WAIT_FOR_FINISH_SECONDS,
} from './apify.constants';
import { ApifyRunInput } from './interfaces/apify.interfaces';

@Injectable()
export class ApifyClient {
    private readonly logger = new Logger(ApifyClient.name);
    private readonly token: string;
    private readonly http: AxiosInstance;

    constructor(private readonly configService: ConfigService) {
        this.token = this.configService.get<string>('APIFY_API_TOKEN');
        this.http = axios.create({
            baseURL: APIFY_API_BASE_URL,
            timeout: (APIFY_WAIT_FOR_FINISH_SECONDS + 30) * 1000,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    async runActor<T = any>(actor_id: string, input: ApifyRunInput): Promise<T[]> {
        const path = `/acts/${actor_id.replace('/', '~')}/run-sync-get-dataset-items`;

        let last_error: unknown;
        for (let attempt = 0; attempt <= APIFY_MAX_RETRIES; attempt++) {
            try {
                const { data } = await this.http.post<T[]>(path, input, {
                    params: { token: this.token, waitForFinish: APIFY_WAIT_FOR_FINISH_SECONDS },
                });
                return Array.isArray(data) ? data : [];
            } catch (error) {
                last_error = error;
                const axios_err = error as AxiosError<any>;
                const status = axios_err?.response?.status;

                if (status === 408) {
                    this.logger.warn(`Apify actor ${actor_id} timed out (HTTP 408)`);
                    throw new GatewayTimeoutException(`Apify actor ${actor_id} timed out`);
                }

                const detail = await this.resolveApifyErrorDetail(axios_err);
                this.logger.warn(
                    `Apify actor ${actor_id} attempt ${attempt + 1} failed (HTTP ${status ?? '?'}): ${detail ?? axios_err.message}`,
                );

                if (attempt < APIFY_MAX_RETRIES) {
                    await this.sleep(APIFY_RETRY_DELAY_MS);
                }
            }
        }

        const detail =
            last_error && (last_error as AxiosError).isAxiosError
                ? await this.resolveApifyErrorDetail(last_error as AxiosError<any>)
                : null;
        const fallback = last_error instanceof Error ? last_error.message : 'Unknown Apify error';
        throw new InternalServerErrorException(
            `Apify actor ${actor_id} failed: ${detail ?? fallback}`,
        );
    }

    private async resolveApifyErrorDetail(error: AxiosError<any>): Promise<string | null> {
        const enveloped = this.extractApifyErrorDetail(error);
        const run_id = this.extractRunId(error, enveloped);

        if (run_id) {
            const status_message = await this.fetchRunStatusMessage(run_id);
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

        // Apify's standard error envelope: { error: { type, message } }
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

    private async fetchRunStatusMessage(run_id: string): Promise<string | null> {
        try {
            const { data } = await this.http.get(`/actor-runs/${run_id}`, {
                params: { token: this.token },
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

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
