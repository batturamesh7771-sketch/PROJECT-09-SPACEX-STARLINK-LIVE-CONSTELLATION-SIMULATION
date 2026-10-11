"use client";
import { useState } from 'react';
import SearchPanel from './SearchPanel';
import SatelliteInfoPanel from './SatelliteInfoPanel';
import ConstellationPanel from './ConstellationPanel';
import SpaceWeatherDashboard from '../SpaceWeather/SpaceWeatherDashboard';
import LaunchesDashboard from '../Launches/LaunchesDashboard';
import DebrisDashboard from '../Debris/DebrisDashboard';
import PlanetaryDefenseDashboard from '../Asteroids/PlanetaryDefenseDashboard';
import EarthObsDashboard from '../EarthObs/EarthObsDashboard';
import PlanetaryDashboard from '../SolarSystem/PlanetaryDashboard';
import DeepSpaceDashboard from '../DeepSpace/DeepSpaceDashboard';
import SystemVaultDashboard from '../System/SystemVaultDashboard';

type SidebarTab =
  | 'search'
  | 'info'
  | 'constellations'
  | 'weather'
  | 'launches'
  | 'debris'
  | 'defense'
  | 'earth'
  | 'planets'
  | 'deepspace'
  | 'vault';

export default function Sidebar() {
  const [tab, setTab] = useState<SidebarTab>('search');

  const tabs: Array<{ id: SidebarTab; label: string }> = [
    { id: 'search', label: 'Search' },
    { id: 'info', label: 'Info' },
    { id: 'constellations', label: 'Swarms' },
    { id: 'weather', label: 'Weather' },
    { id: 'launches', label: 'Launches' },
    { id: 'debris', label: 'Debris' },
    { id: 'defense', label: 'NEOs' },
    { id: 'earth', label: 'Earth Obs' },
    { id: 'planets', label: 'Planets' },
    { id: 'deepspace', label: 'Deep Space' },
    { id: 'vault', label: 'Vault / Offline' },
  ];

  return (
    <div className="h-full flex flex-col p-3 overflow-y-auto text-sm">
      <div className="flex flex-wrap gap-1 mb-3 border-b border-gray-800 pb-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
              tab === item.id
                ? 'bg-cyan-500/20 text-satellite-cyan border border-cyan-500/40'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pr-0.5">
        {tab === 'search' && <SearchPanel />}
        {tab === 'info' && <SatelliteInfoPanel />}
        {tab === 'constellations' && <ConstellationPanel />}
        {tab === 'weather' && <SpaceWeatherDashboard />}
        {tab === 'launches' && <LaunchesDashboard />}
        {tab === 'debris' && <DebrisDashboard />}
        {tab === 'defense' && <PlanetaryDefenseDashboard />}
        {tab === 'earth' && <EarthObsDashboard />}
        {tab === 'planets' && <PlanetaryDashboard />}
        {tab === 'deepspace' && <DeepSpaceDashboard />}
        {tab === 'vault' && <SystemVaultDashboard />}
      </div>
    </div>
  );
}
