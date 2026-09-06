import type { Track, TrackType } from "@/core/types/projects";

export const RULER_HEIGHT = 33;
export const LANE_TOP = 12;
export const LANE_GAP = 9;

export const TRACK_TYPE_HEIGHT: Record<TrackType, number> = {
  overlay: 34,
  video: 60,
  audio: 34,
};

export const PLAYHEAD_GRIP_TOP = RULER_HEIGHT + 20;
export const PLAYHEAD_GRIP_WIDTH = 10.5;
export const PLAYHEAD_GRIP_HEIGHT = 37;

type TrackLayoutEntry = {
  track: Track;
  index: number;
  top: number;
  height: number;
};

export function getTrackLayout(tracks: Track[]): TrackLayoutEntry[] {
  const layout: TrackLayoutEntry[] = [];
  let top = LANE_TOP;

  tracks.forEach((track, index) => {
    const height = TRACK_TYPE_HEIGHT[track.type];
    layout.push({ track, index, top, height });
    top += height + LANE_GAP;
  });

  return layout;
}

export function getLanesHeight(tracks: Track[]): number {
  if (tracks.length === 0) return LANE_TOP;
  const last = getTrackLayout(tracks).at(-1)!;
  return last.top + last.height + 30;
}

export function getMaxScrollY(tracks: Track[], viewportHeight: number): number {
  return Math.max(0, getLanesHeight(tracks) - viewportHeight);
}

export type { TrackLayoutEntry };
