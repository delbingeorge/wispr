import { useCallback, useEffect, useRef, useState } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { readFileFromOpfs } from "@/core/storage/opfs-storage";
import { AssetImporter } from "@/features/assets/asset-importer";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { gc } from "@/core/utils/logger";

export function PreviewCanvas() {
  const assets = useProjectStore((s) => s.project.assets);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const seekingFromStore = useRef(false);

  const latestAsset = assets[assets.length - 1];
  gc.log(latestAsset);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    return usePlaybackStore.subscribe((state, prev) => {
      if (state.currentTime !== prev.currentTime) {
        seekingFromStore.current = true;
        video.currentTime = state.currentTime;
      }
    });
  }, [videoUrl]);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (seekingFromStore.current) {
      seekingFromStore.current = false;
      return;
    }

    usePlaybackStore.getState().setCurrentTime(video.currentTime);
  }, []);

  if (!latestAsset) return <AssetImporter />;

  return (
    <video
      ref={videoRef}
      src={videoUrl ?? undefined}
      controls
      onTimeUpdate={handleTimeUpdate}
    />
  );
}
