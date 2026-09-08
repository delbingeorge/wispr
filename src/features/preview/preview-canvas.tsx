import { useCallback, useEffect, useMemo, useRef } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { usePlaybackEngine } from "./use-playback-engine";
import { useProjectDurationSync } from "./use-project-duration-sync";
import { releaseAllAssetBlobUrls } from "./asset-blob-cache";
import { AssetImporter } from "../assets/asset-importer";
import { renderOverlays } from "./overlay-renderer";
import styles from "./styles/preview-canvas.module.css";
import { useOverlayInteraction } from "./use-overlay-interaction";
import { useSelectionStore } from "@/core/stores/selection-store";
import { getVideoDisplayRect } from "@/core/utils/video-frame";

export function PreviewCanvas() {
  const assetCount = useProjectStore((s) => s.project.assets.length);
  const tracks = useProjectStore((s) => s.project.tracks);
  const audioTrackIds = useMemo(
    () => tracks.filter((t) => t.type === "audio").map((t) => t.id),
    [tracks],
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const audioRefsMap = useRef<Map<string, HTMLAudioElement>>(new Map());

  usePlaybackEngine(videoRef, audioRefsMap);
  useProjectDurationSync();

  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useOverlayInteraction(canvasRef);

  const setAudioRef = useCallback(
    (trackId: string, element: HTMLAudioElement | null) => {
      if (element) audioRefsMap.current.set(trackId, element);
      else audioRefsMap.current.delete(trackId);
    },
    [],
  );

  useEffect(() => {
    return () => releaseAllAssetBlobUrls();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (!canvas.parentElement) return;

      const containerRect = canvas.parentElement.getBoundingClientRect();
      const { project, clips } = useProjectStore.getState();
      const { currentTime } = usePlaybackStore.getState();

      const videoRect = getVideoDisplayRect(
        containerRect.width,
        containerRect.height,
        project.resolution.width,
        project.resolution.height,
      );

      const dpr = devicePixelRatio;
      canvas.width = videoRect.width * dpr;
      canvas.height = videoRect.height * dpr;
      canvas.style.width = `${videoRect.width}px`;
      canvas.style.height = `${videoRect.height}px`;
      canvas.style.left = `${videoRect.x}px`;
      canvas.style.top = `${videoRect.y}px`;

      const video = videoRef.current;
      if (video) {
        video.style.width = `${videoRect.width}px`;
        video.style.height = `${videoRect.height}px`;
        video.style.left = `${videoRect.x}px`;
        video.style.top = `${videoRect.y}px`;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const overlayTrackClipIds = project.tracks
        .filter((t) => t.type === "overlay")
        .flatMap((t) => t.clips);

      const selectedClipIds = useSelectionStore.getState().selectedClipIds;
      const selectedClipId =
        selectedClipIds.size === 1 ? [...selectedClipIds][0] : null;

      renderOverlays(
        ctx,
        clips,
        overlayTrackClipIds,
        currentTime,
        videoRect.width,
        videoRect.height,
        project.resolution.width,
        project.resolution.height,
        selectedClipId,
      );
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [assetCount === 0]);

  if (assetCount === 0) {
    return <AssetImporter />;
  }

  return (
    <div className={styles.container}>
      <video ref={videoRef} className={styles.video} />
      {audioTrackIds.map((trackId) => (
        <audio
          key={trackId}
          ref={(element) => setAudioRef(trackId, element)}
          style={{ display: "none" }}
        />
      ))}
      <canvas
        ref={canvasRef}
        className={styles.overlay}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}
