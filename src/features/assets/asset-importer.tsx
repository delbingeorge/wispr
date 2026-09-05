import { useCallback, useRef, useState } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { storeFileInOpfs } from "@/core/storage/opfs-storage";
import { generateId } from "@/core/utils/id-generator";
import { generateThumbnails } from "@/core/webcodecs/thumbnail-generator";
import {
  detectMediaKind,
  probeMedia,
  type MediaKind,
} from "@/core/utils/media-detect";
import { toast } from "@/features/ui/toast-store";
import { Plus } from "@/assets/icons";
import styles from "./styles/asset-importer.module.css";

const ACCEPT = "video/*,image/*,audio/*";

const trackTypeForKind = (kind: MediaKind): "video" | "audio" => {
  if (kind === "audio") return "audio";
  return "video";
};

export function AssetImporter() {
  const addAsset = useProjectStore((s) => s.addAsset);
  const addClip = useProjectStore((s) => s.addClip);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hovering, setHovering] = useState(false);
  const [busy, setBusy] = useState(false);

  const importOne = useCallback(
    async (file: File): Promise<string | null> => {
      const kind = detectMediaKind(file);
      if (!kind) {
        toast.err(`Skipped ${file.name}`, "Unsupported file type");
        return null;
      }

      try {
        const info = await probeMedia(file);
        const assetId = generateId();
        const opfsPath = `${assetId}-${file.name}`;

        await storeFileInOpfs(file, opfsPath);

        addAsset({
          id: assetId,
          name: file.name.replace(/\.[^.]+$/, ""),
          fileName: file.name,
          type: kind,
          duration: info.duration,
          fileSize: file.size,
          opfsPath,
          metadata: {
            width: info.width,
            height: info.height,
            codec: info.codec,
          },
        });

        const { project, clips } = useProjectStore.getState();
        const targetType = trackTypeForKind(kind);
        const track =
          project.tracks.find((t) => t.type === targetType) ??
          project.tracks[0];
        if (!track) {
          toast.err(`Imported ${file.name}`, "No tracks in this project");
          return null;
        }

        const existingClips = Object.values(clips).filter(
          (c) => c.trackId === track.id,
        );
        const startTime = existingClips.reduce(
          (max, c) => Math.max(max, c.startTime + c.duration),
          0,
        );

        addClip({
          id: generateId(),
          trackId: track.id,
          assetId,
          kind: "media",
          startTime,
          duration: info.duration,
          inPoint: 0,
          outPoint: info.duration,
        });

        if (kind === "video") {
          const thumbCount = Math.max(1, Math.ceil(info.duration / 2));
          const timestamps = Array.from(
            { length: thumbCount },
            (_, i) => (i / thumbCount) * info.duration,
          );
          const dirtyTimeline = () => {
            usePlaybackStore
              .getState()
              .setCurrentTime(usePlaybackStore.getState().currentTime);
          };
          generateThumbnails(
            assetId,
            opfsPath,
            timestamps,
            160,
            90,
            dirtyTimeline,
          );
        }

        return file.name;
      } catch (err) {
        const detail =
          err instanceof Error ? err.message : "Could not read file";
        toast.err(`Failed to import ${file.name}`, detail);
        return null;
      }
    },
    [addAsset, addClip],
  );

  const importFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      setBusy(true);
      try {
        const results = await Promise.all(list.map(importOne));
        const ok = results.filter((r): r is string => r !== null);
        if (ok.length > 0) {
          toast.ok(
            `Imported ${ok.length} file${ok.length > 1 ? "s" : ""}`,
            "Stored in OPFS",
          );
        }
      } finally {
        setBusy(false);
      }
    },
    [importOne],
  );

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
