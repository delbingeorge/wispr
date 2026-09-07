import { useEffect, useState } from "react";
import { useMediaImport } from "./use-media-import";
import { Plus } from "@/assets/icons";
import styles from "./styles/global-drop-zone.module.css";

export function GlobalDropZone() {
  const { importFiles } = useMediaImport();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dragDepth = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      if (!e.dataTransfer?.types.includes("Files")) return;
      dragDepth += 1;
      if (dragDepth === 1) setVisible(true);
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragDepth -= 1;
      if (dragDepth <= 0) {
        dragDepth = 0;
        setVisible(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragDepth = 0;
      setVisible(false);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        void importFiles(files);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, [importFiles]);

  if (!visible) return null;

  return (
    <div className={styles.overlay} aria-hidden="true">
      <div className={styles.card}>
        <span className={styles.icon}>
          <Plus />
        </span>
        <b className={styles.title}>Drop media to import</b>
        <span className={styles.sub}>
          MP4, MOV, PNG, JPG, WAV, stored on this device
        </span>
      </div>
    </div>
  );
}
