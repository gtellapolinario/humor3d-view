import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Brain, Sparkles, XCircle, SunMedium } from 'lucide-react';
import MoodSpace3D from '@c/MoodSpace3D';
import MoodTimeline from '@c/MoodTimeline';
import {
  DEFAULT_MOOD_ID,
  MOOD_NODES,
  MOOD_PANEL_CONTENT,
} from '@u/constants';
import { MoodNode } from '@u/types';

const DEFAULT_NODE =
  MOOD_NODES.find((node) => node.id === DEFAULT_MOOD_ID) ?? MOOD_NODES[0];

if (!DEFAULT_NODE) {
  throw new Error('MOOD_NODES não pode estar vazio.');
}

function getTimeLabel(elevation: number): string {
  if (elevation < 0.1) return 'Noite';
  if (elevation < 0.3) return 'Amanhecer';
  if (elevation < 0.48) return 'Dia';
  if (elevation < 0.52) return 'Pôr do Sol';
  return 'Dia Claro';
}

const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<MoodNode | null>(DEFAULT_NODE);
  const [panelNode, setPanelNode] = useState<MoodNode>(DEFAULT_NODE);

  const initialElevation =
    MOOD_PANEL_CONTENT[DEFAULT_NODE.id]?.elevation ?? 0.49;

  const [elevation, setElevation] = useState<number>(initialElevation);

  const panelContent = useMemo(() => {
    return (
      MOOD_PANEL_CONTENT[panelNode.id] ?? {
        insight: panelNode.description,
        elevation: 0.49,
      }
    );
  }, [panelNode]);

  useEffect(() => {
    setElevation(panelContent.elevation);
  }, [panelContent.elevation]);

  const handleSelectNode = (node: MoodNode | null) => {
    if (!node) {
      setSelectedNode(null);
      return;
    }

    setSelectedNode(node);
    setPanelNode(node);
  };

  const handleResetPanel = () => {
    const fallback =
      MOOD_NODES.find((node) => node.id === DEFAULT_MOOD_ID) ?? MOOD_NODES[0];

    if (!fallback) return;

    setSelectedNode(fallback);
    setPanelNode(fallback);
    setElevation(MOOD_PANEL_CONTENT[fallback.id]?.elevation ?? 0.49);
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-emerald-500';
    if (risk < 60) return 'bg-yellow-500';
    if (risk < 85) return 'bg-orange-500';
    return 'bg-red-600';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-stone-200 font-sans text-slate-800">
      {/* Main Content Area (3D View) */}
      <div className="relative flex h-full flex-1">
        {/* Top Control Bar */}
        <div className="pointer-events-auto absolute top-4 left-4 z-20 flex items-center gap-4 rounded-2xl border border-white/40 bg-white/70 px-4 py-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2 shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-800">
                NeuroVisio 3D
              </span>
              <span className="text-[11px] text-slate-500">
                Iluminação sincronizada ao estado clínico
              </span>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-300/70" />

          <div className="min-w-[260px]">
            <div className="mb-1 flex items-center gap-2">
              <SunMedium className="h-4 w-4 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Hora do dia
              </span>
              <span className="ml-auto text-xs font-medium text-slate-500">
                {getTimeLabel(elevation)}
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(elevation * 100)}
              onChange={(e) => setElevation(Number(e.target.value) / 100)}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="z-0 h-full w-full flex-1">
          <MoodSpace3D
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id ?? null}
            elevation={elevation}
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="z-20 flex h-full w-[440px] flex-col border-l border-slate-200 bg-slate-200/80 shadow-2xl backdrop-blur-xl transition-all duration-300">
        {/* Top Section: Details */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span
                className="rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: panelNode.color,
                  color: panelNode.color,
                }}
              >
                {panelNode.category}
              </span>

              <button
                onClick={handleResetPanel}
                className="text-slate-400 transition-colors hover:text-slate-700"
                title="Voltar para o estado padrão"
              >
                <XCircle size={20} />
              </button>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-slate-800">
              {panelNode.label}
            </h2>

            <p
              className="mb-6 border-l-4 pl-4 text-sm leading-relaxed text-slate-600"
              style={{ borderColor: panelNode.color }}
            >
              {panelNode.description}
            </p>

            {/* Static Clinical Insight Card */}
            <div className="group relative mb-6 overflow-hidden rounded-xl border border-indigo-100 bg-white p-4 shadow-xl">
              <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-600" />

              <div className="mb-3 flex items-center gap-2 text-indigo-600">
                <Sparkles className="h-4 w-4" />
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  Análise Clínica
                </h3>
              </div>

              <p className="text-xs leading-relaxed italic text-slate-600">
                "{panelContent.insight}"
              </p>
            </div>

            {/* Technical Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-end justify-between">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    Risco Clínico
                  </p>
                  <span className="text-[10px] font-mono font-bold text-slate-700">
                    {panelNode.clinicalRisk}%
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full transition-all duration-700 ease-out ${getRiskColor(panelNode.clinicalRisk)}`}
                    style={{ width: `${panelNode.clinicalRisk}%` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-1 flex items-end justify-between">
                  <p className="text-[10px] font-semibold uppercase text-slate-500">
                    Neuroplasticidade
                  </p>
                  <span className="text-[10px] font-mono font-bold text-slate-700">
                    {panelNode.neuroplasticity}%
                  </span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-blue-500 transition-all duration-700 ease-out"
                    style={{ width: `${panelNode.neuroplasticity}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Chart */}
        <div className="h-[40%] border-t border-slate-200 bg-white/50 p-4 backdrop-blur-sm">
          <div className="mb-2 flex items-center gap-2">
            <Activity size={14} className="text-indigo-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Monitoramento de Humor
            </span>
          </div>

          <MoodTimeline selectedNode={panelNode} />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-100 p-3 text-center text-[10px] text-slate-500">
          Dados baseados no modelo PAD (Pleasure, Arousal, Dominance) adaptado para psicopatologia.
        </div>
      </aside>
    </div>
  );
};

export default App;