import type { Clip, MediaClip, Track } from "../types/projects";

function isClipActiveAt(clip: Clip, time: number): boolean {
  return time >= clip.startTime && time < clip.startTime + clip.duration;
}

export function findActiveClipOnTrack(
  clips: Record<string, Clip>,
  track: Track,
  time: number,
): MediaClip | null {
  for (const clipId of track.clips) {
    const clip = clips[clipId];
    if (!clip || clip.kind !== "media") continue;
    if (isClipActiveAt(clip, time)) return clip;
  }
  return null;
}

export type ActiveTrackClip = {
  clip: MediaClip;
  track: Track;
};

export function findActiveVideoClip(
  clips: Record<string, Clip>,
  tracks: Track[],
  time: number,
): ActiveTrackClip | null {
  for (const track of tracks) {
    if (track.type !== "video" || !track.visible) continue;
    const clip = findActiveClipOnTrack(clips, track, time);
    if (clip) return { clip, track };
  }
  return null;
}

export function findActiveAudioClips(
  clips: Record<string, Clip>,
  tracks: Track[],
  time: number,
): ActiveTrackClip[] {
  const result: ActiveTrackClip[] = [];
  for (const track of tracks) {
    if (track.type !== "audio") continue;
    const clip = findActiveClipOnTrack(clips, track, time);
    if (clip) result.push({ clip, track });
  }
  return result;
}

export function computeProjectDuration(
  clips: Record<string, Clip>,
  tracks: Track[],
): number {
  let maxEnd = 0;
  for (const track of tracks) {
    for (const clipId of track.clips) {
      const clip = clips[clipId];
      if (!clip) continue;
      maxEnd = Math.max(maxEnd, clip.startTime + clip.duration);
    }
  }
  return maxEnd;
}
