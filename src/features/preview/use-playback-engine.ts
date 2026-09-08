import { useEffect, useRef } from "react";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { useProjectStore } from "@/core/stores/project-store";
import { findActiveAudioClips, findActiveVideoClip } from "@/core/utils/clip-lookup";
import { syncMediaElement } from "./media-element-sync";
import { syncStillImage } from "./still-image-sync";

function runSync(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  imageRef: React.RefObject<HTMLImageElement | null>,
  audioRefs: React.RefObject<Map<string, HTMLAudioElement>>,
) {
  const { currentTime, isPlaying, playbackRate } = usePlaybackStore.getState();
  const { project, clips } = useProjectStore.getState();

  const activeVideo = findActiveVideoClip(clips, project.tracks, currentTime);
  const activeVideoAsset = activeVideo
    ? project.assets.find((a) => a.id === activeVideo.clip.assetId)
    : undefined;
  const showsStillImage = activeVideoAsset?.type === "image";

  const video = videoRef.current;
  if (video) {
    syncMediaElement(
      video,
      true,
      showsStillImage ? null : activeVideo,
      showsStillImage ? undefined : activeVideoAsset,
      currentTime,
      isPlaying,
      playbackRate,
    );
  }

  const image = imageRef.current;
  if (image) {
    syncStillImage(image, showsStillImage ? activeVideoAsset : undefined);
  }

  const activeAudioClips = findActiveAudioClips(clips, project.tracks, currentTime);

  for (const [trackId, element] of audioRefs.current) {
    const active =
      activeAudioClips.find((entry) => entry.track.id === trackId) ?? null;
    const asset = active
      ? project.assets.find((a) => a.id === active.clip.assetId)
      : undefined;
    syncMediaElement(
      element,
      false,
      active,
      asset,
      currentTime,
      isPlaying,
      playbackRate,
    );
  }
}

export function usePlaybackEngine(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  imageRef: React.RefObject<HTMLImageElement | null>,
  audioRefs: React.RefObject<Map<string, HTMLAudioElement>>,
) {
  const rafRef = useRef<number>(0);
  const playStartWallTime = useRef(0);
  const playStartTimelineTime = useRef(0);

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
    runSync(videoRef, imageRef, audioRefs);

    const unsubPlayback = usePlaybackStore.subscribe((state, prev) => {
      if (
        state.isPlaying === prev.isPlaying &&
        state.currentTime === prev.currentTime &&
        state.playbackRate === prev.playbackRate
      ) {
        return;
      }

      if (state.isPlaying && !prev.isPlaying) {
        playStartWallTime.current = performance.now();
        playStartTimelineTime.current = state.currentTime;
        startLoop();
      }

      if (!state.isPlaying && prev.isPlaying) {
        cancelAnimationFrame(rafRef.current);
      }

      if (state.playbackRate !== prev.playbackRate) {
        playStartWallTime.current = performance.now();
        playStartTimelineTime.current = state.currentTime;
      }

      runSync(videoRef, imageRef, audioRefs);
    });

    const unsubProject = useProjectStore.subscribe((state, prev) => {
      if (state.clips === prev.clips && state.project.tracks === prev.project.tracks) {
        return;
      }
      runSync(videoRef, imageRef, audioRefs);
    });

    return () => {
      unsubPlayback();
      unsubProject();
    };
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    runSync(videoRef, imageRef, audioRefs);
  });
}
