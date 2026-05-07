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
                const status = (error as AxiosError)?.response?.status;

                if (status === 408) {
                    this.logger.warn(`Apify actor ${actor_id} timed out (HTTP 408)`);
                    throw new GatewayTimeoutException(`Apify actor ${actor_id} timed out`);
                }

                this.logger.warn(
                    `Apify actor ${actor_id} attempt ${attempt + 1} failed: ${(error as Error).message}`,
                );

                if (attempt < APIFY_MAX_RETRIES) {
                    await this.sleep(APIFY_RETRY_DELAY_MS);
                }
            }
        }

        const message = last_error instanceof Error ? last_error.message : 'Unknown Apify error';
        throw new InternalServerErrorException(`Apify actor ${actor_id} failed: ${message}`);
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
