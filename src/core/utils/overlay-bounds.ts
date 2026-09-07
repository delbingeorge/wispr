function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function clampOverlayPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  projectWidth: number,
  projectHeight: number,
): { x: number; y: number } {
  return {
    x: clamp(x, -width, projectWidth),
    y: clamp(y, -height, projectHeight),
  };
}

export function clampOverlaySize(
  width: number,
  height: number,
  projectWidth: number,
  projectHeight: number,
): { width: number; height: number } {
  return {
    width: clamp(width, 20, projectWidth),
    height: clamp(height, 20, projectHeight),
  };
}
