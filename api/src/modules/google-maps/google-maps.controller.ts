import { Controller, Get, Query } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';

@Controller('google-maps')
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) { }

  @Get('timezone')
  getTimezone(@Query('lat') lat: number, @Query('lng') lng: number) {
    return this.googleMapsService.getTimezone(lat, lng);
  }


}
