export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    source?: string;
    cachedAt?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface ApiKeyConfig {
  provider: string;
  key: string;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  remaining?: number;
  resetAt?: Date;
}

export interface WebSocketMessage {
  type: 'positions' | 'tle_update' | 'alert' | 'heartbeat';
  payload: unknown;
  timestamp: number;
}

export interface PositionBroadcast {
  type: 'positions';
  payload: {
    positions: Array<{
      id: number;      // NORAD ID
      lat: number;
      lon: number;
      alt: number;
      vel: number;
    }>;
  };
  timestamp: number;
}
