import { AiProvider } from "@/integrations/ai/interfaces/ai.interface";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateAiDto {

    @IsNotEmpty()
    @IsString()
    prompt: string;

    @IsString()
    @IsOptional()
    provider?: AiProvider;

    @IsString()
    @IsOptional()
    model: string;

    @IsOptional()
    @IsString()
    system?: string;

    @IsOptional()
    @IsNumber()
    temperature?: number;

    @IsOptional()
    @IsNumber()
    maxTokens?: number;

    @IsOptional()
    @IsNumber()
    topP?: number;

    @IsOptional()
    @IsNumber()
    frequencyPenalty?: number;

    @IsOptional()
    @IsNumber()
    presencePenalty?: number;
}

