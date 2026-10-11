import { SatelliteData } from '@/stores/satelliteStore';
import { propagateTleAtDate } from '@/lib/offlineStorage';

export interface WorkerPropagationRequest {
  satellites: SatelliteData[];
  timestampMs: number;
}

export interface WorkerPropagationResponse {
  positions: Array<{
    id: number;
    lat: number;
    lon: number;
    alt: number;
    vel: number;
  }>;
  timestampMs: number;
}

if (typeof self !== 'undefined' && typeof (self as any).onmessage !== 'undefined') {
  self.onmessage = (event: MessageEvent<WorkerPropagationRequest>) => {
    const { satellites, timestampMs } = event.data;
    const date = new Date(timestampMs);
    const positions = satellites.map((sat) => {
      const pos = propagateTleAtDate(sat, date);
      return {
        id: sat.noradId,
        ...pos,
      };
    });

    const response: WorkerPropagationResponse = {
      positions,
      timestampMs,
    };
    self.postMessage(response);
  };
}
