import { Module } from '@nestjs/common';
import { GemiModule as GemiIntegrationModule } from '@/integrations/gemi/gemi.module';
import { GemiController } from './gemi.controller';

@Module({
    imports: [GemiIntegrationModule],
    controllers: [GemiController],
})
export class GemiModule {}
