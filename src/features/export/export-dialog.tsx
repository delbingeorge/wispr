import { useState, useCallback } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { startExport, cancelExport } from "@/core/webcodecs/exporter";
import styles from "./styles/export-dialog.module.css";

type ExportState = "idle" | "exporting" | "complete" | "error";

export function ExportDialog({ onClose }: { onClose: () => void }) {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [fps, setFps] = useState(30);
  const [bitrate, setBitrate] = useState(8);
  const [state, setState] = useState<ExportState>("idle");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleExport = useCallback(() => {
    const { project, clips } = useProjectStore.getState();
    const duration = usePlaybackStore.getState().duration;

    const assets = project.assets.map((a) => ({
      id: a.id,
      opfsPath: a.opfsPath,
      duration: a.duration,
      metadata: a.metadata,
    }));

    setState("exporting");
    setProgress(0);

    startExport(
      {
        clips,
        tracks: project.tracks,
        assets,
        resolution: { width, height },
        fps,
        bitrate: bitrate * 1_000_000,
        duration,
      },
      {
        onProgress: (percent, currentPhase) => {
          setProgress(percent);
          setPhase(currentPhase);
        },
        onComplete: (blob) => {
          setState("complete");
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${useProjectStore.getState().project.name}.mp4`;
          a.click();
          URL.revokeObjectURL(url);
        },
        onError: (message) => {
          setState("error");
          setErrorMessage(message);
        },
      },
    );
  }, [width, height, fps, bitrate]);

  const handleCancel = useCallback(() => {
    cancelExport();
    setState("idle");
    setProgress(0);
  }, []);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Export</span>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        {state === "idle" && (
          <>
            <div className={styles.body}>
              <div className={styles.row}>
                <label className={styles.label}>Resolution</label>
                <div className={styles.inputGroup}>
                  <input
                    className={styles.input}
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                  />
                  <span className={styles.separator}>×</span>
                  <input
                    className={styles.input}
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Frame Rate</label>
                <select
                  className={styles.select}
                  value={fps}
                  onChange={(e) => setFps(Number(e.target.value))}
                >
                  <option value={24}>24 fps</option>
                  <option value={30}>30 fps</option>
                  <option value={60}>60 fps</option>
                </select>
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Bitrate</label>
                <select
                  className={styles.select}
                  value={bitrate}
                  onChange={(e) => setBitrate(Number(e.target.value))}
                >
                  <option value={4}>4 Mbps</option>
                  <option value={8}>8 Mbps</option>
                  <option value={12}>12 Mbps</option>
                  <option value={16}>16 Mbps</option>
                </select>
              </div>
            </div>
            <div className={styles.footer}>
              <button className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button className={styles.exportBtn} onClick={handleExport}>
                Export MP4
              </button>
            </div>
          </>
        )}

        {state === "exporting" && (
          <div className={styles.body}>
            <div className={styles.progressSection}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className={styles.progressInfo}>
                <span className={styles.progressPercent}>{progress}%</span>
                <span className={styles.progressPhase}>{phase}</span>
              </div>
              <button className={styles.cancelBtn} onClick={handleCancel}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {state === "complete" && (
          <div className={styles.body}>
            <div className={styles.completeSection}>
              <span className={styles.completeText}>
                Export complete. File downloaded.
              </span>
              <button className={styles.exportBtn} onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className={styles.body}>
            <div className={styles.errorSection}>
              <span className={styles.errorText}>{errorMessage}</span>
              <button
                className={styles.cancelBtn}
                onClick={() => setState("idle")}
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
