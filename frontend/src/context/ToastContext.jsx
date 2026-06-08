import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";

const ToastContext = createContext(null);

const styles = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-100",
  },
  error: {
    icon: XCircle,
    className: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/15 dark:text-rose-100",
  },
  warning: {
    icon: AlertCircle,
    className: "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-100",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-100",
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast) => {
    const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
    const nextToast = {
      id,
      type: toast.type || "info",
      title: toast.title || titleFor(toast.type),
      message: toast.message || "",
      duration: toast.duration ?? 3500,
    };
    setToasts((current) => [nextToast, ...current].slice(0, 5));
    if (nextToast.duration > 0) {
      window.setTimeout(() => removeToast(id), nextToast.duration);
    }
    return id;
  }, [removeToast]);

  const value = useMemo(() => ({
    toast: showToast,
    success: (message, title = "Success") => showToast({ type: "success", title, message }),
    error: (message, title = "Something went wrong") => showToast({ type: "error", title, message, duration: 5000 }),
    warning: (message, title = "Warning") => showToast({ type: "warning", title, message }),
    info: (message, title = "Info") => showToast({ type: "info", title, message }),
    removeToast,
  }), [showToast, removeToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }
  return context;
}

function ToastViewport({ toasts, onClose }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-5 sm:top-5">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => <ToastItem key={toast.id} toast={toast} onClose={onClose} />)}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  const config = styles[toast.type] || styles.info;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 28, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 28, scale: 0.96 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`pointer-events-auto flex gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur ${config.className}`}
      role="status"
      aria-live="polite"
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black">{toast.title}</p>
        {toast.message && <p className="mt-1 text-sm font-bold opacity-85">{toast.message}</p>}
      </div>
      <button onClick={() => onClose(toast.id)} className="shrink-0 rounded-lg p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10" aria-label="Close notification">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

function titleFor(type) {
  if (type === "success") return "Success";
  if (type === "error") return "Something went wrong";
  if (type === "warning") return "Warning";
  return "Info";
}
