// TODO: should update the icons with lucide icons

import { useEffect, useState } from "react";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { useProjectStore } from "@/core/stores/project-store";
import { DEFAULT_ZOOM, useTimelineStore } from "@/core/stores/timeline-store";
import {
  clampZoom,
  getFitZoom,
  getTimelineDuration,
} from "@/features/timeline/timeline-extent";
import { useHistoryStore } from "@/core/stores/history-store";
import { formatTimecode } from "@/core/utils/time-format";
import { toast } from "@/features/ui/toast-store";
import styles from "./styles/playback-control.module.css";
import {
  Collapse,
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
const ZOOM_STEP = 1.5;

export function PlaybackControls() {
  const currentTime = usePlaybackStore((s) => s.currentTime);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const duration = usePlaybackStore((s) => s.duration);
  const playbackRate = usePlaybackStore((s) => s.playbackRate);
  const zoom = useTimelineStore((s) => s.zoom);
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

  const handleZoom = (factor: number) => {
    const { zoom: current, setZoom } = useTimelineStore.getState();
    setZoom(clampZoom(current * factor));
  };

  const handleZoomToFit = () => {
    const { viewportWidth, setZoom, setScrollX } = useTimelineStore.getState();
    const { project, clips } = useProjectStore.getState();

    setZoom(getFitZoom(getTimelineDuration(clips, project.tracks), viewportWidth));
    setScrollX(0);
  };

  const handleResetView = () => {
    const { setZoom, setScrollX, setScrollY } = useTimelineStore.getState();
    setZoom(DEFAULT_ZOOM);
    setScrollX(0);
    setScrollY(0);
  };

  const handleToggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void document.documentElement.requestFullscreen().catch(() => {
      toast.err("Full screen unavailable", "The browser refused the request");
    });
  };

  return (
    <div className={styles.controls}>
      <div className={styles.left}>
        <span className={styles.timeBadge}>{formatTimecode(currentTime)}</span>
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
            onClick={() => handleZoom(1 / ZOOM_STEP)}
            title="Zoom out"
          >
            <Minus />
          </button>
          <span
            className={styles.zoomValue}
            onClick={handleZoomToFit}
            title="Fit timeline to view"
          >
            {Math.round(zoom)}%
          </span>
          <button
            className={styles.zoomBtn}
            onClick={() => handleZoom(ZOOM_STEP)}
            title="Zoom in"
          >
            <Plus />
          </button>
        </span>

        <span className={styles.trackDivider} />

        <button
          className={styles.btn}
          onClick={handleResetView}
          title="Reset timeline view"
        >
          <Reset />
        </button>
        <button
          className={styles.btn}
          onClick={handleToggleFullscreen}
          title={isFullscreen ? "Exit full screen" : "Full screen"}
        >
          {isFullscreen ? <Collapse /> : <Expand />}
        </button>
      </div>
    </div>
  );
}
