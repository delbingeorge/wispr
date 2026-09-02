import type { Command } from "./types";
import type { MediaClip } from "../types/projects";
import { useProjectStore } from "../stores/project-store";

export function createMoveCommand(
  clipId: string,
  fromStartTime: number,
  toStartTime: number,
): Command {
  return {
    execute: () =>
      useProjectStore.getState().updateClip(clipId, { startTime: toStartTime }),
    undo: () =>
      useProjectStore
        .getState()
        .updateClip(clipId, { startTime: fromStartTime }),
  };
}

export function createTrimCommand(
  clipId: string,
  before: Partial<MediaClip>,
  after: Partial<MediaClip>,
): Command {
  return {
    execute: () => useProjectStore.getState().updateClip(clipId, after),
    undo: () => useProjectStore.getState().updateClip(clipId, before),
  };
}

export function createDeleteCommand(clipId: string, clip: MediaClip): Command {
  return {
    execute: () => useProjectStore.getState().removeClip(clipId),
    undo: () => {
      useProjectStore.getState().addClip(clip);
    },
  };
}

export function createSplitCommand(
  clipId: string,
  splitTime: number,
  originalClip: MediaClip,
): Command {
  let rightClipId: string | null = null;

  return {
    execute: () => {
      useProjectStore.getState().splitClip(clipId, splitTime);
      const track = useProjectStore
        .getState()
        .project.tracks.find((t) => t.id === originalClip.trackId);
      if (track) {
        const clipIndex = track.clips.indexOf(clipId);
        rightClipId = track.clips[clipIndex + 1] ?? null;
      }
    },
    undo: () => {
      if (rightClipId) {
        useProjectStore.getState().removeClip(rightClipId);
      }
      useProjectStore.getState().updateClip(clipId, {
        startTime: originalClip.startTime,
        duration: originalClip.duration,
        inPoint: originalClip.inPoint,
        outPoint: originalClip.outPoint,
      });
    },
  };
}
