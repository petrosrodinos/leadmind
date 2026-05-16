import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosInstance } from 'axios';
import {
    GEMI_API_BASE_URL,
    GEMI_MAX_PAGE_SIZE,
    GEMI_MAX_RETRIES,
    GEMI_REQUEST_TIMEOUT_MS,
    GEMI_RETRY_DELAY_MS,
} from './gemi.constants';
import {
    GemiActivity,
    GemiAssemblySubject,
    GemiCompany,
    GemiCompanyDocumentSet,
    GemiCompanyStatus,
    GemiLegalType,
    GemiMunicipality,
    GemiOffice,
    GemiPrefecture,
    GemiQueryConfig,
    GemiSearchResponse,
} from './gemi.interfaces';

@Injectable()
export class GemiClient {
    private readonly logger = new Logger(GemiClient.name);
    private readonly http: AxiosInstance;
    private readonly api_key: string;

    constructor(private readonly configService: ConfigService) {
        const raw = this.configService.get<string>('GEMI_API_KEY');
        this.api_key = typeof raw === 'string' ? raw.trim() : '';
        this.http = axios.create({
            baseURL: GEMI_API_BASE_URL,
            timeout: GEMI_REQUEST_TIMEOUT_MS,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    // ── Companies ─────────────────────────────────────────────────────────────

    async getCompanyByArGemi(ar_gemi: number): Promise<GemiCompany> {
        return this.get<GemiCompany>(`/companies/${ar_gemi}`);
    }

    async searchCompanies(query: GemiQueryConfig, offset: number, size: number): Promise<GemiSearchResponse> {
        const params: Record<string, any> = {
            resultsOffset: offset,
            resultsSize: Math.min(size, GEMI_MAX_PAGE_SIZE),
        };

        if (query.name) params.name = query.name;
        if (query.activities?.length) params.activities = query.activities.join(',');
        if (query.legalTypes?.length) params.legalTypes = query.legalTypes.join(',');
        if (query.municipalities?.length) params.municipalities = query.municipalities.join(',');
        if (query.prefectures?.length) params.prefectures = query.prefectures.join(',');
        if (query.statuses?.length) params.statuses = query.statuses.join(',');
        if (query.isActive !== undefined) params.isActive = query.isActive;

        return this.get<GemiSearchResponse>('/companies', params);
    }

    async getCompanyDocuments(ar_gemi: number): Promise<GemiCompanyDocumentSet> {
        return this.get<GemiCompanyDocumentSet>(`/companies/${ar_gemi}/documents`);
    }

    // ── Metadata ──────────────────────────────────────────────────────────────

    async getActivities(): Promise<GemiActivity[]> {
        return this.get<GemiActivity[]>('/metadata/activities');
    }

    async getPrefectures(): Promise<GemiPrefecture[]> {
        return this.get<GemiPrefecture[]>('/metadata/prefectures');
    }

    async getMunicipalities(): Promise<GemiMunicipality[]> {
        return this.get<GemiMunicipality[]>('/metadata/municipalities');
    }

    async getCompanyStatuses(): Promise<GemiCompanyStatus[]> {
        return this.get<GemiCompanyStatus[]>('/metadata/companyStatuses');
    }

    async getLegalTypes(): Promise<GemiLegalType[]> {
        return this.get<GemiLegalType[]>('/metadata/legalTypes');
    }

    async getGemiOffices(): Promise<GemiOffice[]> {
        return this.get<GemiOffice[]>('/metadata/gemiOffices');
    }

    async getAssemblySubjects(): Promise<GemiAssemblySubject[]> {
        return this.get<GemiAssemblySubject[]>('/metadata/assemblySubjects');
    }

    // ── Files ─────────────────────────────────────────────────────────────────

    async downloadFile(key: string, element_id: number): Promise<Buffer> {
        if (!this.api_key) {
            throw new InternalServerErrorException(
                'GEMI_API_KEY is missing or empty. Set it in your environment file or unset a conflicting shell variable.',
            );
        }
        let last_error: unknown;
        for (let attempt = 0; attempt <= GEMI_MAX_RETRIES; attempt++) {
            try {
                const { data } = await this.http.get<Buffer>('/downloadFile', {
                    params: { key, elementId: element_id },
                    headers: { api_key: this.api_key },
                    responseType: 'arraybuffer',
                });
                return Buffer.from(data);
            } catch (error) {
                last_error = error;
                if ((error as AxiosError)?.response?.status === 404) {
                    throw new NotFoundException(`GEMI file not found: key=${key} elementId=${element_id}`);
                }
                this.logger.warn(`GEMI /downloadFile attempt ${attempt + 1} failed: ${(error as Error).message}`);
                if (attempt < GEMI_MAX_RETRIES) await this.sleep(GEMI_RETRY_DELAY_MS);
            }
        }
        throw new InternalServerErrorException(`GEMI downloadFile failed: ${this.errorMessage(last_error)}`);
    }

    // ── Misc ──────────────────────────────────────────────────────────────────

    async health(): Promise<boolean> {
        if (!this.api_key) return false;
        try {
            await this.http.get('/health', { headers: { api_key: this.api_key } });
            return true;
        } catch {
            return false;
        }
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    private async get<T>(path: string, params?: Record<string, any>): Promise<T> {
        if (!this.api_key) {
            throw new InternalServerErrorException(
                'GEMI_API_KEY is missing or empty. Set it in your environment file or unset a conflicting shell variable.',
            );
        }
        let last_error: unknown;
        for (let attempt = 0; attempt <= GEMI_MAX_RETRIES; attempt++) {
            try {
                const { data } = await this.http.get<T>(path, {
                    params,
                    headers: { api_key: this.api_key },
                });
                return data;
            } catch (error) {
                last_error = error;
                const status = (error as AxiosError)?.response?.status;

                if (status === 404) {
                    throw new NotFoundException(`GEMI resource not found: ${path}`);
                }

                this.logger.warn(
                    `GEMI ${path} attempt ${attempt + 1} failed (HTTP ${status ?? '?'}): ${(error as Error).message}`,
                );

                if (attempt < GEMI_MAX_RETRIES) await this.sleep(GEMI_RETRY_DELAY_MS);
            }
        }
        throw new InternalServerErrorException(`GEMI ${path} failed: ${this.errorMessage(last_error)}`);
    }

    private errorMessage(error: unknown): string {
        if (error instanceof AxiosError) {
            const base = error.message;
            const data = error.response?.data;
            if (data && typeof data === 'object' && 'message' in data) {
                const msg = (data as { message: unknown }).message;
                if (typeof msg === 'string' && msg.length) {
                    return `${base} (${msg})`;
                }
            }
            return base;
        }
        return error instanceof Error ? error.message : 'Unknown error';
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
