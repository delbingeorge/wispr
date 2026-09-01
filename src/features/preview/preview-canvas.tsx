import { useEffect, useRef, useState } from "react";
import { useProjectStore } from "../../core/stores/project-store";
import { readFileFromOpfs } from "../../core/storage/opfs-storage";
import { AssetImporter } from "../../features/assets/asset-importer";

export function PreviewCanvas() {
  const assets = useProjectStore((s) => s.project.assets);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const latestAsset = assets[assets.length - 1];
  console.log(latestAsset);

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

  if (!latestAsset) return <AssetImporter />;

  return <video ref={videoRef} src={videoUrl ?? undefined} controls />;
}
