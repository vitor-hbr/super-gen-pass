"use client";

import { useEffect, useState, type ReactNode } from "react";

type ToastType = "default" | "success" | "error";
type ToastOptions = {
  icon?: ReactNode;
  iconTheme?: {
    primary: string;
    secondary: string;
  };
};
type ToastEntry = {
  id: string;
  message: string;
  type: ToastType;
  icon?: ReactNode;
};

type ToastListener = (toasts: ToastEntry[]) => void;

let toasts: ToastEntry[] = [];
const listeners = new Set<ToastListener>();

const emit = () => {
  listeners.forEach((listener) => listener(toasts));
};

const removeToast = (id: string) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  emit();
};

const createToast = (
  message: string,
  options: ToastOptions = {},
  type: ToastType = "default",
) => {
  const id = crypto.randomUUID();
  const nextToast = { id, message, type, icon: options.icon };

  toasts = [...toasts, nextToast].slice(-4);
  emit();
  setTimeout(() => removeToast(id), 3000);

  return id;
};

export const toast = Object.assign(
  (message: string, options?: ToastOptions) =>
    createToast(message, options, "default"),
  {
    success: (message: string, options?: ToastOptions) =>
      createToast(message, options, "success"),
    error: (message: string, options?: ToastOptions) =>
      createToast(message, options, "error"),
  },
);

const subscribe = (listener: ToastListener) => {
  listeners.add(listener);
  listener(toasts);

  return () => {
    listeners.delete(listener);
  };
};

const defaultIconByType: Record<ToastType, string> = {
  default: "",
  success: "✓",
  error: "!",
};

const classByType: Record<ToastType, string> = {
  default: "border-violet-500/40 bg-[#1a1025]/95 text-white",
  success: "border-green-500/40 bg-[#10251a]/95 text-white",
  error: "border-red-500/40 bg-[#25101a]/95 text-white",
};

export const Toaster = () => {
  const [visibleToasts, setVisibleToasts] = useState<ToastEntry[]>(toasts);

  useEffect(() => subscribe(setVisibleToasts), []);

  return (
    <div className="fixed top-4 right-4 z-50 flex w-[min(calc(100vw-2rem),24rem)] flex-col gap-3 pointer-events-none">
      {visibleToasts.map(({ id, message, type, icon }) => {
        const fallbackIcon = defaultIconByType[type];

        return (
          <div
            key={id}
            className={`animate-fade-in flex items-center gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl shadow-black/30 backdrop-blur ${classByType[type]}`}
            role="status"
          >
            {(icon || fallbackIcon) && (
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-violet-600 text-xs font-bold text-white">
                {icon || fallbackIcon}
              </span>
            )}
            <span>{message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default toast;
