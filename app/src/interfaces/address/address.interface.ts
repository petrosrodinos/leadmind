export interface AutocompleteAddress {
    formatted_address: string;
    coordinates: Coordinates;
    country: string;
    city: string;
    area: string;
    postalCode: string;
    street: string;
    streetNumber: string;
    placeId: string;
    timezone?: Timezone;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface Timezone {
    timeZoneId: string;
    timeZoneName: string;
    rawOffset: number;
    dstOffset: number;
}