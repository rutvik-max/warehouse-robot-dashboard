import React from "react";
import clsx from "clsx";

export default function StatCard({ title, value, delta, tone = "neutral" }: { title: string; value: React.ReactNode; delta?: string; tone?: "neutral"|"positive"|"danger"|"accent" }) {
  const toneClass = {
    neutral: "bg-white dark:bg-slate-900",
    positive: "ring-1 ring-emerald-100 dark:ring-emerald-800",
    danger: "ring-1 ring-red-100 dark:ring-red-800",
    accent: "bg-gradient-to-br from-primary/90 to-accent/80 text-white",
  }[tone];

  return (
    <div className={clsx("rounded-lg p-4 shadow-sm border", "theme-fade", toneClass)}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500 dark:text-slate-400">{title}</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-50">{value}</div>
        </div>
        {delta && <div className="text-sm text-slate-400">{delta}</div>}
      </div>
    </div>
  );
}
