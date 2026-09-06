import { useEffect } from "react";
import type { RefObject } from "react";
import { useTimelineStore } from "@/core/stores/timeline-store";
import { useProjectStore } from "@/core/stores/project-store";
import { RULER_HEIGHT, getMaxScrollY } from "./track-layout";

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

      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const newZoom = Math.max(
          10,
          Math.min(1000, zoom * (1 - e.deltaY * 0.005)),
        );
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const timeAtMouse = (mouseX + scrollX) / zoom;
        const newScrollX = timeAtMouse * newZoom - mouseX;
        setZoom(newZoom);
        setScrollX(Math.max(0, newScrollX));
        return;
      }

      if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        setScrollX(Math.max(0, scrollX + (e.shiftKey ? e.deltaY : e.deltaX)));
        return;
      }

      const tracks = useProjectStore.getState().project.tracks;
      const rect = canvas.getBoundingClientRect();
      const maxY = getMaxScrollY(tracks, rect.height - RULER_HEIGHT);
      if (maxY > 0) {
        e.preventDefault();
        setScrollY(Math.max(0, Math.min(maxY, scrollY + e.deltaY)));
      }
    };

    target.addEventListener("wheel", onWheel, { passive: false });
    return () => target.removeEventListener("wheel", onWheel);
  }, [targetRef, canvasRef]);
}
