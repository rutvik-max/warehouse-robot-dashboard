// frontend/src/components/Toast.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import clsx from "clsx";

type Toast = { id: string; title: string; description?: string; tone?: "info"|"success"|"error" };

const ToastContext = createContext<{ push: (t: Omit<Toast, "id">) => void; } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = String(Date.now() + Math.random());
    setToasts((s) => [{ id, ...t }, ...s]);
    setTimeout(() => {
      setToasts((s) => s.filter((x) => x.id !== id));
    }, 3800);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {t.tone === "success" ? <CheckCircle color="#10B981" /> : t.tone === "error" ? <XCircle color="#EF4444" /> : <CheckCircle color="#4F46E5" />}
                <div>
                  <div className="title">{t.title}</div>
                  {t.description && <div className="desc">{t.description}</div>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
