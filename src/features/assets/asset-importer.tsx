import { useCallback, useRef } from "react";
import { useMediaImport } from "./use-media-import";
import { Plus } from "@/assets/icons";
import styles from "./styles/asset-importer.module.css";

const ACCEPT = "video/*,image/*,audio/*";

export function AssetImporter() {
  const { importFiles, busy } = useMediaImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div className={styles.container}>
      <button
        type="button"
        className={`${styles.card} ${busy ? styles.cardDisabled : ""}`}
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
  );
}
