import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateCampaignPayload,
    GenerateCampaignMessagePayload,
    GenerateCampaignMessageResult,
    ListCampaignContactsQuery,
    ListCampaignsQuery,
    MarketingCampaign,
    PaginatedCampaignContacts,
    PaginatedCampaigns,
    PreviewContactsResult,
    UpdateCampaignPayload,
} from "../interfaces/campaign.interface";
import type { CampaignFilters } from "../interfaces/campaign.interface";

function unwrap(error: any, fallback: string): never {
    throw new Error(error?.response?.data?.message || fallback);
}

export async function listCampaigns(
    query: ListCampaignsQuery,
): Promise<PaginatedCampaigns> {
    try {
        const params: Record<string, unknown> = { ...query };
        if (Array.isArray(query.tags)) {
            params.tags = query.tags.length > 0 ? query.tags.join(",") : undefined;
        }
        const response = await axiosInstance.get(ApiRoutes.marketing_campaigns.list, { params });
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to load campaigns.");
    }
}

export async function getCampaign(uuid: string): Promise<MarketingCampaign> {
    try {
        const response = await axiosInstance.get(ApiRoutes.marketing_campaigns.get(uuid));
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to load campaign.");
    }
}

export async function listCampaignContacts(
    uuid: string,
    query: ListCampaignContactsQuery,
): Promise<PaginatedCampaignContacts> {
    try {
        const response = await axiosInstance.get(
            ApiRoutes.marketing_campaigns.contacts(uuid),
            { params: query },
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to load campaign recipients.");
    }
}

export async function createCampaign(
    payload: CreateCampaignPayload,
): Promise<MarketingCampaign> {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.marketing_campaigns.create,
            payload,
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to create campaign.");
    }
}

export async function updateCampaign(
    uuid: string,
    payload: UpdateCampaignPayload,
): Promise<MarketingCampaign> {
    try {
        const response = await axiosInstance.patch(
            ApiRoutes.marketing_campaigns.update(uuid),
            payload,
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to update campaign.");
    }
}

export async function deleteCampaign(uuid: string): Promise<{ uuid: string }> {
    try {
        const response = await axiosInstance.delete(
            ApiRoutes.marketing_campaigns.remove(uuid),
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to delete campaign.");
    }
}

export async function previewCampaignContacts(
    uuid: string,
    filters: CampaignFilters,
): Promise<PreviewContactsResult> {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.marketing_campaigns.preview_contacts(uuid),
            { filters },
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to preview contacts.");
    }
}

export async function startCampaign(uuid: string): Promise<MarketingCampaign> {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.marketing_campaigns.start(uuid),
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to start campaign.");
    }
}

export async function scheduleCampaign(
    uuid: string,
    scheduled_at: string,
): Promise<MarketingCampaign> {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.marketing_campaigns.schedule(uuid),
            { scheduled_at },
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to schedule campaign.");
    }
}

export async function cancelCampaign(uuid: string): Promise<MarketingCampaign> {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.marketing_campaigns.cancel(uuid),
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to cancel campaign.");
    }
}

export async function duplicateCampaign(uuid: string): Promise<MarketingCampaign> {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.marketing_campaigns.duplicate(uuid),
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to duplicate campaign.");
    }
}

export async function rerunCampaign(uuid: string): Promise<MarketingCampaign> {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.marketing_campaigns.rerun(uuid),
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "Failed to re-run campaign.");
    }
}

export async function generateCampaignMessage(
    uuid: string,
    payload: GenerateCampaignMessagePayload,
): Promise<GenerateCampaignMessageResult> {
    try {
        const response = await axiosInstance.post(
            ApiRoutes.marketing_campaigns.ai_generate(uuid),
            payload,
        );
        return response.data;
    } catch (error: any) {
        unwrap(error, "AI generation failed.");
    }
}
