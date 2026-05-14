export interface ScoringInstruction {
    id: number;
    uuid: string;
    user_uuid: string;
    name: string;
    instructions: string;
    created_at: string;
    updated_at: string;
}

export interface CreateScoringInstructionPayload {
    name: string;
    instructions: string;
}

export type UpdateScoringInstructionPayload = Partial<CreateScoringInstructionPayload>;
