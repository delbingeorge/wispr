import { create } from "zustand";

type SelectionState = {
  selectedClipIds: Set<string>;
  selectClip: (clipId: string) => void;
  deselectAll: () => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedClipIds: new Set(),

  selectClip: (clipId) => set({ selectedClipIds: new Set([clipId]) }),

  deselectAll: () => set({ selectedClipIds: new Set() }),
}));
