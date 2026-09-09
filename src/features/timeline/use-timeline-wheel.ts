import { useEffect } from "react";
import type { RefObject } from "react";
import { useTimelineStore } from "@/core/stores/timeline-store";
import { useProjectStore } from "@/core/stores/project-store";
import { RULER_HEIGHT, getMaxScrollY } from "./track-layout";
import {
  clampZoom,
  getMaxScrollX,
  getTimelineDuration,
} from "./timeline-extent";

export function useTimelineWheel(
  targetRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const onWheel = (e: WheelEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const { zoom, scrollX, scrollY, setZoom, setScrollX, setScrollY } =
        useTimelineStore.getState();
      const { project, clips } = useProjectStore.getState();
      const rect = canvas.getBoundingClientRect();
      const timelineDuration = getTimelineDuration(clips, project.tracks);

      const clampScrollX = (value: number, zoomLevel: number) =>
        Math.max(
          0,
          Math.min(value, getMaxScrollX(timelineDuration, zoomLevel, rect.width)),
        );

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newZoom = clampZoom(zoom * (1 - e.deltaY * 0.005));
        const mouseX = e.clientX - rect.left;
        const timeAtMouse = (mouseX + scrollX) / zoom;
        setZoom(newZoom);
        setScrollX(clampScrollX(timeAtMouse * newZoom - mouseX, newZoom));
        return;
      }

      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        setScrollX(
          clampScrollX(scrollX + (e.shiftKey ? e.deltaY : e.deltaX), zoom),
        );
        return;
      }

      const maxY = getMaxScrollY(project.tracks, rect.height - RULER_HEIGHT);
      if (maxY > 0) {
        e.preventDefault();
        setScrollY(Math.max(0, Math.min(maxY, scrollY + e.deltaY)));
      }
    };

    target.addEventListener("wheel", onWheel, { passive: false });
    return () => target.removeEventListener("wheel", onWheel);
  }, [targetRef, canvasRef]);
}
