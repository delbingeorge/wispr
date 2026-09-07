import type { Clip, Track } from "@/core/types/projects";
import { pixelToTime, timeToPixel } from "@/core/utils/time-coordinate";
import {
  RULER_HEIGHT,
  getTrackLayout,
  PLAYHEAD_GRIP_TOP,
  PLAYHEAD_GRIP_HEIGHT,
} from "./track-layout";

const TRIM_HANDLE_WIDTH = 8;
const GRIP_HIT_HALF_WIDTH = 9;
const GRIP_HIT_PADDING = 4;

type HitEmpty = { type: "empty"; trackIndex: number; time: number };
type HitClip = {
  type: "clip";
  clipId: string;
  region: "body" | "trimStart" | "trimEnd";
};
type HitRuler = { type: "ruler"; time: number };
type HitPlayheadGrip = { type: "playheadGrip" };

type HitTestResult = HitEmpty | HitClip | HitRuler | HitPlayheadGrip;

export function hitTest(
  mouseX: number,
  mouseY: number,
  zoom: number,
  scrollX: number,
  scrollY: number,
  currentTime: number,
  tracks: Track[],
  clips: Record<string, Clip>,
): HitTestResult {
  const gripX = timeToPixel(currentTime, zoom, scrollX);
  if (
    Math.abs(mouseX - gripX) <= GRIP_HIT_HALF_WIDTH &&
    mouseY >= PLAYHEAD_GRIP_TOP - GRIP_HIT_PADDING &&
    mouseY <= PLAYHEAD_GRIP_TOP + PLAYHEAD_GRIP_HEIGHT + GRIP_HIT_PADDING
  ) {
    return { type: "playheadGrip" };
  }

  if (mouseY <= RULER_HEIGHT) {
    return {
      type: "ruler",
      time: Math.max(0, pixelToTime(mouseX, zoom, scrollX)),
    };
  }

  const laneY = mouseY - RULER_HEIGHT + scrollY;
  const layout = getTrackLayout(tracks);
  const entry = layout.find((e) => laneY >= e.top && laneY < e.top + e.height);

  if (!entry) {
    const time = pixelToTime(mouseX, zoom, scrollX);
    const belowAllLanes =
      layout.length > 0 &&
      laneY >= layout[layout.length - 1].top + layout[layout.length - 1].height;
    return {
      type: "empty",
      trackIndex: belowAllLanes ? tracks.length : -1,
      time,
    };
  }

  const track = entry.track;
  const time = pixelToTime(mouseX, zoom, scrollX);

  for (const clipId of track.clips) {
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

  return { type: "empty", trackIndex: entry.index, time };
}

export type { HitTestResult };
