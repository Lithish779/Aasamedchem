"use client";
import { useState, createContext, useContext, useCallback, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type Toast = { id: string; message: string; type: "success" | "error" | "info" };
type ToastCtx = { toast: (msg: string, type?: Toast["type"]) => void };

const ToastContext = createContext<ToastCtx>({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

let addToastFn: ((msg: string, type?: Toast["type"]) => void) | null = null;
export const toast = (msg: string, type: Toast["type"] = "info") => addToastFn?.(msg, type);

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  useEffect(() => { addToastFn = addToast; return () => { addToastFn = null; }; }, [addToast]);

  const icons = { success: CheckCircle, error: AlertCircle, info: Info };
  const colors = {
    success: "border-brand-500/30 bg-brand-950",
    error: "border-red-500/30 bg-red-950/50",
    info: "border-blue-500/30 bg-blue-950/50",
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div key={t.id} className={`flex items-start gap-3 p-4 rounded-xl border shadow-2xl animate-slide-up ${colors[t.type]}`} style={{ borderColor: "var(--color-border)" }}>
            <Icon size={16} className={t.type === "success" ? "text-brand-400 mt-0.5" : t.type === "error" ? "text-red-400 mt-0.5" : "text-blue-400 mt-0.5"} />
            <p className="text-sm text-ink-200 flex-1">{t.message}</p>
            <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))} className="text-ink-500 hover:text-ink-300">
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
