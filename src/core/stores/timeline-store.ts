import { create } from "zustand";

type TimelineState = {
  zoom: number;
  scrollX: number;
  scrollY: number;
  setZoom: (zoom: number) => void;
  setScrollX: (scrollX: number) => void;
  setScrollY: (scrollY: number) => void;
};

export const useTimelineStore = create<TimelineState>((set) => ({
  zoom: 100,
  scrollX: 0,
  scrollY: 0,
  setZoom: (zoom) => set({ zoom }),
  setScrollX: (scrollX) => set({ scrollX }),
  setScrollY: (scrollY) => set({ scrollY }),
}));
