import { create } from "zustand";
import type { Project, Asset } from "../types/projects";
import { generateId } from "../utils/id-generator";

type ProjectState = {
  project: Project;
  addAsset: (asset: Asset) => void;
};

export const useProjectStore = create<ProjectState>((set) => ({
  project: {
    id: generateId(),
    name: "Untitled Project",
    resolution: { width: 1920, height: 1080 },
    fps: 30,
    tracks: [],
    assets: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  addAsset: (asset) =>
    set((state) => ({
      project: {
        ...state.project,
        assets: [...state.project.assets, asset],
        updatedAt: Date.now(),
      },
    })),
}));
