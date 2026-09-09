import { DEFAULT_ZOOM, useTimelineStore } from "@/core/stores/timeline-store";
import { useProjectStore } from "@/core/stores/project-store";
import { clampZoom, getFitZoom, getTimelineDuration } from "./timeline-extent";

const ZOOM_STEP = 1.5;

function zoomBy(factor: number) {
  const { zoom, setZoom } = useTimelineStore.getState();
  setZoom(clampZoom(zoom * factor));
}

export function zoomIn() {
  zoomBy(ZOOM_STEP);
}

export function zoomOut() {
  zoomBy(1 / ZOOM_STEP);
}

export function zoomToFit() {
  const { viewportWidth, setZoom, setScrollX } = useTimelineStore.getState();
  const { project, clips } = useProjectStore.getState();

  setZoom(getFitZoom(getTimelineDuration(clips, project.tracks), viewportWidth));
  setScrollX(0);
}

export function resetTimelineView() {
  const { setZoom, setScrollX, setScrollY } = useTimelineStore.getState();

  setZoom(DEFAULT_ZOOM);
  setScrollX(0);
  setScrollY(0);
}
