import type { Track, TrackType } from "@/core/types/projects";

const TRACK_TYPE_LABELS: Record<TrackType, string> = {
  video: "Video",
  audio: "Audio",
  overlay: "Overlay",
};

export function nextTrackLabel(tracks: Track[], type: TrackType): string {
  const count = tracks.filter((t) => t.type === type).length;
  return `${TRACK_TYPE_LABELS[type]} ${count + 1}`;
}
