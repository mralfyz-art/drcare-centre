export type Language = 'en' | 'ar';

export type RequestType = 'SCRATCH_DIAGNOSIS' | 'DRY_WASH';

export type LeadStatus = 'NEW LIVE' | 'IN PROGRESS' | 'COMPLETED';

export interface MediaItem {
  id: string;
  type: string;
  url: string;
  cloudSafeUrl?: string;
  resolution?: string;
}

export interface Lead {
  id: string;
  requestType: RequestType;
  clientName: string;
  clientPhone: string;
  carBrand: string;
  carModel: string;
  carColor: string;
  zone: string;
  gpsLink?: string;
  resolution?: string;
  estimatedQuote?: string;
  notes: string;
  media: MediaItem[];
  status: LeadStatus;
  createdAt: number;
  selectedCarParts?: string[];
  carYear?: string;
  timeSlot?: string;
}

export interface CarCountryInfo {
  flag: string;
  labelEn: string;
  labelAr: string;
  brands: Record<string, string[]>;
}

export type CarCatalog = Record<string, CarCountryInfo>;

export type TouchZoneKey = 'HOOD' | 'DOORS' | 'BUMPERS' | 'FULL_BODY';

export interface DefectPin {
  id: string;
  zone: TouchZoneKey;
  x: number;
  y: number;
  z: number;
  labelEn: string;
  labelAr: string;
}

export interface TouchZoneDetail {
  key: TouchZoneKey;
  code: string;
  en: string;
  ar: string;
  scopeEn: string;
  scopeAr: string;
  icon: string;
}

export interface DefectSeverity {
  id: string;
  value: string;
  titleEn: string;
  titleAr: string;
  subEn: string;
  subAr: string;
}

export interface WashPackageTier {
  id: string;
  name: string;
  tierBadgeEn: string;
  tierBadgeAr: string;
  badgeEn?: string;
  badgeAr?: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  bulletsEn: string[];
  bulletsAr: string[];
  selectLabelEn: string;
  selectLabelAr: string;
  isVip?: boolean;
}

export interface CarPartItem {
  id: string;
  category: 'front' | 'sides' | 'rear' | 'roof' | 'all';
  nameEn: string;
  nameAr: string;
  icon: string;
  zoneKey: TouchZoneKey;
  typicalIssueEn: string;
  typicalIssueAr: string;
}

export interface FaqItem {
  id: string;
  qEn: string;
  qAr: string;
  aEn: string;
  aAr: string;
  icon: string;
}

