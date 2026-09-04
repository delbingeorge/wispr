export function timeToPixel(
  time: number,
  zoom: number,
  scrollX: number,
): number {
  return time * zoom - scrollX;
}

export function pixelToTime(
  pixel: number,
  zoom: number,
  scrollX: number,
): number {
  return (pixel + scrollX) / zoom;
}
