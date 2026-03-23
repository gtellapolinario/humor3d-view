import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import type { MoodNode } from '@u/types';
import { useAnimatedPhase } from '../hooks/useAnimatedPhase';

// ─── Types ───────────────────────────────────────────────────────────

interface MoodTimelineProps {
  selectedNode: MoodNode | null;
}

interface TimelinePoint {
  day: string;
  moodLevel: number;
  energyLevel: number;
}

interface ResponsiveTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  visibleWidth: number;
}

// ─── Constants ───────────────────────────────────────────────────────

const DAYS = [
  'D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7',
  'D8', 'D9', 'D10', 'D11', 'D12', 'D13', 'D14',
];

// ─── Helpers ─────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Tick responsivo: filtra labels conforme a largura do container */
const ResponsiveTick: React.FC<ResponsiveTickProps> = ({
  x,
  y,
  payload,
  visibleWidth,
}) => {
  if (!payload || x == null || y == null) return null;

  const dayIndex = parseInt(payload.value.replace('D', ''), 10);
  const interval = visibleWidth < 360 ? 4 : visibleWidth < 540 ? 3 : visibleWidth < 720 ? 2 : 1;

  // Sempre mostra D1 e D14; intermediários conforme intervalo
  const isFirst = dayIndex === 1;
  const isLast = dayIndex === 14;
  const isOnInterval = (dayIndex - 1) % interval === 0;

  if (!isFirst && !isLast && !isOnInterval) return null;

  return (
    <text
      x={x}
      y={y + 12}
      textAnchor="middle"
      fontSize={visibleWidth < 400 ? 9 : 10}
      fill="#64748b"
    >
      {payload.value}
    </text>
  );
};

// ─── Wave Generator ──────────────────────────────────────────────────

function buildNodeSeries(
  selectedNode: MoodNode | null,
  phase: number
): TimelinePoint[] {
  if (!selectedNode) {
    return DAYS.map((day, index) => ({
      day,
      moodLevel: Math.sin(index * 0.55 + phase) * 0.8,
      energyLevel: Math.cos(index * 0.5 + phase * 0.92) * 0.8,
    }));
  }

  const baseMood = selectedNode.position.x;
  const baseEnergy = selectedNode.position.y;
  const stability = selectedNode.position.z;
  const instability = Math.abs(Math.min(0, stability));

  return DAYS.map((day, index) => {
    let mood = baseMood;
    let energy = baseEnergy;

    switch (selectedNode.id) {
      case 'euthymia': {
        mood =
          baseMood +
          Math.sin(index * 0.7 + phase) * 0.5 +
          Math.cos(index * 0.18 + phase * 0.8) * 0.2;

        energy =
          baseEnergy +
          Math.cos(index * 0.66 + phase * 0.96) * 0.6 +
          Math.sin(index * 0.16 + phase * 0.74) * 0.3;
        break;
      }

      case 'cyclothymia': {
        mood =
          baseMood +
          Math.sin(index * 0.95 + phase * 1.1) * 1.6 +
          Math.sin(index * 0.22 + phase * 0.6) * 0.6;

        energy =
          baseEnergy +
          Math.sin(index * 0.95 + 0.9 + phase * 1.1) * 1.4 +
          Math.cos(index * 0.25 + phase * 0.55) * 0.5;
        break;
      }

      case 'major-depression': {
        mood =
          baseMood +
          Math.sin(index * 0.45 + phase * 0.55) * 0.4 +
          Math.cos(index * 0.16 + phase * 0.32) * 0.2;

        energy =
          baseEnergy +
          Math.sin(index * 0.4 + 0.4 + phase * 0.5) * 0.3 +
          Math.cos(index * 0.12 + phase * 0.24) * 0.15;
        break;
      }

      case 'dysthymia': {
        mood =
          baseMood +
          Math.sin(index * 0.34 + phase * 0.42) * 0.4 +
          Math.cos(index * 0.14 + phase * 0.26) * 0.15;

        energy =
          baseEnergy +
          Math.sin(index * 0.3 + 0.6 + phase * 0.38) * 0.35 +
          Math.cos(index * 0.12 + phase * 0.22) * 0.1;
        break;
      }

      case 'hypomania': {
        mood =
          baseMood +
          Math.sin(index * 0.78 + phase) * 0.8 +
          Math.cos(index * 0.2 + phase * 0.45) * 0.3;

        energy =
          baseEnergy +
          Math.sin(index * 0.82 + 0.35 + phase * 1.02) * 0.9 +
          Math.cos(index * 0.18 + phase * 0.42) * 0.4;
        break;
      }

      case 'mania': {
        mood =
          baseMood +
          Math.sin(index * 1.0 + phase * 1.2) * 0.9 +    // era 1.2
          Math.cos(index * 0.28 + phase * 0.55) * 0.3 +   // era 0.4
          instability * 0.15 * Math.sin(phase * 1.25);     // era 0.2

        energy =
          baseEnergy +
          Math.sin(index * 1.05 + 0.4 + phase * 1.28) * 1.05 + // era 1.4
          Math.cos(index * 0.22 + phase * 0.6) * 0.4 +          // era 0.5
          instability * 0.18 * Math.cos(phase * 1.18);           // era 0.25
        break;
      }

      case 'mixed-state': {
        mood =
          baseMood +
          Math.sin(index * 1.02 + phase * 1.12) * 1.4 +
          Math.cos(index * 0.28 + phase * 0.48) * 0.5;

        energy =
          baseEnergy +
          Math.sin(index * 1.06 + 1.2 + phase * 1.15) * 1.6 +
          Math.cos(index * 0.24 + phase * 0.5) * 0.6;
        break;
      }

      case 'agitated-depression': {
        mood =
          baseMood +
          Math.sin(index * 0.72 + phase * 0.9) * 0.6 +
          Math.cos(index * 0.22 + phase * 0.34) * 0.2;

        energy =
          baseEnergy +
          Math.abs(Math.sin(index * 0.85 + phase * 1.1)) * 1.2 +
          Math.cos(index * 0.18 + phase * 0.3) * 0.3;
        break;
      }

      case 'catatonia': {
        mood =
          baseMood +
          Math.sin(index * 0.18 + phase * 0.14) * 0.15 +
          Math.cos(index * 0.08 + phase * 0.1) * 0.05;

        energy =
          baseEnergy +
          Math.sin(index * 0.16 + 0.2 + phase * 0.12) * 0.1 +
          Math.cos(index * 0.06 + phase * 0.08) * 0.05;
        break;
      }

      default: {
        mood = baseMood + Math.sin(index * 0.5 + phase * 0.7) * 0.6;
        energy = baseEnergy + Math.cos(index * 0.5 + phase * 0.7) * 0.6;
      }
    }

    mood = clamp(mood, -5.5, 5.5);
    energy = clamp(energy, -5.5, 5.5);

    return { day, moodLevel: mood, energyLevel: energy };
  });
}

// ─── Component ───────────────────────────────────────────────────────

const MoodTimeline: React.FC<MoodTimelineProps> = ({ selectedNode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  const phase = useAnimatedPhase({
    enabled: true,
    fps: 30,
    speed: 0.0015,
    initialPhase: 0,
  });

  const data = useMemo(
    () => buildNodeSeries(selectedNode, phase),
    [selectedNode, phase]
  );

  // ResizeObserver para largura real do container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const lineColor = selectedNode?.color ?? '#94a3b8';

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={containerRef} className="min-h-[160px] max-h-[300px] flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 4 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e2e8f0"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              tick={<ResponsiveTick visibleWidth={containerWidth} />}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              stroke="#94a3b8"
              tick={{ fontSize: 10, fill: '#64748b' }}
              domain={[-5.5, 5.5]}
              ticks={[-4, -3, -2, -1, 0, 1, 2, 3, 4]}
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
              formatter={(value: unknown, name: string) => {
                const numeric = Number(value);
                return [
                  Number.isFinite(numeric) ? numeric.toFixed(2) : String(value),
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
              isAnimationActive={false}
            />

            <Line
              type="monotone"
              dataKey="energyLevel"
              name="Energia (Ativação)"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MoodTimeline;