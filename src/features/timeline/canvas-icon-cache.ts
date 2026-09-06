export type CanvasIconKey =
  | "music"
  | "type"
  | "shape-square"
  | "shape-circle"
  | "shape-line"
  | "shape-arrow";

const ICON_MARKUP: Record<
  CanvasIconKey,
  { inner: string; strokeWidth: number; extra?: string }
> = {
  music: {
    inner:
      '<path d="M10.4 18.4V4.1l7-2.1v3.4l-7 2.1"/><ellipse cx="7.4" cy="19.4" rx="3" ry="2.4"/>',
    strokeWidth: 1.7,
    extra: 'stroke-linejoin="round"',
  },
  type: {
    inner: '<path d="M4 6h16M12 6v13M9 19h6"/>',
    strokeWidth: 1.8,
    extra: 'stroke-linecap="round"',
  },
  "shape-square": {
    inner: '<rect x="4" y="4" width="16" height="16" rx="2.6"/>',
    strokeWidth: 1.8,
  },
  "shape-circle": {
    inner: '<circle cx="12" cy="12" r="8"/>',
    strokeWidth: 1.8,
  },
  "shape-line": {
    inner: '<path d="M4.6 19.4 19.4 4.6"/>',
    strokeWidth: 1.8,
    extra: 'stroke-linecap="round"',
  },
  "shape-arrow": {
    inner: '<path d="M4.6 19.4 19.4 4.6"/><path d="M9.6 4.6h9.8v9.8"/>',
    strokeWidth: 1.8,
    extra: 'stroke-linecap="round" stroke-linejoin="round"',
  },
};

const cache = new Map<string, ImageBitmap | "pending">();
let onReady: (() => void) | null = null;

export function setOnIconReady(cb: () => void) {
  onReady = cb;
}

export function getCanvasIcon(
  key: CanvasIconKey,
  colorHex: string,
  pixelSize: number,
): ImageBitmap | null {
  const cacheKey = `${key}:${colorHex}:${pixelSize}`;
  const cached = cache.get(cacheKey);
  if (cached && cached !== "pending") return cached;
  if (cached === "pending") return null;

  cache.set(cacheKey, "pending");
  const { inner, strokeWidth, extra } = ICON_MARKUP[key];
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${pixelSize}" height="${pixelSize}" ` +
    `viewBox="0 0 24 24" fill="none" stroke="${colorHex}" stroke-width="${strokeWidth}" ${extra ?? ""}>` +
    `${inner}</svg>`;

  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const img = new Image();
  img.src = uri;
  img
    .decode()
    .then(() => createImageBitmap(img))
    .then((bitmap) => {
      cache.set(cacheKey, bitmap);
      onReady?.();
    })
    .catch(() => {
      cache.delete(cacheKey);
    });

  return null;
}
