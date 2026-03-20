import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
} from '@tanstack/react-router';
import { Brain, Info } from 'lucide-react';
import MoodSpace3D from '@c/MoodSpace3D';
import App from '@/App';

// --- Layout Component ---
const RootComponent = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-slate-950 text-white">
      {/* 3D Background Layer - Persistent across routes */}
      <div className="absolute inset-0 z-0">
        <MoodSpace3D />
      </div>

      {/* Foreground UI Layer */}
      <div className="relative z-10 flex h-full w-full flex-col pointer-events-none">
        {/* Top Header */}
        <header className="pointer-events-auto flex h-16 w-full items-center justify-between border-b border-white/10 bg-slate-950/40 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-3 shadow-lg shadow-indigo-500/20">
              <Brain className="h-5 w-5 text-white" />
            </div>

            <div className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-wide text-white">
                NeuroVisio 3D
              </span>
              <span className="text-[11px] text-slate-400">
                Mapa fenomenológico do humor
              </span>
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
            title="Informações"
          >
            <Info className="h-5 w-5" />
          </button>
        </header>

        {/* Main Content / Outlet Area */}
        <main className="relative flex-1 pointer-events-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// --- Route Definitions ---
const rootRoute = createRootRoute({
  component: RootComponent,
});

const moodDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'mood/$moodId',
  component: () => {
    return <App />; // Fallback to App for now
  },
});

// --- Router Creation ---
const routeTree = rootRoute.addChildren([ moodDetailRoute]);

export const router = createRouter({ routeTree } as any);
