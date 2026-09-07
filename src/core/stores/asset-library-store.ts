import { create } from "zustand";
import type { AssetType } from "@/core/types/projects";

type AssetLibraryFilter = AssetType | "all";

type AssetLibraryState = {
  isOpen: boolean;
  targetTrackId: string | null;
  initialFilter: AssetLibraryFilter;
  open: (options?: {
    targetTrackId?: string;
    filter?: AssetLibraryFilter;
  }) => void;
  close: () => void;
};

export const useAssetLibraryStore = create<AssetLibraryState>((set) => ({
  isOpen: false,
  targetTrackId: null,
  initialFilter: "all",
  open: (options) =>
    set({
      isOpen: true,
      targetTrackId: options?.targetTrackId ?? null,
      initialFilter: options?.filter ?? "all",
    }),
  close: () => set({ isOpen: false, targetTrackId: null }),
}));

export type { AssetLibraryFilter };
