import { useEffect, useRef, useState, useCallback } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { readFileFromOpfs } from "@/core/storage/opfs-storage";
import { usePlaybackEngine } from "./use-playback-engine";
import { AssetImporter } from "../assets/asset-importer";

export function PreviewCanvas() {
  const assets = useProjectStore((s) => s.project.assets);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  usePlaybackEngine(videoRef);

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

  if (!latestAsset) {
    return <AssetImporter />;
  }

  return (
    <video
      ref={videoRef}
      src={videoUrl ?? undefined}
      onLoadedMetadata={handleLoadedMetadata}
    />
  );
}
