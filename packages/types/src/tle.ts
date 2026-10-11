export interface TLE {
  noradId: number;
  name: string;
  line1: string;
  line2: string;
  epoch: Date;
  source: 'celestrak' | 'spacetrack' | 'custom';
  fetchedAt: Date;
}

export interface TLESet {
  satellites: TLE[];
  source: string;
  fetchedAt: Date;
  count: number;
}
