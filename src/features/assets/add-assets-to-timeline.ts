import { useProjectStore } from "@/core/stores/project-store";
import { useSelectionStore } from "@/core/stores/selection-store";
import { generateId } from "@/core/utils/id-generator";
import { nextTrackLabel } from "@/core/utils/track-naming";
import { findFirstGap } from "@/core/utils/clip-placement";
import type { TrackType } from "@/core/types/projects";

export function addAssetsToTimeline(
  assetIds: string[],
  targetTrackId: string | null,
) {
  let lastClipId: string | null = null;

  for (const assetId of assetIds) {
    const { project, clips, addClip, addTrack, updateTrack } =
      useProjectStore.getState();
    const asset = project.assets.find((a) => a.id === assetId);
    if (!asset) continue;

    const wantType: TrackType = asset.type === "audio" ? "audio" : "video";
    const explicitTrack = targetTrackId
      ? project.tracks.find(
          (t) => t.id === targetTrackId && t.type === wantType,
        )
      : undefined;
    const existingTrack =
      explicitTrack ?? project.tracks.find((t) => t.type === wantType);

    if (!existingTrack) {
      addTrack(wantType, nextTrackLabel(project.tracks, wantType));
    }

    const track =
      existingTrack ?? useProjectStore.getState().project.tracks.at(-1);
    if (!track) continue;

    if (!track.visible || track.muted) {
      updateTrack(track.id, { visible: true, muted: false });
    }

    const trackClips = Object.values(clips).filter(
      (c) => c.trackId === track.id,
    );
    const startTime = findFirstGap(trackClips, asset.duration);
    const clipId = generateId();

    addClip({
      id: clipId,
      trackId: track.id,
      assetId: asset.id,
      kind: "media",
      startTime,
      duration: asset.duration,
      inPoint: 0,
      outPoint: asset.duration,
    });

    lastClipId = clipId;
  }

  if (lastClipId) {
    useSelectionStore.getState().selectClip(lastClipId);
  }
}
