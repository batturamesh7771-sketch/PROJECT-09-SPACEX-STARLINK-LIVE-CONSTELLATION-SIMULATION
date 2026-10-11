"use client";
import { useState } from 'react';
import { fetchMarsRoverPhotos } from '@/lib/api';

export interface MarsPhotoItem {
  id: number;
  sol: number;
  earthDate: string;
  imgSrc: string;
  cameraName: string;
  cameraFullName: string;
  roverName: string;
  roverStatus: string;
}

export interface PdsDatasetItem {
  id: string;
  title: string;
  missionName: string;
  targetBody: string;
  instrumentName: string;
  pdsVersion: string;
  releaseDate: string;
  archiveUrl: string;
}

export interface PlanetaryMapLayerItem {
  id: string;
  targetBody: string;
  name: string;
  instrument: string;
  wmsUrl: string;
  layerId: string;
  resolutionMeters: number;
}

interface MarsRoverGalleryProps {
  initialPhotos: MarsPhotoItem[];
  datasets: PdsDatasetItem[];
  maps: PlanetaryMapLayerItem[];
}

export default function MarsRoverGallery({
  initialPhotos,
  datasets,
  maps,
}: MarsRoverGalleryProps) {
  const [photos, setPhotos] = useState<MarsPhotoItem[]>(initialPhotos);
  const [rover, setRover] = useState<'curiosity' | 'perseverance'>('curiosity');
  const [selectedPhoto, setSelectedPhoto] = useState<MarsPhotoItem | null>(null);
  const [loadingRover, setLoadingRover] = useState(false);

  const switchRover = async (nextRover: 'curiosity' | 'perseverance') => {
    setRover(nextRover);
    setLoadingRover(true);
    try {
      const res = await fetchMarsRoverPhotos(nextRover);
      if (res?.data) {
        setPhotos(res.data);
      }
    } catch (e) {
      console.warn('Mars rover switch warning:', e);
    } finally {
      setLoadingRover(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* NASA Mars Rover Surface Imagery Gallery */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400">
              Mars Rover Surface Telemetry
            </div>
            <div className="text-[11px] text-gray-500">MSL Curiosity & Mars 2020 Perseverance</div>
          </div>
          <div className="flex gap-1">
            {(['curiosity', 'perseverance'] as const).map((r) => (
              <button
                key={r}
                onClick={() => switchRover(r)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                  rover === r
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {selectedPhoto && (
          <div className="bg-black/80 border border-orange-500/40 rounded p-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-orange-300">
                {selectedPhoto.roverName} • Sol {selectedPhoto.sol} ({selectedPhoto.cameraName})
              </span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="text-gray-400 hover:text-white px-1.5 py-0.5 bg-gray-800 rounded text-[10px]"
              >
                Close
              </button>
            </div>
            <img
              src={selectedPhoto.imgSrc}
              alt={selectedPhoto.cameraFullName}
              className="w-full h-44 object-cover rounded border border-gray-800"
            />
            <div className="text-[10px] text-gray-400 font-mono">
              {selectedPhoto.cameraFullName} • Earth Date: {selectedPhoto.earthDate}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
          {loadingRover ? (
            <div className="col-span-2 text-xs text-gray-500 py-4 text-center">
              Querying JPL Deep Space Network Mars Relay...
            </div>
          ) : (
            photos.slice(0, 8).map((photo) => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="bg-black/60 hover:border-orange-500/50 border border-gray-800 rounded overflow-hidden cursor-pointer transition-colors"
              >
                <div className="h-24 bg-gray-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={photo.imgSrc}
                    alt={photo.cameraName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="p-1.5 text-[10px] font-mono flex items-center justify-between">
                  <span className="text-orange-300 font-semibold">{photo.cameraName}</span>
                  <span className="text-gray-400">Sol {photo.sol}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* USGS Astrogeology Planetary Cartography WMS Catalog */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          USGS Astrogeology Planetary Basemaps
        </div>
        <div className="space-y-1.5">
          {maps.map((m) => (
            <div
              key={m.id}
              className="bg-black/50 border border-gray-800 rounded p-2 text-xs flex items-center justify-between"
            >
              <div>
                <div className="font-semibold text-gray-200">{m.name}</div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {m.targetBody} • {m.instrument}
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-800 text-amber-300">
                {m.resolutionMeters}m/px
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* NASA Planetary Data System (PDS4) & ESA PSA Archive */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-2">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          NASA PDS4 & ESA Planetary Science Archive
        </div>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {datasets.map((ds) => (
            <a
              key={ds.id}
              href={ds.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-black/50 hover:bg-gray-800/70 border border-gray-800 rounded p-2 text-xs transition-colors"
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400 mb-0.5">
                <span>
                  {ds.missionName} ({ds.targetBody})
                </span>
                <span className="text-gray-500">{ds.pdsVersion}</span>
              </div>
              <div className="font-medium text-gray-200 line-clamp-1">{ds.title}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
