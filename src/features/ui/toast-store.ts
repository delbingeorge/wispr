import { create } from "zustand";

export type ToastVariant = "ok" | "err";

export type Toast = {
  id: string;
  variant: ToastVariant;
  message: string;
  detail?: string;
  sticky?: boolean;
};

type ToastState = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
};

let counter = 0;
const nextId = () => `t-${Date.now()}-${counter++}`;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (t) => {
    const id = nextId();
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    return id;
  },
  dismiss: (id) =>
    set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

export const toast = {
  ok: (message: string, detail?: string) =>
    useToastStore.getState().push({ variant: "ok", message, detail }),
  err: (message: string, detail?: string, sticky = true) =>
    useToastStore
      .getState()
      .push({ variant: "err", message, detail, sticky }),
};
