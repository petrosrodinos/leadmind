import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAiDto } from './dto/create-ai.dto';
import { AiService } from '@/integrations/ai/services/ai.service';

@Injectable()
export class InternalAiService {

  constructor(private readonly aiService: AiService) { }

  create(createAiDto: CreateAiDto) {
    try {
      return this.aiService.generateText({
        provider: createAiDto.provider,
        model: createAiDto.model,
        system: createAiDto.system,
        prompt: createAiDto.prompt,
        temperature: createAiDto.temperature,
        maxTokens: createAiDto.maxTokens,
        topP: createAiDto.topP,
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


}
