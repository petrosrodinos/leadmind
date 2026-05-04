import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GcsAdapter } from './gcs.adapter';
import { GcsService } from './services/gcs.service';
import { GcsConfig } from './config/gcs.config';

@Module({
    imports: [ConfigModule],
    providers: [
        GcsService,
        GcsAdapter,
        GcsConfig,
        Logger
    ],
    exports: [GcsService],
})
export class GcsIntegrationModule { }
