import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Brain, Sparkles, SunMedium, Moon } from 'lucide-react';
import MoodSpace3D from '@c/MoodSpace3D';
import MoodTimeline from '@c/MoodTimeline';
import {
  DEFAULT_MOOD_ID,
  MOOD_NODE_BY_ID,
  MOOD_NODES,
  MOOD_PANEL_CONTENT,
} from '@u/constants';
import { MoodNode } from '@u/types';

const DEFAULT_NODE = MOOD_NODE_BY_ID[DEFAULT_MOOD_ID] ?? MOOD_NODES[0];

if (!DEFAULT_NODE) {
  throw new Error('MOOD_NODES não pode estar vazio.');
}

type SidebarTab = 'analysis' | 'timeline';

const App: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<MoodNode | null>(DEFAULT_NODE);
  const [panelNode, setPanelNode] = useState<MoodNode>(DEFAULT_NODE);
  const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SidebarTab>('analysis');

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
    setSelectedNode(node);
    if (node) {
      setPanelNode(node);
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'bg-emerald-500';
    if (risk < 60) return 'bg-yellow-500';
    if (risk < 85) return 'bg-orange-500';
    return 'bg-red-600';
  };

  // ─── Shared sub-components (inline) ────────────────────────────────

  const AnalysisContent = (
    <>
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
      </div>

      <h2 className="mb-2 text-lg md:text-xl font-bold text-slate-800">
        {panelNode.label}
      </h2>

      <p
        className="mb-6 border-l-4 pl-4 text-sm leading-relaxed text-slate-600"
        style={{ borderColor: panelNode.color }}
      >
        {panelNode.description}
      </p>

      <div className="group relative mb-6 overflow-hidden rounded-xl border border-indigo-100 bg-white p-4 shadow-xl">
        <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-indigo-500 to-purple-600" />

        <div className="mb-3 flex items-center gap-2 text-indigo-600">
          <Sparkles className="h-4 w-4" />
          <h3 className="text-xs font-bold uppercase tracking-widest">
            Análise Clínica
          </h3>
        </div>

        <p className="text-xs leading-relaxed italic text-slate-600">
          &ldquo;{panelContent.insight}&rdquo;
        </p>
      </div>

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
    </>
  );

  const TimelineContent = (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center gap-2">
        <Activity size={14} className="text-indigo-600" />
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500">
          Monitoramento de Humor
        </span>
      </div>
      <div className="flex-1 min-h-0 min-w-0">
        <MoodTimeline selectedNode={panelNode} />
      </div>
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="flex h-[100dvh] w-screen flex-col md:flex-row overflow-hidden bg-stone-200 font-sans text-slate-800">
      {/* 3D Scene */}
      <div className="relative flex h-[45vh] md:h-full w-full md:flex-1 shrink-0">
        <div className="pointer-events-auto flex flex-col absolute top-2 left-2 right-2 md:right-auto md:top-4 md:left-4 z-20 items-center gap-2 md:gap-4 rounded-2xl border border-white/40 bg-white/60 px-3 py-2 md:px-4 md:py-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between w-full gap-2 md:gap-3">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden md:flex rounded-xl bg-indigo-600 p-1.5 md:p-2 shadow-lg shadow-indigo-500/20">
                <Brain className="h-4 w-4 md:h-5 md:w-5 text-white" />
              </div>
              <span className="text-xs md:text-sm font-semibold text-slate-800">
                GT-Medic - Estados de Humor
              </span>
              <SunMedium className="h-3 w-3 md:h-4 md:w-4 text-amber-500" />
              <Moon className="h-3 w-3 md:h-4 md:w-4 text-blue-500" />
            </div>
          </div>


        </div>

        <div className="z-0 h-full w-full flex-1">
          <MoodSpace3D
            onSelectNode={handleSelectNode}
            selectedNodeId={selectedNode?.id ?? null}
            elevation={elevation}
          />
        </div>
      </div>

      {/* ─── Sidebar ─────────────────────────────────────────────── */}
      <aside className="z-20 flex h-[55vh] md:h-full w-full md:w-[460px] shrink-0 flex-col border-t md:border-t-0 md:border-l border-slate-200 bg-slate-200/80 shadow-2xl backdrop-blur-xl">

        {/* ── Mobile Tabs ── */}
        <div className="flex md:hidden border-b border-slate-300 bg-white/60 backdrop-blur-sm shrink-0">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'analysis'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white/40'
                : 'text-slate-400'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Análise
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'timeline'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white/40'
                : 'text-slate-400'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            Monitoramento
          </button>
        </div>

        {/* ── Mobile: conteúdo da tab ativa ── */}
        <div className="flex-1 overflow-hidden md:hidden">
          {activeTab === 'analysis' && (
            <div className="h-full overflow-y-auto p-4 custom-scrollbar bg-slate-200/20">
              {AnalysisContent}
            </div>
          )}
          {activeTab === 'timeline' && (
            <div className="h-full p-3 bg-white/50">
              {TimelineContent}
            </div>
          )}
        </div>

        {/* ── Desktop: tudo visível ── */}
        <div className="hidden md:flex md:flex-col md:flex-1 md:overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-200/20">
            {AnalysisContent}
          </div>

          <div className="flex h-[340px] shrink-0 flex-col border-t border-slate-200 bg-white/50 p-4 backdrop-blur-sm">
            {TimelineContent}
          </div>

          <div className="border-t border-slate-200 bg-slate-100 p-3 text-center text-[10px] text-slate-500">
            Dados baseados no modelo PAD (Pleasure, Arousal, Dominance) adaptado para psicopatologia.
          </div>
        </div>
      </aside>
    </div>
  );
};

export default App;