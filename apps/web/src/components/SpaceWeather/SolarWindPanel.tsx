"use client";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { format } from 'date-fns';

export interface SolarWindItem {
  timestamp: string;
  density: number;
  speed: number;
  temperature: number;
  bx: number;
  by: number;
  bz: number;
  bt: number;
}

interface SolarWindPanelProps {
  current: SolarWindItem | null;
  history: SolarWindItem[];
}

export default function SolarWindPanel({ current, history }: SolarWindPanelProps) {
  const speed = current?.speed ?? 430;
  const density = current?.density ?? 5.1;
  const bz = current?.bz ?? -1.5;
  const bt = current?.bt ?? 5.4;

  const chartData = history.slice(-30).map((item) => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    speed: Math.round(item.speed),
    bz: Number(item.bz.toFixed(1)),
    bt: Number(item.bt.toFixed(1)),
  }));

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-gray-400">
          DSCOVR / ACE Solar Wind (L1)
        </span>
        <span className="text-[10px] text-cyan-400 font-mono">Real-Time Telemetry</span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-black/50 border border-gray-800 rounded p-2">
          <div className="text-[10px] text-gray-400">Wind Speed</div>
          <div className="text-sm font-bold font-mono text-amber-400">{speed.toFixed(0)}</div>
          <div className="text-[10px] text-gray-500">km/s</div>
        </div>
        <div className="bg-black/50 border border-gray-800 rounded p-2">
          <div className="text-[10px] text-gray-400">Proton Density</div>
          <div className="text-sm font-bold font-mono text-cyan-400">{density.toFixed(1)}</div>
          <div className="text-[10px] text-gray-500">p/cm³</div>
        </div>
        <div className="bg-black/50 border border-gray-800 rounded p-2">
          <div className="text-[10px] text-gray-400">IMF Bz / Bt</div>
          <div
            className={`text-sm font-bold font-mono ${
              bz < -5 ? 'text-red-400' : bz < 0 ? 'text-yellow-400' : 'text-emerald-400'
            }`}
          >
            {bz > 0 ? `+${bz.toFixed(1)}` : bz.toFixed(1)} / {bt.toFixed(1)}
          </div>
          <div className="text-[10px] text-gray-500">nT (GSM)</div>
        </div>
      </div>

      {/* Solar Wind Speed Chart */}
      {chartData.length > 0 && (
        <div className="h-28">
          <div className="text-[10px] text-gray-400 mb-1">Solar Wind Speed (km/s)</div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis domain={['auto', 'auto']} tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="speed"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
