"use client";
import { useState } from 'react';
import { DeepSpaceObservation, StellarAndTransientObject } from '@cosmos/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, ExternalLink, Star, Flame } from 'lucide-react';

interface Props {
  observations: DeepSpaceObservation[];
  transients: StellarAndTransientObject[];
}

export default function AstronomyGallery({ observations, transients }: Props) {
  const [selectedObs, setSelectedObs] = useState<DeepSpaceObservation | null>(
    observations[0] || null
  );
  const [activeSubTab, setActiveSubTab] = useState<'MAST' | 'GAIA_TNS'>('MAST');

  return (
    <Card className="p-4 border-gray-800 bg-gray-900/70 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-200">
            JWST / Hubble MAST & Gaia DR3
          </h3>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveSubTab('MAST')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
              activeSubTab === 'MAST'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            Telescopes ({observations.length})
          </button>
          <button
            onClick={() => setActiveSubTab('GAIA_TNS')}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
              activeSubTab === 'GAIA_TNS'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                : 'bg-gray-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            Gaia & Supernovae ({transients.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'MAST' ? (
        <div className="space-y-3">
          {selectedObs && (
            <div className="rounded overflow-hidden border border-gray-800 bg-gray-950/90">
              <div className="relative h-44 w-full bg-black overflow-hidden">
                <img
                  src={selectedObs.imageUrl}
                  alt={selectedObs.title}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition"
                />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <Badge variant="warning">{selectedObs.observatory}</Badge>
                  <Badge variant="default">{selectedObs.instrument}</Badge>
                </div>
                <a
                  href={selectedObs.archiveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute top-2 right-2 p-1.5 rounded bg-gray-900/80 text-gray-200 hover:text-amber-400"
                  title="Open STScI MAST / NASA Archive"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="p-2.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    {selectedObs.title}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">
                    {selectedObs.wavelengthBand}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-2">
                  {selectedObs.description}
                </p>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-1">
                  <span>Target: {selectedObs.targetName}</span>
                  <span>
                    RA {selectedObs.raDeg.toFixed(2)}° | Dec{' '}
                    {selectedObs.decDeg.toFixed(2)}°
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Observation Thumbnails Grid */}
          <div className="grid grid-cols-2 gap-2">
            {observations.map((obs) => {
              const active = selectedObs?.id === obs.id;
              return (
                <button
                  key={obs.id}
                  onClick={() => setSelectedObs(obs)}
                  className={`text-left p-2 rounded border transition ${
                    active
                      ? 'bg-gray-800/90 border-amber-500/50'
                      : 'bg-gray-950/60 border-gray-800/70 hover:bg-gray-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-amber-400">
                      {obs.observatory}
                    </span>
                    <span className="text-[9px] font-mono text-gray-500">
                      {obs.obsDate}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-gray-200 truncate">
                    {obs.targetName}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    {obs.instrument}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {transients.map((obj) => (
            <div
              key={obj.id}
              className="p-2.5 rounded bg-gray-950/75 border border-gray-800/80 space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  {obj.category === 'SUPERNOVA_TRANSIENT' ? (
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <Star className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                  <span className="text-xs font-bold text-white">{obj.name}</span>
                </div>
                <Badge
                  variant={
                    obj.category === 'SUPERNOVA_TRANSIENT'
                      ? 'danger'
                      : obj.category === 'PULSAR'
                      ? 'warning'
                      : 'info'
                  }
                >
                  {obj.spectralOrTransientType}
                </Badge>
              </div>
              <p className="text-[11px] text-gray-400">{obj.notes}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-gray-500 pt-0.5">
                <span>
                  RA {obj.raDeg.toFixed(2)}° | Dec {obj.decDeg.toFixed(2)}°
                </span>
                <span>
                  {obj.distanceLy
                    ? `${obj.distanceLy.toLocaleString()} ly`
                    : obj.redshift
                    ? `z = ${obj.redshift}`
                    : ''}{' '}
                  • Mag {obj.apparentMag}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
