import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleMapsService {

    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get('GOOGLE_MAPS_API_KEY');
    }

    async getTimezone(lat: number, lng: number) {

        try {

            const timestamp = Math.floor(Date.now() / 1000);

            const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${this.apiKey}`;

            const res = await fetch(url);
            const data = await res.json();

            return {
                timeZoneId: data.timeZoneId, // e.g. "Europe/Athens"
                timeZoneName: data.timeZoneName, // e.g. "Eastern European Summer Time"
                rawOffset: data.rawOffset, // offset from UTC in seconds
                dstOffset: data.dstOffset, // daylight savings offset in seconds
            };
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException(error.message);
        }
    }

}
