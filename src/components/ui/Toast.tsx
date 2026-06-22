'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export type ToastVariant = 'success' | 'warning' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toast: (options: Omit<Toast, 'id'>) => void;
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ title, description, variant = 'success', duration = 3000 }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, variant, duration }]);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, dismiss }: { toasts: Toast[]; dismiss: (id: string) => void }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
      {toasts.map((item) => (
        <ToastItem key={item.id} item={item} onDismiss={dismiss} />
      ))}
    </div>
  );
};

const ToastItem = ({ item, onDismiss }: { item: Toast; onDismiss: (id: string) => void }) => {
  const { id, title, description, variant = 'success', duration = 3000 } = item;

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onDismiss]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
    info: <Info className="h-5 w-5 text-sky-500" />
  };

  const borders = {
    success: "border-emerald-100 dark:border-emerald-950",
    error: "border-rose-100 dark:border-rose-950",
    warning: "border-amber-100 dark:border-amber-950",
    info: "border-sky-100 dark:border-sky-950"
  };

  return (
    <div
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-lg animate-fade-in ${borders[variant]}`}
    >
      <div className="flex-shrink-0 mt-0.5">{icons[variant]}</div>
      <div className="flex-1 flex flex-col gap-0.5">
        <h4 className="text-sm font-semibold">{title}</h4>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <button
        onClick={() => onDismiss(id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
