export const SATELLITE_COLORS = {
  payload: '#00d4ff',
  debris: '#666666',
  rocketBody: '#ff8c00',
  selected: '#ffff00',
};

export const ORBIT_COLORS = {
  selected: '#ffcc00',
  highlighted: '#00ff88',
};

export const CONSTELLATION_COLORS: Record<string, string> = {
  STARLINK: '#ffffff',
  ONEWEB: '#ff0055',
  GPS: '#0055ff',
  GALILEO: '#ffff00',
  BEIDOU: '#ff0000',
  GLONASS: '#00ff00',
  PLANET: '#00ffff',
  SPIRE: '#ff00ff',
  'HAWKEYE 360': '#ffaa00',
  IRIDIUM: '#00aaff',
  GLOBALSTAR: '#aaff00',
};

export const API_BASE_URL = 'http://localhost:4000/api';
export const WS_URL = 'ws://localhost:4001';

export const DEFAULT_CAMERA_POSITION = {
  longitude: 0,
  latitude: 0,
  height: 20000000,
};
