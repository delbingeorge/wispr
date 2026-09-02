import type { Track } from "@/core/types/projects";
import type { MediaClip } from "@/core/types/projects";
import { pixelToTime } from "@/core/utils/time-coordinate";
import { RULER_HEIGHT, TRACK_HEIGHT } from "./timeline-renderer";
import { gc } from "@/core/utils/logger";

const TRIM_HANDLE_WIDTH = 8;

type HitEmpty = { type: "empty"; trackIndex: number; time: number };
type HitClip = {
  type: "clip";
  clipId: string;
  region: "body" | "trimStart" | "trimEnd";
};
type HitRuler = { type: "ruler"; time: number };

type HitTestResult = HitEmpty | HitClip | HitRuler;

export function hitTest(
  mouseX: number,
  mouseY: number,
  zoom: number,
  scrollX: number,
  tracks: Track[],
  clips: Record<string, MediaClip>,
): HitTestResult {
  if (mouseY <= RULER_HEIGHT) {
    return {
      type: "ruler",
      time: Math.max(0, pixelToTime(mouseX, zoom, scrollX)),
    };
  }

  const trackIndex = Math.floor((mouseY - RULER_HEIGHT) / TRACK_HEIGHT);

  if (trackIndex < 0 || trackIndex >= tracks.length) {
    const time = pixelToTime(mouseX, zoom, scrollX);
    gc.log("this is the time: ", time);

    return { type: "empty", trackIndex: Math.max(0, trackIndex), time };
  }

  const track = tracks[trackIndex];
  const time = pixelToTime(mouseX, zoom, scrollX);

  for (const clipId of track.clips) {
    gc.log("cursor was here 1");
    const clip = clips[clipId];
    if (!clip) continue;

    const clipStartPx = clip.startTime * zoom - scrollX;
    const clipEndPx = (clip.startTime + clip.duration) * zoom - scrollX;

    if (mouseX < clipStartPx || mouseX > clipEndPx) continue;

    if (mouseX <= clipStartPx + TRIM_HANDLE_WIDTH) {
      return { type: "clip", clipId, region: "trimStart" };
    }

    if (mouseX >= clipEndPx - TRIM_HANDLE_WIDTH) {
      return { type: "clip", clipId, region: "trimEnd" };
    }

    return { type: "clip", clipId, region: "body" };
  }

  return { type: "empty", trackIndex, time };
}

export type { HitTestResult };
