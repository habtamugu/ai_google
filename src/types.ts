export type Language = 'en' | 'am' | 'om' | 'ti' | 'so' | 'aa';

export interface Translation {
  en: string;
  am: string;
  om: string;
  ti: string;
  so: string;
  aa: string;
}

export interface Mood {
  id: string;
  icon: string;
  label: Translation;
  color: string;
}

export interface Exercise {
  id: string;
  icon: string;
  label: Translation;
  description: Translation;
  audioDescription?: Translation;
  moods: string[];
  videoUrls?: Translation;
}

export interface Resource {
  id: string;
  icon: string;
  label: Translation;
  type: 'call' | 'location' | 'office';
  value: string;
}

export interface HealthCenter {
  id: string;
  name: Translation;
  dist: string;
  phone: string;
  lat: number;
  lng: number;
  hours: Translation;
  services: Translation;
  realDistance?: number | null;
}
