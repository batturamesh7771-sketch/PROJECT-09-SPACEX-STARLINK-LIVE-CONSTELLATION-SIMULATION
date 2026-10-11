"use client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { format } from 'date-fns';

export interface KpReadingItem {
  timestamp: string;
  kp: number;
  aRunning: number;
  stormLevel: string;
}

interface KpIndexGaugeProps {
  current: KpReadingItem | null;
  history: KpReadingItem[];
  radioFlux107cm?: number;
}

function getKpColor(kp: number): string {
  if (kp >= 8) return '#ef4444'; // Extreme/Severe Red
  if (kp >= 6) return '#f97316'; // Moderate/Strong Orange
  if (kp >= 5) return '#eab308'; // G1 Minor Storm Yellow
  if (kp >= 4) return '#84cc16'; // Active Lime
  return '#10b981';              // Quiet Emerald
}

function formatStormBadge(level?: string): string {
  if (!level) return 'QUIET (G0)';
  return level.replace('_', ' ');
}

export default function KpIndexGauge({ current, history, radioFlux107cm = 145 }: KpIndexGaugeProps) {
  const kpValue = current?.kp ?? 2.3;
  const kpColor = getKpColor(kpValue);
  const percentage = Math.min(100, Math.max(5, (kpValue / 9) * 100));

  const chartData = history.slice(-12).map((item) => ({
    time: format(new Date(item.timestamp), 'HH:mm'),
    kp: Number(item.kp.toFixed(2)),
    color: getKpColor(item.kp),
  }));

  return (
    <div className="bg-gray-900/90 border border-gray-800 rounded-lg p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400">Planetary Kp-Index</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold font-mono" style={{ color: kpColor }}>
              {kpValue.toFixed(1)}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded border"
              style={{
                color: kpColor,
                borderColor: `${kpColor}55`,
                backgroundColor: `${kpColor}18`,
              }}
            >
              {formatStormBadge(current?.stormLevel)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-gray-400">F10.7cm Flux</div>
          <div className="text-sm font-mono font-semibold text-amber-400">{radioFlux107cm} sfu</div>
          <div className="text-[10px] text-gray-500">Ap ≈ {current?.aRunning ?? 9} nT</div>
        </div>
      </div>

      {/* Linear Gauge 0 to 9 */}
      <div className="space-y-1">
        <div className="h-2.5 w-full bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: kpColor }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 font-mono">
          <span>0 Quiet</span>
          <span>4 Active</span>
          <span>5 G1</span>
          <span>7 G3</span>
          <span>9 G5</span>
        </div>
      </div>

      {/* 36-Hour Kp Bar Chart */}
      {chartData.length > 0 && (
        <div className="h-28 pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="time" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <YAxis domain={[0, 9]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  borderColor: '#374151',
                  fontSize: '11px',
                }}
              />
              <Bar dataKey="kp" radius={[3, 3, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
