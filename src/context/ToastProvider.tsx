"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { FiCheckCircle, FiInfo, FiX, FiXCircle } from "react-icons/fi";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextValue = {
  toast: (
    type: ToastType,
    title: string,
    message?: string
  ) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toastStyles: Record<ToastType, { icon: ReactNode; ring: string }> = {
  success: {
    icon: <FiCheckCircle className="h-5 w-5 text-success" aria-hidden />,
    ring: "border-success/30",
  },
  error: {
    icon: <FiXCircle className="h-5 w-5 text-destructive" aria-hidden />,
    ring: "border-destructive/30",
  },
  info: {
    icon: <FiInfo className="h-5 w-5 text-info" aria-hidden />,
    ring: "border-info/30",
  },
  warning: {
    icon: <FiInfo className="h-5 w-5 text-warning" aria-hidden />,
    ring: "border-warning/30",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, NodeJS.Timeout>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-3), { id, type, title, message }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, message?: string) => toast("success", title, message),
    [toast]
  );
  const error = useCallback(
    (title: string, message?: string) => toast("error", title, message),
    [toast]
  );
  const info = useCallback(
    (title: string, message?: string) => toast("info", title, message),
    [toast]
  );
  const warning = useCallback(
    (title: string, message?: string) => toast("warning", title, message),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-3"
      >
        {toasts.map((t) => {
          const style = toastStyles[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto animate-toast-in flex items-start gap-3 rounded-xl border bg-card p-4 shadow-lg ${style.ring}`}
            >
              <div className="mt-0.5 shrink-0">{style.icon}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-card-foreground">
                  {t.title}
                </p>
                {t.message && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FiX className="h-4 w-4" aria-hidden />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
