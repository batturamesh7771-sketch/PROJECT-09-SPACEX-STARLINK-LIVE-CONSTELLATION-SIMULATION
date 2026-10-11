"use client";
import { format } from 'date-fns';
import { useSatelliteStore } from '@/stores/satelliteStore';

export interface GibsLayerItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  wmtsLayerName: string;
  format: 'image/jpeg' | 'image/png';
  tileMatrixSet: string;
  resolution: string;
  defaultDate: string;
}

export interface EarthSceneItem {
  id: string;
  mission: string;
  title: string;
  datetime: string;
  cloudCoverPercent: number | null;
  centerLat: number;
  centerLon: number;
  platform: string;
  constellation: string;
  thumbnailUrl: string | null;
  stacUrl: string | null;
}

interface EarthImageryOverlayProps {
  gibsLayers: GibsLayerItem[];
  scenes: EarthSceneItem[];
}

export default function EarthImageryOverlay({
  gibsLayers,
  scenes,
}: EarthImageryOverlayProps) {
  const { activeGibsLayer, setActiveGibsLayer, flyToLocation } = useSatelliteStore();

  return (
    <div className="space-y-3">
      {/* NASA GIBS Global WMTS Layer Switcher */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400">
              NASA GIBS Satellite Tile Layers
            </div>
            <div className="text-[11px] text-gray-500">
              Global EOSDIS WMTS Overlay on 3D Globe
            </div>
          </div>
          {activeGibsLayer && (
            <button
              onClick={() => setActiveGibsLayer(null)}
              className="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40"
            >
              Clear Layer
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {gibsLayers.map((layer) => {
            const isActive = activeGibsLayer?.id === layer.id;
            return (
              <div
                key={layer.id}
                onClick={() =>
                  setActiveGibsLayer(
                    isActive
                      ? null
                      : {
                          id: layer.id,
                          wmtsLayerName: layer.wmtsLayerName,
                          format: layer.format,
                          tileMatrixSet: layer.tileMatrixSet,
                          defaultDate: layer.defaultDate,
                        }
                  )
                }
                className={`p-2 rounded border cursor-pointer transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-cyan-950/50 border-cyan-500/60'
                    : 'bg-black/50 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-gray-100">{layer.title}</div>
                  <div className="text-[10px] text-gray-500">{layer.subtitle}</div>
                </div>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-gray-800 text-gray-400'
                  }`}
                >
                  {isActive ? 'ACTIVE' : layer.resolution}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Copernicus Sentinel & USGS Landsat Scene Browser */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wider text-gray-400">
            Copernicus Sentinel & Landsat Scenes
          </span>
          <span className="text-[10px] font-mono text-emerald-400">STAC Catalog</span>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {scenes.map((sc) => (
            <div
              key={sc.id}
              onClick={() =>
                flyToLocation({
                  lat: sc.centerLat,
                  lon: sc.centerLon,
                  altMeters: 450000,
                  label: sc.title,
                })
              }
              className="bg-black/50 hover:bg-gray-800/70 border border-gray-800 rounded p-2 text-xs cursor-pointer transition-colors space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-gray-200 truncate">{sc.title}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {sc.mission}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
                <span>
                  {sc.centerLat.toFixed(2)}°, {sc.centerLon.toFixed(2)}° •{' '}
                  {sc.cloudCoverPercent !== null ? `Cloud: ${sc.cloudCoverPercent}%` : 'SAR'}
                </span>
                <span className="text-gray-500">
                  {format(new Date(sc.datetime), 'MMM d, HH:mm')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
