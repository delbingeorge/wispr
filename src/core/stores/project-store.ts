import { create } from "zustand";
import type { Project, Asset, MediaClip } from "../types/projects";
import { generateId } from "../utils/id-generator";

type ProjectState = {
  project: Project;
  clips: Record<string, MediaClip>;
  addAsset: (asset: Asset) => void;
  addClip: (clip: MediaClip) => void;
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
}));
