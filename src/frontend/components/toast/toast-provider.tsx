"use client";

/**
 * Toast System — built on @radix-ui/react-toast
 *
 * Provides a `ToastProvider` (wraps the app) and a `useToast()` hook
 * that any component can call to push a toast notification.
 *
 * An event-bus is also exposed (`toastEmitter`) so non-React code
 * (like `withApiHandler`) can trigger toasts without needing a hook.
 */

import "./toast.css";

import * as ToastPrimitive from "@radix-ui/react-toast";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastPayload {
  type: ToastVariant;
  message: string;
  /** Duration in ms. Defaults to 4000. */
  duration?: number;
}

interface ToastEntry extends ToastPayload {
  id: string;
  open: boolean;
}

interface ToastContextValue {
  showToast: (payload: ToastPayload) => void;
}

/* ------------------------------------------------------------------ */
/*  Event bus — for calling from outside React                         */
/* ------------------------------------------------------------------ */

type Listener = (payload: ToastPayload) => void;

class ToastEmitter {
  private listeners: Listener[] = [];

  subscribe(fn: Listener) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  emit(payload: ToastPayload) {
    this.listeners.forEach((fn) => fn(payload));
  }
}

/** Singleton emitter — import this where you need toasts outside React. */
export const toastEmitter = new ToastEmitter();

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Icons per variant                                                  */
/* ------------------------------------------------------------------ */

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  success: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
      <path d="M6 10.5L8.5 13L14 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
      <path d="M7 7L13 13M13 7L7 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
      <path d="M10 6V11M10 13.5V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.15" />
      <path d="M10 9V14M10 6.5V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/*  Provider component                                                 */
/* ------------------------------------------------------------------ */

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const showToast = useCallback((payload: ToastPayload) => {
    const id = `toast-${++idCounter}`;
    setToasts((prev) => [...prev, { ...payload, id, open: true }]);
  }, []);

  // Subscribe to event-bus so non-React code can trigger toasts
  React.useEffect(() => {
    const unsub = toastEmitter.subscribe(showToast);
    return unsub;
  }, [showToast]);

  const handleOpenChange = useCallback((id: string, open: boolean) => {
    if (!open) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const ctxValue = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={ctxValue}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            className={`toast-root toast-${toast.type}`}
            open={toast.open}
            duration={toast.duration ?? 4000}
            onOpenChange={(open) => handleOpenChange(toast.id, open)}
          >
            <div className="toast-icon">{variantIcons[toast.type]}</div>
            <ToastPrimitive.Description className="toast-message">
              {toast.message}
            </ToastPrimitive.Description>
            <ToastPrimitive.Close className="toast-close" aria-label="Close">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport className="toast-viewport" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}
