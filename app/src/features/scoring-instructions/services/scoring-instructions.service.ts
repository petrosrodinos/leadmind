import axiosInstance from "@/config/api/axios";
import { ApiRoutes } from "@/config/api/routes";
import type {
    CreateScoringInstructionPayload,
    ScoringInstruction,
    UpdateScoringInstructionPayload,
} from "../interfaces/scoring-instruction.interface";

export const listScoringInstructions = async (): Promise<ScoringInstruction[]> => {
    try {
        const response = await axiosInstance.get(ApiRoutes.scoring_instructions.list);
        return response.data;
    } catch (error: unknown) {
        const msg =
            error && typeof error === "object" && "response" in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
        throw new Error(msg || "Failed to load scoring instructions.");
    }
};

export const createScoringInstruction = async (
    payload: CreateScoringInstructionPayload,
): Promise<ScoringInstruction> => {
    try {
        const response = await axiosInstance.post(ApiRoutes.scoring_instructions.create, payload);
        return response.data;
    } catch (error: unknown) {
        const msg =
            error && typeof error === "object" && "response" in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
        throw new Error(msg || "Failed to create scoring instruction.");
    }
};

export const updateScoringInstruction = async (
    uuid: string,
    payload: UpdateScoringInstructionPayload,
): Promise<ScoringInstruction> => {
    try {
        const response = await axiosInstance.put(ApiRoutes.scoring_instructions.update(uuid), payload);
        return response.data;
    } catch (error: unknown) {
        const msg =
            error && typeof error === "object" && "response" in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
        throw new Error(msg || "Failed to update scoring instruction.");
    }
};

export const deleteScoringInstruction = async (uuid: string): Promise<{ uuid: string }> => {
    try {
        const response = await axiosInstance.delete(ApiRoutes.scoring_instructions.remove(uuid));
        return response.data;
    } catch (error: unknown) {
        const msg =
            error && typeof error === "object" && "response" in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : undefined;
        throw new Error(msg || "Failed to delete scoring instruction.");
    }
};
