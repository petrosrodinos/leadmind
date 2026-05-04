import { Module } from '@nestjs/common';
import { AiService } from './services/ai.service';
import { AiConfig } from './utils/ai.config';

@Module({
    imports: [],
    providers: [AiService, AiConfig],
    exports: [AiService],
})
export class AiIntegrationModule { }
