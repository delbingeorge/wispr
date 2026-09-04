import { useEffect, useRef, useState, useCallback } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { readFileFromOpfs } from "@/core/storage/opfs-storage";
import { usePlaybackEngine } from "./use-playback-engine";
import { AssetImporter } from "../assets/asset-importer";
import { renderOverlays } from "./overlay-renderer";
import styles from "./styles/preview-canvas.module.css";
import { useOverlayInteraction } from "./use-overlay-interaction";
import { useSelectionStore } from "@/core/stores/selection-store";

export function PreviewCanvas() {
  const assets = useProjectStore((s) => s.project.assets);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  usePlaybackEngine(videoRef);

  const { handleMouseDown, handleMouseMove, handleMouseUp } =
    useOverlayInteraction(canvasRef);

  const latestAsset = assets[assets.length - 1];

  useEffect(() => {
    if (!latestAsset) return;

    let revoked = false;

    readFileFromOpfs(latestAsset.opfsPath).then((file) => {
      if (revoked) return;
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
    });

    return () => {
      revoked = true;
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [latestAsset?.id]);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    usePlaybackStore.getState().setDuration(video.duration);
  }, []);

  useEffect(() => {
    if (!latestAsset) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      if (!canvas.parentElement) return;

      const rect = canvas.parentElement.getBoundingClientRect();
      const { project, clips } = useProjectStore.getState();
      const { currentTime } = usePlaybackStore.getState();

      const dpr = devicePixelRatio;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

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
        rect.width,
        rect.height,
        project.resolution.width,
        project.resolution.height,
        selectedClipId,
      );

      console.log(
        "overlay clips:",
        overlayTrackClipIds.length,
        "time:",
        currentTime,
      );
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafRef.current);
  }, [latestAsset?.id]);

  if (!latestAsset) {
    return <AssetImporter />;
  }

  return (
    <div className={styles.container}>
      <video
        ref={videoRef}
        src={videoUrl ?? undefined}
        onLoadedMetadata={handleLoadedMetadata}
        className={styles.video}
      />
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
