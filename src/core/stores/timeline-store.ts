import { create } from "zustand";

export const DEFAULT_ZOOM = 100;

type TimelineState = {
  zoom: number;
  scrollX: number;
  scrollY: number;
  viewportWidth: number;
  setZoom: (zoom: number) => void;
  setScrollX: (scrollX: number) => void;
  setScrollY: (scrollY: number) => void;
  setViewportWidth: (viewportWidth: number) => void;
};

export const useTimelineStore = create<TimelineState>((set) => ({
  zoom: DEFAULT_ZOOM,
  scrollX: 0,
  scrollY: 0,
  viewportWidth: 0,
  setZoom: (zoom) => set({ zoom }),
  setScrollX: (scrollX) => set({ scrollX }),
  setScrollY: (scrollY) => set({ scrollY }),
  setViewportWidth: (viewportWidth) => set({ viewportWidth }),
}));
