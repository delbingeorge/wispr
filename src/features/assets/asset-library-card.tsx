import { useEffect, useRef, useState } from "react";
import type { Asset } from "@/core/types/projects";
import { readFileFromOpfs } from "@/core/storage/opfs-storage";
import { generateThumbnails, getThumbnail } from "@/core/webcodecs/thumbnail-generator";
import { formatTimecode } from "@/core/utils/time-format";
import { Check } from "@/assets/icons";
import styles from "./styles/asset-library-card.module.css";

const THUMB_WIDTH = 160;
const THUMB_HEIGHT = 90;
const AUDIO_BAR_HEIGHTS = [38, 62, 88, 54, 96, 40, 74, 58, 90, 46, 68, 34];

export function AssetLibraryCard({
  asset,
  selected,
  onClick,
}: {
  asset: Asset;
  selected: boolean;
  onClick: (event: React.MouseEvent) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (asset.type !== "image") return;

    let objectUrl: string | null = null;
    let cancelled = false;

    readFileFromOpfs(asset.opfsPath).then((file) => {
      if (cancelled) return;
      objectUrl = URL.createObjectURL(file);
      setImageUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [asset.type, asset.opfsPath]);

  useEffect(() => {
    if (asset.type !== "video") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawThumbnail = () => {
      const bitmap = getThumbnail(asset.id, 0);
      if (bitmap) ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    };

    if (getThumbnail(asset.id, 0)) {
      drawThumbnail();
    } else {
      generateThumbnails(
        asset.id,
        asset.opfsPath,
        [0],
        THUMB_WIDTH,
        THUMB_HEIGHT,
        drawThumbnail,
      );
    }
  }, [asset.id, asset.type, asset.opfsPath]);

  const metaText =
    asset.type === "audio"
      ? `${asset.metadata.sampleRate ? Math.round(asset.metadata.sampleRate / 1000) + " kHz · " : ""}${asset.metadata.codec.toUpperCase()}`
      : `${asset.metadata.width} × ${asset.metadata.height}`;

  return (
    <button
      className={`${styles.card} ${selected ? styles.selected : ""}`}
      onClick={onClick}
      title={`${asset.name} — ${metaText}`}
    >
      <span
        className={`${styles.thumb} ${asset.type === "audio" ? styles.thumbAudio : ""}`}
      >
        {asset.type === "image" && imageUrl && <img src={imageUrl} alt="" />}
        {asset.type === "video" && (
          <canvas ref={canvasRef} width={THUMB_WIDTH} height={THUMB_HEIGHT} />
        )}
        {asset.type === "audio" && (
          <span className={styles.bars}>
            {AUDIO_BAR_HEIGHTS.map((height, i) => (
              <i key={i} style={{ height: `${height}%` }} />
            ))}
          </span>
        )}
        {asset.type !== "image" && asset.duration > 0 && (
          <span className={styles.duration}>
            {formatTimecode(asset.duration)}
          </span>
        )}
        <span className={styles.check}>
          <Check />
        </span>
      </span>
      <span className={styles.name}>{asset.name}</span>
      <span className={styles.meta}>{metaText}</span>
    </button>
  );
}
