import type { Clip } from "@/core/types/projects";

const CLIP_GAP_SECONDS = 0.1;

export function findFirstGap(existingClips: Clip[], duration: number): number {
  const sorted = [...existingClips].sort((a, b) => a.startTime - b.startTime);
  let cursor = 0;

  for (const clip of sorted) {
    if (clip.startTime - cursor >= duration + CLIP_GAP_SECONDS) {
      return cursor;
    }
    cursor = Math.max(cursor, clip.startTime + clip.duration + CLIP_GAP_SECONDS);
  }

  return cursor;
}
