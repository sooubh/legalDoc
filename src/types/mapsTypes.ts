export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
}

export interface GroundingSource {
    uri: string;
    title: string;
    type: 'web' | 'maps';
}

export interface Lawyer {
  name: string;
  specialty?: string;
  address?: string;
  summary?: string;
  phone?: string;
  website?: string;
  email?: string;
  rating?: number;
  review?: string;
  source?: GroundingSource;
}