import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { AiService } from '@/integrations/ai/services/ai.service';

@Injectable()
export class InternalAiService {
    constructor(private readonly aiService: AiService) {}

    create(user_uuid: string, createAiDto: CreateAiDto) {
        try {
            return this.aiService.generateText({
                user_uuid,
                provider: createAiDto.provider,
                model: createAiDto.model,
                system: createAiDto.system,
                prompt: createAiDto.prompt,
                temperature: createAiDto.temperature,
                maxTokens: createAiDto.maxTokens,
                topP: createAiDto.topP,
                usage: { operation: 'ADMIN_GENERATE' },
            });
        } catch (error) {
            throw new BadRequestException(error instanceof Error ? error.message : String(error));
        }
    }
}
