export type LaunchStatus =
  | 'GO'
  | 'TBC'
  | 'TBD'
  | 'SUCCESS'
  | 'FAILURE'
  | 'PARTIAL_FAILURE'
  | 'IN_FLIGHT'
  | 'HOLD';

export interface LaunchPadInfo {
  id: number;
  name: string;
  locationName: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  totalLaunchCount: number;
}

export interface RocketConfiguration {
  id: number;
  name: string;
  family: string;
  fullName: string;
  variant: string;
  reusable?: boolean;
  lengthMeters?: number | null;
  diameterMeters?: number | null;
  leoCapacityKg?: number | null;
  gtoCapacityKg?: number | null;
  launchMassTons?: number | null;
  toThrustKn?: number | null;
}

export interface LaunchMission {
  id: number;
  name: string;
  type: string;
  description: string;
  orbitName: string;
  orbitAbbrev: string;
}

export interface Launch {
  id: string;
  name: string;
  status: LaunchStatus;
  statusDescription: string;
  net: string;          // No Earlier Than ISO timestamp
  windowStart: string;
  windowEnd: string;
  probability: number | null;
  provider: {
    id: number;
    name: string;
    type: string;
    countryCode: string;
  };
  rocket: RocketConfiguration;
  mission: LaunchMission | null;
  pad: LaunchPadInfo;
  imageUrl: string | null;
  webcastLive: boolean;
  videoUrls: string[];
  orbitalStageCore?: {
    serial?: string;
    flightNumber?: number;
    reused?: boolean;
    landingAttempt?: boolean;
    landingSuccess?: boolean | null;
    landingType?: string | null;
    landpad?: string | null;
  };
}

export interface SpaceXSummaryStats {
  totalLaunches: number;
  successfulLaunches: number;
  totalLandings: number;
  reflighCount: number;
  activeStarlinkCount: number;
  recentLaunches: Array<{
    id: string;
    flightNumber: number;
    name: string;
    dateUtc: string;
    success: boolean | null;
    details: string | null;
    webcast: string | null;
    patchUrl: string | null;
    coreSerial?: string;
    coreFlight?: number;
    landingSuccess?: boolean | null;
  }>;
}

export interface SpaceNewsArticle {
  id: number;
  title: string;
  url: string;
  imageUrl: string;
  newsSite: string;
  summary: string;
  publishedAt: string;
  featured: boolean;
  launches: Array<{ launchId: string; provider: string }>;
}
