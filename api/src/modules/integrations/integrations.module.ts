import { Module } from '@nestjs/common';
import { PrismaModule } from '@/core/databases/prisma/prisma.module';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { EmailCredentialsService } from './services/email-credentials.service';

@Module({
    imports: [PrismaModule],
    controllers: [IntegrationsController],
    providers: [IntegrationsService, EmailCredentialsService],
    exports: [IntegrationsService, EmailCredentialsService],
})
export class IntegrationsModule {}
