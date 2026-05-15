import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './services/ai.service';
import { AiConfig } from './utils/ai.config';
import { OpenAiBatchService } from './services/openai-batch.service';

@Module({
    imports: [ConfigModule],
    providers: [AiService, AiConfig, OpenAiBatchService],
    exports: [AiService, AiConfig, OpenAiBatchService],
})
export class AiIntegrationModule { }
