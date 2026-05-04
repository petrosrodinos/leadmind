import { Injectable } from '@nestjs/common';
import { GoogleMapsService as GoogleMapsServiceUtils } from '@/shared/services/google-maps/google-maps.service';

@Injectable()
export class GoogleMapsService {
  constructor(private readonly googleMapsService: GoogleMapsServiceUtils) {
  }

  async getTimezone(lat: number, lng: number) {

    return this.googleMapsService.getTimezone(lat, lng);

  }


}
