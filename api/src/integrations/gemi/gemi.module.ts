import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GemiClient } from './gemi.client';
import { GemiService } from './gemi.service';

@Module({
    imports: [ConfigModule],
    providers: [GemiClient, GemiService],
    exports: [GemiService],
})
export class GemiModule {}
