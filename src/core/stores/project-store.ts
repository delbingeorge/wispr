import { create } from "zustand";
import type {
  Project,
  Asset,
  MediaClip,
  Clip,
  TrackType,
  Track,
} from "@/core/types/projects";
import { generateId } from "@/core/utils/id-generator";

type ProjectState = {
  project: Project;
  clips: Record<string, Clip>;
  addAsset: (asset: Asset) => void;
  addClip: (clip: Clip) => void;
  updateClip: (clipId: string, updates: Partial<Clip>) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  removeClip: (clipId: string) => void;
  addKeyframe: (clipId: string, keyframe: Keyframe) => void;
  removeKeyframe: (clipId: string, keyframeId: string) => void;
  addTrack: (type: TrackType, label: string) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  project: {
    id: generateId(),
    name: "Untitled Project",
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    tracks: [
      {
        id: generateId(),
        type: "video",
        label: "Video 1",
        clips: [],
        muted: false,
        locked: false,
        visible: true,
      },
    ],
    assets: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },

  clips: {},

  addAsset: (asset) =>
    set((state) => ({
      project: {
        ...state.project,
        assets: [...state.project.assets, asset],
        updatedAt: Date.now(),
      },
    })),

  addClip: (clip) =>
    set((state) => ({
      clips: { ...state.clips, [clip.id]: clip },
      project: {
        ...state.project,
        tracks: state.project.tracks.map((track) =>
          track.id === clip.trackId
            ? { ...track, clips: [...track.clips, clip.id] }
            : track,
        ),
        updatedAt: Date.now(),
      },
    })),

  updateClip: (clipId, updates) => {
    set((state) => ({
      clips: {
        ...state.clips,
        [clipId]: { ...state.clips[clipId], ...updates } as Clip,
      },
      project: {
        ...state.project,
        updatedAt: Date.now(),
      },
    }));
  },

  splitClip: (clipId, splitTime) =>
    set((state) => {
      const clip = state.clips[clipId];
      if (!clip || clip.kind !== "media") return state;

      if (
        splitTime <= clip.startTime ||
        splitTime >= clip.startTime + clip.duration
      )
        return state;

      const splitOffset = splitTime - clip.startTime;
      const newClipId = generateId();

      const leftClip: MediaClip = {
        ...clip,
        duration: splitOffset,
        outPoint: clip.inPoint + splitOffset,
      };

      const rightClip: MediaClip = {
        id: newClipId,
        trackId: clip.trackId,
        assetId: clip.assetId,
        kind: "media",
        startTime: splitTime,
        duration: clip.duration - splitOffset,
        inPoint: clip.inPoint + splitOffset,
        outPoint: clip.outPoint,
      };

      const newClips = {
        ...state.clips,
        [clipId]: leftClip,
        [newClipId]: rightClip,
      };

      const newTracks = state.project.tracks.map((track) => {
        if (track.id !== clip.trackId) return track;
        const clipIndex = track.clips.indexOf(clipId);
        const newClipIds = [...track.clips];
        newClipIds.splice(clipIndex + 1, 0, newClipId);
        return { ...track, clips: newClipIds };
      });

      return {
        clips: newClips,
        project: { ...state.project, tracks: newTracks, updatedAt: Date.now() },
      };
    }),

  removeClip: (clipId) =>
    set((state) => {
      const { [clipId]: removed, ...remainingClips } = state.clips;

      const newTracks = state.project.tracks.map((track) => ({
        ...track,
        clips: track.clips.filter((id) => id !== clipId),
      }));

      return {
        clips: remainingClips,
        project: { ...state.project, tracks: newTracks, updatedAt: Date.now() },
      };
    }),

  addTrack: (type, label) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: [
          ...state.project.tracks,
          {
            id: generateId(),
            type,
            label,
            clips: [],
            muted: false,
            locked: false,
            visible: true,
          },
        ],
        updatedAt: Date.now(),
      },
    })),

  removeTrack: (trackId) =>
    set((state) => {
      const trackClipIds =
        state.project.tracks.find((t) => t.id === trackId)?.clips ?? [];
      const remainingClips = { ...state.clips };
      for (const clipId of trackClipIds) {
        delete remainingClips[clipId];
      }

      return {
        clips: remainingClips,
        project: {
          ...state.project,
          tracks: state.project.tracks.filter((t) => t.id !== trackId),
          updatedAt: Date.now(),
        },
      };
    }),

  updateTrack: (trackId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === trackId ? { ...t, ...updates } : t,
        ),
        updatedAt: Date.now(),
      },
    })),

  addKeyframe: (clipId, keyframe) =>
    set((state) => {
      const clip = state.clips[clipId];
      if (!clip || clip.kind === "media") return state;

      const existing = clip.keyframes.filter(
        (kf) =>
          !(kf.property === keyframe.property && kf.time === keyframe.time),
      );

      return {
        clips: {
          ...state.clips,
          [clipId]: { ...clip, keyframes: [...existing, keyframe] } as Clip,
        },
        project: { ...state.project, updatedAt: Date.now() },
      };
    }),

  removeKeyframe: (clipId, keyframeId) =>
    set((state) => {
      const clip = state.clips[clipId];
      if (!clip || clip.kind === "media") return state;

      return {
        clips: {
          ...state.clips,
          [clipId]: {
            ...clip,
            keyframes: clip.keyframes.filter((kf) => kf.id !== keyframeId),
          } as Clip,
        },
        project: { ...state.project, updatedAt: Date.now() },
      };
    }),
}));
