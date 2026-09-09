import { useEffect } from "react";
import { useToastStore, type ToastVariant } from "./toast-store";
import styles from "./styles/toast.module.css";

const DISMISS_MS: Record<ToastVariant, number> = {
  ok: 4000,
  err: 8000,
};

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timers = toasts.map((t) =>
      window.setTimeout(() => dismiss(t.id), DISMISS_MS[t.variant]),
    );
    return () => timers.forEach((id) => window.clearTimeout(id));
  }, [toasts, dismiss]);

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${styles.toast} ${t.variant === "ok" ? styles.ok : styles.err}`}
          role={t.variant === "err" ? "alert" : "status"}
          onClick={() => dismiss(t.id)}
        >
          <span className={styles.message}>
            {t.message}
            {t.detail ? (
              <span className={styles.detail}> · {t.detail}</span>
            ) : null}
          </span>
        </div>
      ))}
    </div>
  );
}
