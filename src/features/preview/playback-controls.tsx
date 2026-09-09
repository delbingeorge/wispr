// TODO: should update the icons with lucide icons

import { useEffect, useState } from "react";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { useSelectionStore } from "@/core/stores/selection-store";
import { useTimelineStore } from "@/core/stores/timeline-store";
import {
  resetTimelineView,
  zoomIn,
  zoomOut,
  zoomToFit,
} from "@/features/timeline/timeline-view-actions";
import { toggleFullscreen } from "./fullscreen";
import { useHistoryStore } from "@/core/stores/history-store";
import { formatTimecode } from "@/core/utils/time-format";
import styles from "./styles/playback-control.module.css";
import {
  Blade,
  Collapse,
  Cursor,
  Expand,
  FastForward,
  Minus,
  Next,
  Pause,
  Play,
  Plus,
  Redo,
  Reset,
  Undo,
} from "@/assets/icons";

const RATES = [0.25, 0.5, 1, 1.5, 2];

export function PlaybackControls() {
  const currentTime = usePlaybackStore((s) => s.currentTime);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const duration = usePlaybackStore((s) => s.duration);
  const playbackRate = usePlaybackStore((s) => s.playbackRate);
  const zoom = useTimelineStore((s) => s.zoom);
  const activeTool = useSelectionStore((s) => s.activeTool);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const handleTogglePlay = () => usePlaybackStore.getState().togglePlayback();

  const handleSeekStart = () => {
    usePlaybackStore.getState().pause();
    usePlaybackStore.getState().setCurrentTime(0);
  };

  const handleStepBack = () => {
    const time = usePlaybackStore.getState().currentTime;
    usePlaybackStore.getState().setCurrentTime(Math.max(0, time - 1 / 30));
  };

  const handleStepForward = () => {
    const { currentTime, duration } = usePlaybackStore.getState();
    usePlaybackStore
      .getState()
      .setCurrentTime(Math.min(duration, currentTime + 1 / 30));
  };

  const handleSeekEnd = () => {
    usePlaybackStore.getState().pause();
    usePlaybackStore.getState().setCurrentTime(duration);
  };

  const handleRateCycle = () => {
    const currentIndex = RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % RATES.length;
    usePlaybackStore.getState().setPlaybackRate(RATES[nextIndex]);
  };

  const handleUndo = () => useHistoryStore.getState().undo();
  const handleRedo = () => useHistoryStore.getState().redo();

  return (
    <div className={styles.controls}>
      <div className={styles.left}>
        <div className={styles.rail} role="toolbar" aria-label="Tools">
          <button
            className={`${styles.tool} ${activeTool === "select" ? styles.toolActive : ""}`}
            onClick={() => useSelectionStore.getState().setActiveTool("select")}
            title="Selection"
          >
            <Cursor />
          </button>
          <button
            className={`${styles.tool} ${activeTool === "split" ? styles.toolActive : ""}`}
            onClick={() => useSelectionStore.getState().setActiveTool("split")}
            title="Split — click a clip to cut it"
          >
            <Blade />
          </button>
        </div>
      </div>

      <div className={styles.center}>
        <button
          className={styles.btn}
          onClick={handleSeekStart}
          title="Skip to start"
        >
          <FastForward style={{ transform: "rotate(180deg" }} />
        </button>
        <button
          className={styles.btn}
          onClick={handleStepBack}
          title="Step back"
        >
          <Next style={{ transform: "rotate(180deg" }} />
        </button>
        <button
          className={`${styles.btn} ${styles.btnPlay}`}
          onClick={handleTogglePlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause /> : <Play />}
        </button>
        <button
          className={styles.btn}
          onClick={handleStepForward}
          title="Step forward"
        >
          <Next />
        </button>
        <button
          className={styles.btn}
          onClick={handleSeekEnd}
          title="Skip to end"
        >
          <FastForward />
        </button>
        <button
          className={styles.speedChip}
          onClick={handleRateCycle}
          title="Playback rate"
        >
          {playbackRate}×
        </button>
        <span className={styles.timeDisplay}>
          {formatTimecode(currentTime)} /{" "}
          <span className={styles.timeCode}>{formatTimecode(duration)}</span>
        </span>
      </div>

      <div className={styles.right}>
        <button className={styles.btn} onClick={handleUndo} title="Undo">
          <Undo />
        </button>
        <button className={styles.btn} onClick={handleRedo} title="Redo">
          <Redo />
        </button>

        <span className={styles.zoom}>
          <button
            className={styles.zoomBtn}
            onClick={zoomOut}
            title="Zoom out"
          >
            <Minus />
          </button>
          <span
            className={styles.zoomValue}
            onClick={zoomToFit}
            title="Fit timeline to view"
          >
            {Math.round(zoom)}%
          </span>
          <button
            className={styles.zoomBtn}
            onClick={zoomIn}
            title="Zoom in"
          >
            <Plus />
          </button>
        </span>

        <span className={styles.trackDivider} />

        <button
          className={styles.btn}
          onClick={resetTimelineView}
          title="Reset timeline view"
        >
          <Reset />
        </button>
        <button
          className={styles.btn}
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit full screen" : "Full screen"}
        >
          {isFullscreen ? <Collapse /> : <Expand />}
        </button>
      </div>
    </div>
  );
}
