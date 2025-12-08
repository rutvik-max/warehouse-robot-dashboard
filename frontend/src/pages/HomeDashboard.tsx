// homeDashboard code
import { useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/card";
import BotCard from "../components/BotCard";
import { useDataStore } from "../state/useDataStore";
import { motion } from "framer-motion";

function timeAgo(ts?: number) {
  if (!ts) return "n/a";
  const d = Date.now() - ts;
  if (d < 5000) return "just now";
  if (d < 60000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

export default function HomeDashboard() {
  const bots = useDataStore((s) => s.bots);
  const totalBots = useDataStore((s) => s.totalBots);
  const botsInError = useDataStore((s) => s.botsInError);
  const idleBots = useDataStore((s) => s.idleBots);
  const activeTasksCount = useDataStore((s) => s.activeTasksCount);
  const pendingTasks = useDataStore((s) => s.pendingTasks);
  const refresh = useDataStore((s) => s.refresh);
  const addTask = useDataStore((s: any) => s.addTask); // optional
  const setSimInterval = useDataStore((s: any) => s.setSimInterval); // optional
  const loading = useDataStore((s) => s.loading);

  useEffect(() => {
    void refresh();
    
  }, []);

  const miniBots = Array.isArray(bots) ? bots.slice(0, 6) : [];

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Total Bots" value={loading ? "..." : totalBots} tone="neutral" />
          <StatCard title="Active Tasks" value={loading ? "..." : activeTasksCount} tone="accent" />
          <StatCard title="Idle Bots" value={loading ? "..." : idleBots} />
          <StatCard title="Bots in Error" value={loading ? "..." : botsInError} tone="danger" />
          <StatCard title="Pending Tasks" value={loading ? "..." : pendingTasks} tone="positive" />
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <Card className="lg:col-span-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold">Recent activity</h3>
                <p className="text-sm text-slate-400 mt-2">This demo uses a simulated backend. Activities from bots and tasks appear here.</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => void refresh()}
                  className="px-3 py-1 rounded-md bg-gradient-to-r from-indigo-600 to-indigo-500 text-white"
                >
                  Refresh
                </button>

                <button
                  onClick={() => {
                    try {
                      addTask?.({
                        type: "pickup",
                        priority: "medium",
                        from: "zone-A",
                        to: "zone-B",
                        comments: "quick-create",
                      });
                    } catch {}
                    void refresh();
                  }}
                  className="px-3 py-1 rounded-md border"
                >
                  Quick Task
                </button>

                <div className="hidden sm:block text-sm text-slate-400">Status: <span className="ml-2 text-emerald-400">Live</span></div>
              </div>
            </div>

            {/* Activity area: show a few lines summarizing bots */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {miniBots.length === 0 ? (
                <div className="text-sm text-slate-500">No bot data yet.</div>
              ) : (
                miniBots.map((b: any) => (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-md bg-slate-50/60 dark:bg-slate-900/60">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-r from-indigo-600 to-indigo-400 text-white font-bold">
                      {String(b.name).split("-")[1] ?? b.name}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-slate-900 dark:text-slate-100">{b.name}</div>
                        <div className="text-xs text-slate-400">{b.battery}%</div>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{b.currentTask ?? "idle"} • {b.status}</div>
                      <div className="text-xs text-slate-400 mt-1">Last: {new Date(b.lastUpdated || Date.now()).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* RIGHT: Quick actions + analytics snapshot */}
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Quick actions</h3>
                <p className="text-sm text-slate-400 mt-1">Controls to speed up simulation, add tasks, or export state.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    try {
                      setSimInterval?.(2000);
                    } catch {}
                  }}
                  className="flex-1 px-3 py-2 rounded-md bg-gradient-to-r from-emerald-600 to-emerald-500 text-white"
                >
                  Speed up simulation
                </button>
                <button
                  onClick={() => {
                    try {
                      setSimInterval?.(10000);
                    } catch {}
                  }}
                  className="px-3 py-2 rounded-md border"
                >
                  Normal speed
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    try {
                      addTask?.({
                        type: "move",
                        priority: "high",
                        from: "dock",
                        to: "station-3",
                        comments: "admin-inject",
                      });
                    } catch {}
                    void refresh();
                  }}
                  className="w-full px-3 py-2 rounded-md bg-gradient-to-r from-purple-600 to-indigo-500 text-white"
                >
                  Inject urgent task
                </button>
              </div>

              <div className="mt-2">
                <h4 className="text-sm font-medium">Analytics snapshot</h4>
                <div className="mt-2 text-xs text-slate-400">
                  Bots: <span className="font-semibold">{totalBots}</span> • Errors: <span className="font-semibold text-rose-400">{botsInError}</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="p-2 rounded-md bg-slate-50/40 dark:bg-slate-800/40 text-center">
                    <div className="text-xs text-slate-400">Utilization</div>
                    <div className="font-semibold mt-1">72%</div>
                  </div>
                  <div className="p-2 rounded-md bg-slate-50/40 dark:bg-slate-800/40 text-center">
                    <div className="text-xs text-slate-400">Avg Speed</div>
                    <div className="font-semibold mt-1">0.92 u/s</div>
                  </div>
                  <div className="p-2 rounded-md bg-slate-50/40 dark:bg-slate-800/40 text-center">
                    <div className="text-xs text-slate-400">Avg Battery</div>
                    <div className="font-semibold mt-1">{Math.round((bots || []).reduce((s: number, x: any) => s + (x.battery ?? 0), 0) / Math.max(1, (bots || []).length))}%</div>
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-400">
                <button
                  onClick={() => {
                    const state = { bots, time: Date.now() };
                    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `state-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="text-sm underline"
                >
                  Export state
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom full width grid: Bots gallery + Analytics big card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bots gallery (big grid) */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Fleet preview</h3>
              <div className="text-sm text-slate-400">{(bots || []).length} bots</div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {(bots || []).map((b: any) => (
                <div key={b.id} className="transform hover:-translate-y-1 transition">
                  <BotCard bot={b} />
                </div>
              ))}
            </div>
          </Card>

          {/* Right-side analytics / timeline */}
          <Card>
            <h3 className="text-lg font-semibold">Operations timeline</h3>
            <div className="mt-3 text-sm text-slate-500">Recent events and alerts. Click a bot card to view more details.</div>

            <div className="mt-4 space-y-3 max-h-96 overflow-auto">
              {(bots || []).slice(0, 8).map((b: any) => (
                <div key={b.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-slate-50/40 dark:hover:bg-slate-800/40">
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-400 text-white flex items-center justify-center">{String(b.name).split("-")[1] ?? b.name}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{b.name} — {b.currentTask ?? "idle"}</div>
                      <div className="text-xs text-slate-400">{timeAgo(b.lastUpdated)}</div>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{b.status} • {b.battery}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </motion.div>
    </MainLayout>
  );
}
