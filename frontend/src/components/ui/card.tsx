//Card
import React from "react";
import clsx from "clsx";

export default function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4", "theme-fade card-soft", className)}>
      {children}
    </div>
  );
}
