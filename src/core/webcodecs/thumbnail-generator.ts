import type { Asset } from "@/core/types/projects";
import { gc } from "@/core/utils/logger";

const FILMSTRIP_INTERVAL_SECONDS = 2;
const FILMSTRIP_WIDTH = 160;
const FILMSTRIP_HEIGHT = 90;

type AssetThumbnails = {
  timestamps: number[];
  bitmaps: Map<number, ImageBitmap>;
};

const cache = new Map<string, AssetThumbnails>();
const requestedAssetIds = new Set<string>();
const assetIdByRequestId = new Map<number, string>();
const readyListeners = new Set<() => void>();

let worker: Worker | null = null;
let nextRequestId = 1;

export function subscribeToThumbnails(listener: () => void) {
  readyListeners.add(listener);
  return () => {
    readyListeners.delete(listener);
  };
}

function storeThumbnail(
  assetId: string,
  timestamp: number,
  bitmap: ImageBitmap,
) {
  const entry = cache.get(assetId) ?? {
    timestamps: [],
    bitmaps: new Map<number, ImageBitmap>(),
  };

  const existing = entry.bitmaps.get(timestamp);
  if (existing) existing.close();
  else entry.timestamps.push(timestamp);

  entry.bitmaps.set(timestamp, bitmap);
  cache.set(assetId, entry);
}

function handleWorkerMessage(e: MessageEvent) {
  const assetId = assetIdByRequestId.get(e.data.requestId);
  if (!assetId) return;

  if (e.data.type === "thumbnail") {
    storeThumbnail(assetId, e.data.timestamp, e.data.bitmap);
    readyListeners.forEach((listener) => listener());
    return;
  }

  if (e.data.type === "error") {
    requestedAssetIds.delete(assetId);
    gc.error(`Thumbnail generation failed for ${assetId}`, e.data.message);
  }

  assetIdByRequestId.delete(e.data.requestId);
}

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/thumbnail-worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.addEventListener("message", handleWorkerMessage);
  }
  return worker;
}

export function getThumbnail(
  assetId: string,
  time: number,
): ImageBitmap | null {
  const entry = cache.get(assetId);
  if (!entry) return null;

  let nearest: number | null = null;
  for (const timestamp of entry.timestamps) {
    if (
      nearest === null ||
      Math.abs(timestamp - time) < Math.abs(nearest - time)
    ) {
      nearest = timestamp;
    }
  }

  return nearest === null ? null : (entry.bitmaps.get(nearest) ?? null);
}

export function generateAssetThumbnails(asset: Asset) {
  if (asset.type !== "video" || asset.duration <= 0) return;
  if (requestedAssetIds.has(asset.id)) return;
  requestedAssetIds.add(asset.id);

  const count = Math.max(
    1,
    Math.ceil(asset.duration / FILMSTRIP_INTERVAL_SECONDS),
  );
  const timestamps = Array.from(
    { length: count },
    (_, i) => (i / count) * asset.duration,
  );

  const requestId = nextRequestId++;
  assetIdByRequestId.set(requestId, asset.id);

  getWorker().postMessage({
    type: "generate",
    requestId,
    opfsPath: asset.opfsPath,
    timestamps,
    width: FILMSTRIP_WIDTH,
    height: FILMSTRIP_HEIGHT,
  });
}
