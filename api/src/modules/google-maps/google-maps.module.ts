import { Module } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';
import { GoogleMapsController } from './google-maps.controller';
import { GoogleMapsModule as GoogleMapsUtilsModule } from '@/shared/services/google-maps/google-maps.module';

@Module({
  imports: [GoogleMapsUtilsModule],
  controllers: [GoogleMapsController],
  providers: [GoogleMapsService],
})
export class GoogleMapsModule { }
