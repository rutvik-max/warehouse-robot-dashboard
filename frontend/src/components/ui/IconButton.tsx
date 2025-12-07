// frontend/src/components/ui/IconButton.tsx
import React from "react";
import clsx from "clsx";

export default function IconButton({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button onClick={onClick} title={title} className={clsx("p-2 rounded-md hover:bg-slate-100")}>
      {children}
    </button>
  );
}
