// TODO: should update the icons with lucide icons

import { usePlaybackStore } from "@/core/stores/playback-store";
import { useHistoryStore } from "@/core/stores/history-store";
import { formatTimecode } from "@/core/utils/time-format";
import styles from "./styles/playback-control.module.css";

const RATES = [0.25, 0.5, 1, 1.5, 2];

export function PlaybackControls() {
  const currentTime = usePlaybackStore((s) => s.currentTime);
  const isPlaying = usePlaybackStore((s) => s.isPlaying);
  const duration = usePlaybackStore((s) => s.duration);
  const playbackRate = usePlaybackStore((s) => s.playbackRate);

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
        <span className={styles.timeBadge}>{formatTimecode(currentTime)}</span>
      </div>

      <div className={styles.center}>
        <button
          className={styles.btn}
          onClick={handleSeekStart}
          title="Skip to start"
        >
          {"<<"}
        </button>
        <button
          className={styles.btn}
          onClick={handleStepBack}
          title="Step back"
        >
          {"<"}
        </button>
        <button
          className={styles.btnPlay}
          onClick={handleTogglePlay}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "Pause Icon" : "Play Icon"}
        </button>
        <button
          className={styles.btn}
          onClick={handleStepForward}
          title="Step forward"
        >
          {">"}
        </button>
        <button
          className={styles.btn}
          onClick={handleSeekEnd}
          title="Skip to end"
        >
          {">>"}
        </button>
      </div>

      <div className={styles.right}>
        <button
          className={styles.btn}
          onClick={handleRateCycle}
          title="Playback rate"
        >
          {playbackRate}×
        </button>
        <span className={styles.timeDisplay}>
          {formatTimecode(currentTime)} / {formatTimecode(duration)}
        </span>
        <button className={styles.btn} onClick={handleUndo} title="Undo">
          undo
        </button>
        <button className={styles.btn} onClick={handleRedo} title="Redo">
          redo
        </button>
      </div>
    </div>
  );
}
