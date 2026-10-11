import { useEffect, useCallback, useRef } from 'react';
import { useSatelliteStore } from '@/stores/satelliteStore';
import {
  DEFAULT_OFFLINE_TLES,
  loadOfflineSnapshotFromLocal,
  propagateTleAtDate,
  tleRecordToSatelliteData,
} from '@/lib/offlineStorage';

export function useWebSocket(url: string = 'ws://localhost:4001') {
  const {
    wsConnected,
    offlineMode,
    satellites,
    isPlaying,
    timeMultiplier,
    setWsConnected,
    setSatellites,
    updatePositions,
  } = useSatelliteStore();
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const simTimeRef = useRef<number>(Date.now());

  const connect = useCallback(() => {
    if (offlineMode) {
      ws.current?.close();
      setWsConnected(false);
      return;
    }

    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        setWsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const posList = data?.payload?.positions || data?.positions;
          if (data.type === 'positions' && Array.isArray(posList)) {
            const positionsMap = new Map();
            posList.forEach((p: any) => {
              positionsMap.set(p.id, {
                lat: p.lat,
                lon: p.lon,
                alt: p.alt,
                vel: p.vel,
              });
            });
            updatePositions(positionsMap);
          }
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };

      ws.current.onclose = () => {
        setWsConnected(false);
        if (!offlineMode) {
          reconnectTimeout.current = setTimeout(connect, 5000);
        }
      };

      ws.current.onerror = () => {
        ws.current?.close();
      };
    } catch {
      reconnectTimeout.current = setTimeout(connect, 5000);
    }
  }, [url, offlineMode, setWsConnected, updatePositions]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimeout.current);
      ws.current?.close();
    };
  }, [connect]);

  // Automatic Offline / Client-Side SGP4 Fallback Engine
  useEffect(() => {
    if (wsConnected && !offlineMode) return;

    // Seed offline satellite catalog if store is currently empty
    if (satellites.size === 0) {
      const localSnap = loadOfflineSnapshotFromLocal();
      const tleSource = localSnap?.tles?.length
        ? localSnap.tles
        : DEFAULT_OFFLINE_TLES;
      const seeded = new Map();
      for (const rec of tleSource) {
        const satData = tleRecordToSatelliteData(rec);
        seeded.set(satData.noradId, satData);
      }
      setSatellites(seeded);
    }

    const interval = setInterval(() => {
      if (!isPlaying) return;
      simTimeRef.current += 1000 * timeMultiplier;
      const currentSimDate = new Date(simTimeRef.current);
      const currentSats = useSatelliteStore.getState().satellites;
      if (currentSats.size === 0) return;

      const nextPositions = new Map();
      currentSats.forEach((sat, id) => {
        nextPositions.set(id, propagateTleAtDate(sat, currentSimDate));
      });
      updatePositions(nextPositions);
    }, 1000);

    return () => clearInterval(interval);
  }, [wsConnected, offlineMode, satellites.size, isPlaying, timeMultiplier, setSatellites, updatePositions]);

  return { connected: wsConnected };
}
