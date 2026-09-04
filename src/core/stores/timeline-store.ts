import { create } from "zustand";

type TimelineState = {
  zoom: number;
  scrollX: number;
  setZoom: (zoom: number) => void;
  setScrollX: (scrollX: number) => void;
};

export const useTimelineStore = create<TimelineState>((set) => ({
  zoom: 100,
  scrollX: 0,
  setZoom: (zoom) => set({ zoom }),
  setScrollX: (scrollX) => set({ scrollX }),
}));
