import { create } from "zustand";

type Tool = "select" | "text" | "rectangle" | "ellipse" | "line" | "arrow";

type SelectionState = {
  selectedClipIds: Set<string>;
  activeTool: Tool;
  selectClip: (clipId: string) => void;
  deselectAll: () => void;
  setActiveTool: (tool: Tool) => void;
};

export const useSelectionStore = create<SelectionState>((set) => ({
  selectedClipIds: new Set(),
  activeTool: "select",

  selectClip: (clipId) => set({ selectedClipIds: new Set([clipId]) }),

  deselectAll: () => set({ selectedClipIds: new Set() }),

  setActiveTool: (tool) => set({ activeTool: tool }),
}));

export type { Tool };
