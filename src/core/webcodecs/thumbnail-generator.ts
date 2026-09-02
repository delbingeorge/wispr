type ThumbnailCache = Map<string, ImageBitmap>;

const cache: ThumbnailCache = new Map();
let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/thumbnail-worker.ts", import.meta.url),
      { type: "module" },
    );
  }
  return worker;
}

function cacheKey(assetId: string, timestamp: number): string {
  return `${assetId}:${timestamp.toFixed(2)}`;
}

export function getThumbnail(
  assetId: string,
  timestamp: number,
): ImageBitmap | null {
  return cache.get(cacheKey(assetId, timestamp)) ?? null;
}

export function generateThumbnails(
  assetId: string,
  opfsPath: string,
  timestamps: number[],
  width: number,
  height: number,
  onThumbnail: () => void,
) {
  const w = getWorker();

  const handler = (e: MessageEvent) => {
    console.log("worker message:", e.data.type);
    if (e.data.type === "thumbnail") {
      const key = cacheKey(assetId, e.data.timestamp);
      const existing = cache.get(key);
      if (existing) existing.close();
      cache.set(key, e.data.bitmap);
      onThumbnail();
    }

    if (e.data.type === "complete" || e.data.type === "error") {
      w.removeEventListener("message", handler);
    }
  };

  w.addEventListener("message", handler);

  w.postMessage({
    type: "generate",
    opfsPath,
    timestamps,
    width,
    height,
  });
}
