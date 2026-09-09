import type { Clip, Track } from "@/core/types/projects";
import { computeProjectDuration } from "@/core/utils/clip-lookup";

const MINIMUM_TIMELINE_DURATION = 180;
const MIN_ZOOM = 10;
const MAX_ZOOM = 1000;
const TAIL_PADDING = 15;
const END_SCROLL_HEADROOM_RATIO = 0.4;

export function getTimelineDuration(
  clips: Record<string, Clip>,
  tracks: Track[],
): number {
  return (
    Math.max(MINIMUM_TIMELINE_DURATION, computeProjectDuration(clips, tracks)) +
    TAIL_PADDING
  );
}

export function getMaxScrollX(
  timelineDuration: number,
  zoom: number,
  viewportWidth: number,
): number {
  return Math.max(
    0,
    timelineDuration * zoom - viewportWidth * END_SCROLL_HEADROOM_RATIO,
  );
}

export function clampZoom(zoom: number): number {
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));
}

export function getFitZoom(
  timelineDuration: number,
  viewportWidth: number,
): number {
  if (timelineDuration <= 0 || viewportWidth <= 0) return MIN_ZOOM;

  return clampZoom(viewportWidth / timelineDuration);
}
