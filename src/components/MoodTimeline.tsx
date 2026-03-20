import React, { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { MoodNode } from '@u/types';

interface MoodTimelineProps {
  selectedNode: MoodNode | null;
}

interface TimelinePoint {
  day: string;
  moodLevel: number;
  energyLevel: number;
}

const DAYS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14'];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed: number) {
  let t = seed;
  return function random() {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function buildNodeSeries(selectedNode: MoodNode | null): TimelinePoint[] {
  if (!selectedNode) {
    return DAYS.map((day) => ({
      day,
      moodLevel: 0,
      energyLevel: 0,
    }));
  }

  const seed = hashString(
    `${selectedNode.id}-${selectedNode.label}-${selectedNode.position.x}-${selectedNode.position.y}-${selectedNode.position.z}`
  );
  const random = mulberry32(seed);

  const baseMood = selectedNode.position.x;
  const baseEnergy = selectedNode.position.y;
  const stability = selectedNode.position.z;
  const clinicalRisk = selectedNode.clinicalRisk;

  /**
   * z negativo = mais instável
   * z positivo = mais estável
   */
  const instabilityFactor = clamp(1 + Math.abs(Math.min(0, stability)) * 0.25, 1, 2.2);
  const stabilityDamping = clamp(1 - Math.max(0, stability) * 0.12, 0.45, 1);
  const riskFactor = clamp(clinicalRisk / 100, 0, 1);

  const data: TimelinePoint[] = [];

  for (let i = 0; i < DAYS.length; i += 1) {
    const t = i / Math.max(DAYS.length - 1, 1);
    const n1 = (random() - 0.5) * 2;
    const n2 = (random() - 0.5) * 2;

    let mood = baseMood;
    let energy = baseEnergy;

    switch (selectedNode.id) {
      case 'euthymia': {
        mood = 0 + Math.sin(i * 0.7) * 0.12 + n1 * 0.12;
        energy = 0 + Math.cos(i * 0.65) * 0.12 + n2 * 0.12;
        break;
      }

      case 'cyclothymia': {
        mood =
          0.15 +
          Math.sin(i * 1.1) * 1.0 +
          Math.sin(i * 0.35) * 0.25 +
          n1 * 0.22 * instabilityFactor;
        energy =
          0.25 +
          Math.sin(i * 1.1 + 0.9) * 0.9 +
          Math.cos(i * 0.4) * 0.2 +
          n2 * 0.22 * instabilityFactor;
        break;
      }

      case 'major-depression': {
        mood =
          baseMood +
          Math.sin(i * 0.55) * 0.22 +
          Math.cos(i * 0.2) * 0.12 -
          0.15 +
          n1 * 0.14 * stabilityDamping;
        energy =
          baseEnergy +
          Math.sin(i * 0.5 + 0.6) * 0.18 -
          0.12 +
          n2 * 0.12 * stabilityDamping;
        break;
      }

      case 'dysthymia': {
        mood =
          baseMood +
          Math.sin(i * 0.45) * 0.14 +
          Math.cos(i * 0.18) * 0.08 +
          n1 * 0.09 * stabilityDamping;
        energy =
          baseEnergy +
          Math.sin(i * 0.42 + 0.8) * 0.12 +
          n2 * 0.08 * stabilityDamping;
        break;
      }

      case 'hypomania': {
        mood =
          baseMood +
          0.15 +
          Math.sin(i * 0.85) * 0.35 +
          Math.cos(i * 0.22) * 0.12 +
          n1 * 0.14;
        energy =
          baseEnergy +
          0.2 +
          Math.sin(i * 0.9 + 0.35) * 0.42 +
          n2 * 0.15;
        break;
      }

      case 'mania': {
        mood =
          baseMood -
          0.25 +
          Math.sin(i * 1.05) * 0.45 +
          Math.cos(i * 0.35) * 0.18 +
          n1 * 0.26 * instabilityFactor +
          riskFactor * 0.15;
        energy =
          baseEnergy -
          0.15 +
          Math.sin(i * 1.15 + 0.45) * 0.6 +
          n2 * 0.28 * instabilityFactor +
          riskFactor * 0.1;
        break;
      }

      case 'mixed-state': {
        mood =
          baseMood -
          0.1 +
          Math.sin(i * 1.2) * 0.65 +
          Math.cos(i * 0.4) * 0.15 +
          n1 * 0.32 * instabilityFactor;
        energy =
          baseEnergy +
          0.15 +
          Math.sin(i * 1.15 + 1.25) * 0.72 +
          n2 * 0.34 * instabilityFactor;
        break;
      }

      case 'agitated-depression': {
        mood =
          baseMood -
          0.12 +
          Math.sin(i * 0.95) * 0.32 +
          Math.cos(i * 0.28) * 0.1 +
          n1 * 0.22 * instabilityFactor;
        energy =
          baseEnergy +
          Math.abs(Math.sin(i * 1.05 + 0.5)) * 0.55 +
          Math.cos(i * 0.3) * 0.08 +
          n2 * 0.22 * instabilityFactor;
        break;
      }

      case 'catatonia': {
        mood =
          baseMood -
          0.1 +
          Math.sin(i * 0.22) * 0.05 +
          n1 * 0.04 * stabilityDamping;
        energy =
          baseEnergy +
          Math.sin(i * 0.18 + 0.2) * 0.06 +
          n2 * 0.04 * stabilityDamping;
        break;
      }

      default: {
        mood =
          baseMood +
          Math.sin(i * 0.75) * 0.25 +
          n1 * 0.15 * instabilityFactor;
        energy =
          baseEnergy +
          Math.sin(i * 0.8 + 0.6) * 0.25 +
          n2 * 0.15 * instabilityFactor;
      }
    }

    mood = clamp(mood, -4.5, 4.5);
    energy = clamp(energy, -4.5, 4.5);

    data.push({
      day: DAYS[i],
      moodLevel: Number(mood.toFixed(2)),
      energyLevel: Number(energy.toFixed(2)),
    });
  }

  return data;
}

function getChartSubtitle(selectedNode: MoodNode | null): string {
  if (!selectedNode) return 'Selecione um estado para simular';

  return `${selectedNode.label} • X=${selectedNode.position.x.toFixed(1)} • Y=${selectedNode.position.y.toFixed(1)} • Z=${selectedNode.position.z.toFixed(1)}`;
}

const MoodTimeline: React.FC<MoodTimelineProps> = ({ selectedNode }) => {
  const data = useMemo(() => buildNodeSeries(selectedNode), [selectedNode]);
  const lineColor = selectedNode ? selectedNode.color : '#94a3b8';
  const subtitle = getChartSubtitle(selectedNode);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="mb-2 flex items-center justify-between px-2">
        <h3 className="text-sm font-semibold text-slate-600">
          Monitoramento Dimensional (14 Dias)
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-slate-400">
          {subtitle}
        </span>
      </div>

      <div className="min-h-[190px] flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />

            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              tick={{ fontSize: 10, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 10, fill: '#64748b' }}
              domain={[-4.5, 4.5]}
              ticks={[-4, -2, 0, 2, 4]}
              axisLine={false}
              tickLine={false}
              width={28}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                color: '#334155',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{ fontSize: '12px' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
              formatter={(value: number | string, name: string) => {
                const numeric = Number(value);
                return [
                  Number.isFinite(numeric) ? numeric.toFixed(2) : value,
                  name === 'moodLevel' ? 'Humor (Valência)' : 'Energia (Ativação)',
                ];
              }}
            />

            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
            <ReferenceLine y={2} stroke="#f59e0b" strokeDasharray="3 5" opacity={0.35} />
            <ReferenceLine y={-2} stroke="#3b82f6" strokeDasharray="3 5" opacity={0.35} />

            <Line
              type="monotone"
              dataKey="moodLevel"
              name="Humor (Valência)"
              stroke={lineColor}
              strokeWidth={2.6}
              dot={{ r: 3.1, fill: lineColor, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={600}
            />

            <Line
              type="monotone"
              dataKey="energyLevel"
              name="Energia (Ativação)"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              animationDuration={600}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 px-2 text-[10px] text-slate-400">
        Escala bipolar centrada em 0. X = humor/valência, Y = energia/ativação, Z = estabilidade/volatilidade.
      </div>
    </div>
  );
};

export default MoodTimeline;