import { useEffect } from "react";
import { useToastStore } from "./toast-store";
import { Check, Warning, Close } from "@/assets/icons";
import styles from "./styles/toast.module.css";

const AUTO_DISMISS_MS = 4000;

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => {
    const timers = toasts
      .filter((t) => !t.sticky)
      .map((t) =>
        window.setTimeout(() => dismiss(t.id), AUTO_DISMISS_MS),
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
        >
          <span className={styles.icon}>
            {t.variant === "ok" ? <Check /> : <Warning />}
          </span>
          <span className={styles.message}>
            {t.message}
            {t.detail ? <span className={styles.detail}> · {t.detail}</span> : null}
          </span>
          <button
            className={styles.closeBtn}
            onClick={() => dismiss(t.id)}
            title="Dismiss"
          >
            <Close />
          </button>
        </div>
      ))}
    </div>
  );
}
