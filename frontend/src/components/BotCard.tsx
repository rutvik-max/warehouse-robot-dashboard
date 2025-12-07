// frontend/src/components/BotCard.tsx
import React, { useEffect, useRef, useState } from "react";
import type { Bot } from "../api/serverApi";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

/**
 * Vibrant, interactive BotCard (final)
 * - Uses CSS variables for palettes:
 *   header gradient: linear-gradient(90deg, var(--primary-from), var(--primary-to))
 *   battery fill: var(--battery-gradient)
 *   sparkline stroke: var(--sparkline-stroke)
 * - Hover lift + shadow, click-to-expand details
 * - Keeps core bot fields & logic unchanged
 */

function timeAgo(ts?: number) {
  if (!ts) return "n/a";
  const d = Date.now() - ts;
  if (d < 5000) return "just now";
  if (d < 60000) return `${Math.floor(d / 1000)}s ago`;
  if (d < 3600000) return `${Math.floor(d / 60000)}m ago`;
  return `${Math.floor(d / 3600000)}h ago`;
}

export default function BotCard({ bot }: { bot: Bot }) {
  const historyRef = useRef<number[]>([]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const arr = historyRef.current;
    arr.push(Number(bot.battery ?? 0));
    if (arr.length > 36) arr.shift();
  }, [bot.battery]);

  const values = historyRef.current.length ? historyRef.current : [Number(bot.battery ?? 0)];

  // Sparkline (simplified to use CSS var for stroke)
  const SparklineSVG = (() => {
    if (!values || values.length < 2) {
      return (
        <div className="h-7 w-full flex items-center justify-center text-xs text-slate-400">
          no history
        </div>
      );
    }
    const w = 220;
    const h = 48;
    const pad = 6;
    const max = 100;
    const step = (w - pad * 2) / Math.max(1, values.length - 1);
    const points = values
      .map((v, i) => {
        const x = pad + i * step;
        const y = pad + (1 - v / max) * (h - pad * 2);
        return `${x},${y}`;
      })
      .join(" ");
    const id = `g-${bot.id}`;

    return (
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="rounded-lg">
        <defs>
          {/* subtle blur for depth (kept simple) */}
          <filter id={`blur-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Optional subtle area fill using a translucent rectangle (keeps things simple and palette-driven) */}
        <rect x="0" y={h - 6} width={w} height={6} fill="rgba(0,0,0,0.03)" />

        <polyline
          fill="none"
          stroke="var(--sparkline-stroke)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  })();

  // status pill (keeps strong readable colors though palettes define the accent)
  const statusClass = {
    idle: "bg-white/8 text-white/90",
    busy: "bg-indigo-600 text-white",
    charging: "bg-amber-500 text-white",
    error: "bg-red-500 text-white",
  }[bot.status] ?? "bg-slate-600 text-white";

  // Use CSS variables for header gradient (palette controls these variables)
  const headerStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, var(--primary-from, #8b5cf6), var(--primary-to, #4f46e5))`,
  };

  return (
    <motion.article
      layout
      onClick={() => setExpanded((s) => !s)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4, boxShadow: "0 12px 30px rgba(16,24,40,0.18)" }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      className="cursor-pointer select-none"
    >
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ borderRadius: 14 }}>
        {/* Header with palette-driven gradient */}
        <div className={clsx("px-4 py-3 flex items-center justify-between gap-3")} style={headerStyle}>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {bot.name.split("-")[1] ?? bot.name}
            </div>
            <div>
              <div className="text-white font-semibold leading-none">{bot.name}</div>
              <div className="text-white/80 text-xs">{bot.id}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className={clsx("text-xs px-3 py-1 rounded-full font-medium", statusClass)}>{bot.status}</div>
            <div className="text-white/80 text-right">
              <div className="text-xs">Speed</div>
              <div className="text-sm font-semibold">{(bot.speed ?? 0).toFixed(2)} u/s</div>
            </div>
          </div>
        </div>

        {/* Body - glass content area (uses default / dark styles via your CSS) */}
        <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-sm p-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-300">Current Task</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                  {bot.currentTask ?? "none"}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-300">Last updated</div>
                <div className="text-sm font-medium text-slate-900 dark:text-white mt-1">{timeAgo(bot.lastUpdated)}</div>
              </div>
            </div>

            {/* Battery bar (uses CSS battery gradient variable) */}
            <div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-300">Battery</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{bot.battery}%</div>
              </div>

              <div className="mt-2 w-full h-3 rounded-full bg-slate-200/60 dark:bg-slate-700 overflow-hidden">
                <motion.div
                  style={{
                    width: `${Math.max(0, Math.min(100, bot.battery ?? 0))}%`,
                    background: "var(--battery-gradient)",
                    height: "100%",
                  }}
                  animate={{ width: `${Math.max(0, Math.min(100, bot.battery ?? 0))}%` }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>

            {/* Sparkline area */}
            <div className="pt-1">
              <div className="text-xs text-slate-500 dark:text-slate-300 mb-1">Trend</div>
              <div className="w-full h-12">{SparklineSVG}</div>
            </div>
          </div>

          {/* Expanded details */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28 }}
                className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-slate-700 dark:text-slate-200 text-sm font-medium">Details</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">more runtime info</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(JSON.stringify(bot)).catch(() => {}); }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-600 text-white text-sm"
                    >
                      <Sparkles className="w-4 h-4" /> Copy JSON
                    </button>
                  </div>
                </div>

                <pre className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 text-xs rounded text-slate-700 dark:text-slate-200 overflow-auto">
{JSON.stringify(
  {
    id: bot.id,
    name: bot.name,
    status: bot.status,
    speed: bot.speed,
    battery: bot.battery,
    currentTask: bot.currentTask,
    lastUpdated: bot.lastUpdated,
    x: bot.x, y: bot.y,
  },
  null,
  2
)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
}
