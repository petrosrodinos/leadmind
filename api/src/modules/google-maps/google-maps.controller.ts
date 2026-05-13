import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GoogleMapsService } from './google-maps.service';

@ApiTags('google-maps')
@Controller('google-maps')
export class GoogleMapsController {
  constructor(private readonly googleMapsService: GoogleMapsService) { }

  @Get('timezone')
  @ApiOperation({ summary: 'Get timezone for a lat/lng coordinate' })
  @ApiQuery({ name: 'lat', required: true, type: Number, example: 37.7749, description: 'Latitude' })
  @ApiQuery({ name: 'lng', required: true, type: Number, example: -122.4194, description: 'Longitude' })
  @ApiResponse({ status: 200, description: 'Timezone data for the given coordinates' })
  @ApiResponse({ status: 400, description: 'Invalid coordinates' })
  getTimezone(@Query('lat') lat: number, @Query('lng') lng: number) {
    return this.googleMapsService.getTimezone(lat, lng);
  }
}
