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
import { getPreviewFrameRect } from "@/core/utils/video-frame";

export function PreviewCanvas() {
  const assetCount = useProjectStore((s) => s.project.assets.length);
  const tracks = useProjectStore((s) => s.project.tracks);
  const audioTrackIds = useMemo(
    () => tracks.filter((t) => t.type === "audio").map((t) => t.id),
    [tracks],
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
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

      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const { project, clips } = useProjectStore.getState();
      const { currentTime } = usePlaybackStore.getState();

      const frameRect = getPreviewFrameRect(
        containerRect.width,
        containerRect.height,
        project.resolution.width,
        project.resolution.height,
      );

      const frame = frameRef.current;
      if (frame) {
        frame.style.width = `${frameRect.width}px`;
        frame.style.height = `${frameRect.height}px`;
        frame.style.left = `${frameRect.x}px`;
        frame.style.top = `${frameRect.y}px`;
      }

      const dpr = devicePixelRatio;
      canvas.width = frameRect.width * dpr;
      canvas.height = frameRect.height * dpr;

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
        frameRect.width,
        frameRect.height,
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
    <div ref={containerRef} className={styles.container}>
      <div ref={frameRef} className={styles.frame}>
        <video ref={videoRef} className={styles.video} />
        <canvas
          ref={canvasRef}
          className={styles.overlay}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>
      {audioTrackIds.map((trackId) => (
        <audio
          key={trackId}
          ref={(element) => setAudioRef(trackId, element)}
          style={{ display: "none" }}
        />
      ))}
    </div>
  );
}
