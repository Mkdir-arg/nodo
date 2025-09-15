'use client';

import clsx from 'clsx';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

type ToastIntent = 'default' | 'success' | 'error';

type ToastInput =
  | string
  | {
      title?: string;
      description?: string;
      intent?: ToastIntent;
      duration?: number;
    };

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  intent: ToastIntent;
  duration: number;
}

interface ToastContextValue {
  toast: (input: ToastInput) => void;
  success: (input: ToastInput) => void;
  error: (input: ToastInput) => void;
}

const DEFAULT_DURATION = 4000;
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, number>>(new Map());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
      timers.current.clear();
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const pushToast = useCallback(
    (input: ToastInput, fallbackIntent: ToastIntent) => {
      const payload =
        typeof input === 'string'
          ? { title: input }
          : input ?? { title: 'Notificación' };
      const id = generateId();
      const duration =
        typeof payload.duration === 'number' && payload.duration > 0
          ? payload.duration
          : DEFAULT_DURATION;
      const intent = payload.intent ?? fallbackIntent;
      const title =
        typeof payload.title === 'string' && payload.title.trim().length > 0
          ? payload.title
          : 'Notificación';

      setToasts((prev) => [
        ...prev,
        {
          id,
          title,
          description:
            typeof payload.description === 'string'
              ? payload.description
              : undefined,
          intent,
          duration,
        },
      ]);

      if (typeof window !== 'undefined') {
        const timeout = window.setTimeout(() => removeToast(id), duration);
        timers.current.set(id, timeout);
      }
    },
    [removeToast],
  );

  const toast = useCallback(
    (input: ToastInput) => {
      pushToast(input, 'default');
    },
    [pushToast],
  );

  const success = useCallback(
    (input: ToastInput) => {
      pushToast(input, 'success');
    },
    [pushToast],
  );

  const error = useCallback(
    (input: ToastInput) => {
      pushToast(input, 'error');
    },
    [pushToast],
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({ toast, success, error }),
    [toast, success, error],
  );

  const portalTarget = isMounted ? document.body : null;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {portalTarget
        ? createPortal(
            <div className="pointer-events-none fixed top-4 right-4 z-[100] flex w-[min(22rem,92vw)] flex-col gap-2">
              {toasts.map((toastItem) => (
                <div
                  key={toastItem.id}
                  className={clsx(
                    'pointer-events-auto rounded-lg border px-4 py-3 shadow-lg transition-colors',
                    toastItem.intent === 'success' &&
                      'border-emerald-500/30 bg-emerald-500 text-white',
                    toastItem.intent === 'error' &&
                      'border-red-500/30 bg-red-500 text-white',
                    toastItem.intent === 'default' &&
                      'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold leading-none">
                        {toastItem.title}
                      </p>
                      {toastItem.description ? (
                        <p className="text-sm opacity-90">
                          {toastItem.description}
                        </p>
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeToast(toastItem.id)}
                      className="text-sm font-semibold opacity-70 transition hover:opacity-100"
                      aria-label="Cerrar notificación"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>,
            portalTarget,
          )
        : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
