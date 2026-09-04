import { useEffect, useRef } from "react";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { gc } from "@/core/utils/logger";

export function usePlaybackEngine(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const rafRef = useRef<number>(0);
  const playStartWallTime = useRef(0);
  const playStartTimelineTime = useRef(0);

  useEffect(() => {
    return usePlaybackStore.subscribe((state, prev) => {
      const video = videoRef.current;
      if (!video) return;

      if (state.isPlaying && !prev.isPlaying) {
        playStartWallTime.current = performance.now();
        playStartTimelineTime.current = state.currentTime;
        video.currentTime = state.currentTime;
        video.playbackRate = state.playbackRate;
        video.play();
        startLoop();
      }

      if (!state.isPlaying && prev.isPlaying) {
        video.pause();
        cancelAnimationFrame(rafRef.current);
      }

      if (!state.isPlaying && state.currentTime !== prev.currentTime) {
        video.currentTime = state.currentTime;
      }

      if (state.playbackRate !== prev.playbackRate) {
        gc.log("cursor is insde - file use-playback-engine");
        video.playbackRate = state.playbackRate;
        playStartWallTime.current = performance.now();
        playStartTimelineTime.current = state.currentTime;
      }
    });
  }, []);

  const startLoop = () => {
    const tick = () => {
      const { isPlaying, playbackRate, duration } = usePlaybackStore.getState();
      if (!isPlaying) return;

      const elapsed = (performance.now() - playStartWallTime.current) / 1000;
      const newTime = playStartTimelineTime.current + elapsed * playbackRate;

      if (newTime >= duration) {
        usePlaybackStore.getState().pause();
        usePlaybackStore.getState().setCurrentTime(duration);
        return;
      }

      usePlaybackStore.getState().setCurrentTime(newTime);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
}
