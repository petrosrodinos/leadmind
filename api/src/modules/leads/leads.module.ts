import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { AiIntegrationModule } from '@/integrations/ai/ai.module';
import { LeadAiService } from './utils/lead-ai.service';

@Module({
    imports: [PrismaModule, AiIntegrationModule],
    providers: [LeadAiService],
    exports: [LeadAiService],
})
export class LeadsModule { }
