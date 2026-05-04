import { Module } from '@nestjs/common';
import { InternalAiService } from './ai.service';
import { AiController } from './ai.controller';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';

@Module({
  imports: [AiIntegrationModule],
  controllers: [AiController],
  providers: [InternalAiService],
})
export class AiModule { }
