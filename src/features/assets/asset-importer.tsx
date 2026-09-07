import { useCallback, useRef, useState } from "react";
import { useMediaImport } from "./use-media-import";
import { Plus } from "@/assets/icons";
import styles from "./styles/asset-importer.module.css";

const ACCEPT = "video/*,image/*,audio/*";

export function AssetImporter() {
  const { importFiles, busy } = useMediaImport();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering] = useState(false);

  const handleClick = useCallback(() => {
    if (busy) return;
    fileInputRef.current?.click();
  }, [busy]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        void importFiles(files);
      }
      e.target.value = "";
    },
    [importFiles],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes("Files")) {
      setHovering(true);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (
      e.relatedTarget instanceof Node &&
      e.currentTarget.contains(e.relatedTarget)
    ) {
      return;
    }
    setHovering(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setHovering(false);
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        void importFiles(files);
      }
    },
    [importFiles],
  );

  return (
    <>
      <div
        className={styles.container}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <button
          type="button"
          className={`${styles.card} ${hovering ? styles.cardDragging : ""} ${busy ? styles.cardDisabled : ""}`}
          onClick={handleClick}
          disabled={busy}
          aria-label="Import media files"
        >
          <span className={styles.icon}>
            <Plus />
          </span>
          <b className={styles.title}>Drop media to import</b>
          <span className={styles.sub}>
            MP4, MOV, PNG, JPG, WAV, stored on this device
          </span>
        </button>
        <input
          ref={fileInputRef}
          className={styles.fileInput}
          type="file"
          accept={ACCEPT}
          multiple
          onChange={handleInputChange}
          tabIndex={-1}
          aria-hidden="true"
        />
      </div>

      {hovering && (
        <div className={styles.dropOverlay} aria-hidden="true">
          <div className={styles.dropOverlayCard}>
            <span className={styles.icon}>
              <Plus />
            </span>
            <b className={styles.title}>Drop to import</b>
            <span className={styles.sub}>Release to add to the timeline</span>
          </div>
        </div>
      )}
    </>
  );
}
