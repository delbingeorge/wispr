import { useRef, useEffect, useCallback } from "react";
import { useProjectStore } from "../../core/stores/project-store";
import { usePlaybackStore } from "../../core/stores/playback-store";
import { useTimelineStore } from "../../core/stores/timeline-store";
import { useSelectionStore } from "../../core/stores/selection-store";
import { pixelToTime } from "../../core/utils/time-coordinate";
import { hitTest } from "./hit-test";
import { getThumbnail } from "../../core/webcodecs/thumbnail-generator";
import { TimelineRenderer, RULER_HEIGHT } from "./timeline-renderer";

const renderer = new TimelineRenderer();

type DragState = {
  clipId: string;
  region: "body" | "trimStart" | "trimEnd";
  startMouseX: number;
  originalStartTime: number;
  originalDuration: number;
  originalInPoint: number;
};

export function TimelineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dirtyRef = useRef(true);
  const rafRef = useRef<number>(0);
  const dragRef = useRef<DragState | null>(null);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  useEffect(() => {
    const unsubs = [
      useProjectStore.subscribe(markDirty),
      usePlaybackStore.subscribe(markDirty),
      useTimelineStore.subscribe(markDirty),
      useSelectionStore.subscribe(markDirty),
    ];
    return () => unsubs.forEach((fn) => fn());
  }, [markDirty]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * devicePixelRatio;
      canvas.height = rect.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
      dirtyRef.current = true;
    };

    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);

    const loop = () => {
      if (dirtyRef.current) {
        dirtyRef.current = false;
        const rect = canvas.getBoundingClientRect();
        ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

        renderer.render(ctx, {
          zoom: useTimelineStore.getState().zoom,
          scrollX: useTimelineStore.getState().scrollX,
          currentTime: usePlaybackStore.getState().currentTime,
          tracks: useProjectStore.getState().project.tracks,
          clips: useProjectStore.getState().clips,
          assetNames: useProjectStore
            .getState()
            .project.assets.reduce<Record<string, string>>(
              (acc, asset) => ({ ...acc, [asset.id]: asset.name }),
              {},
            ),
          selectedClipIds: useSelectionStore.getState().selectedClipIds,
          getThumbnail,
          width: rect.width,
          height: rect.height,
        });
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const { zoom, scrollX, setZoom, setScrollX } = useTimelineStore.getState();

    if (e.ctrlKey || e.metaKey) {
      const newZoom = Math.max(
        10,
        Math.min(1000, zoom * (1 - e.deltaY * 0.005)),
      );
      const rect = canvasRef.current!.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const timeAtMouse = (mouseX + scrollX) / zoom;
      const newScrollX = timeAtMouse * newZoom - mouseX;
      setZoom(newZoom);
      setScrollX(Math.max(0, newScrollX));
    } else {
      setScrollX(Math.max(0, scrollX + e.deltaX + e.deltaY));
    }
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const { zoom, scrollX } = useTimelineStore.getState();
    const { project, clips } = useProjectStore.getState();

    const result = hitTest(
      mouseX,
      mouseY,
      zoom,
      scrollX,
      project.tracks,
      clips,
    );

    if (result.type === "ruler") {
      usePlaybackStore.getState().setCurrentTime(result.time);
      useSelectionStore.getState().deselectAll();
    } else if (result.type === "clip") {
      useSelectionStore.getState().selectClip(result.clipId);

      const clip = clips[result.clipId];
      if (clip) {
        dragRef.current = {
          clipId: result.clipId,
          region: result.region,
          startMouseX: mouseX,
          originalStartTime: clip.startTime,
          originalDuration: clip.duration,
          originalInPoint: clip.inPoint,
        };
      }
    } else {
      useSelectionStore.getState().deselectAll();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (e.buttons !== 1) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const { zoom, scrollX } = useTimelineStore.getState();

    if (!dragRef.current) {
      if (mouseY <= RULER_HEIGHT) {
        const time = pixelToTime(mouseX, zoom, scrollX);
        usePlaybackStore.getState().setCurrentTime(Math.max(0, time));
      }
      return;
    }

    const deltaX = mouseX - dragRef.current.startMouseX;
    const deltaTime = deltaX / zoom;

    if (dragRef.current.region === "body") {
      const newStartTime = Math.max(
        0,
        dragRef.current.originalStartTime + deltaTime,
      );
      useProjectStore.getState().updateClip(dragRef.current.clipId, {
        startTime: newStartTime,
      });
    }

    if (dragRef.current.region === "trimStart") {
      const maxDelta = dragRef.current.originalDuration - 0.1;
      const clampedDelta = Math.max(
        -dragRef.current.originalInPoint,
        Math.min(maxDelta, deltaTime),
      );
      useProjectStore.getState().updateClip(dragRef.current.clipId, {
        startTime: dragRef.current.originalStartTime + clampedDelta,
        duration: dragRef.current.originalDuration - clampedDelta,
        inPoint: dragRef.current.originalInPoint + clampedDelta,
      });
    }

    if (dragRef.current.region === "trimEnd") {
      const clip = useProjectStore.getState().clips[dragRef.current.clipId];
      if (clip) {
        const asset = useProjectStore
          .getState()
          .project.assets.find((a) => a.id === clip.assetId);
        const maxDuration = asset
          ? asset.duration - clip.inPoint
          : clip.duration;
        const newDuration = Math.max(
          0.1,
          Math.min(maxDuration, dragRef.current.originalDuration + deltaTime),
        );
        useProjectStore.getState().updateClip(dragRef.current.clipId, {
          duration: newDuration,
          outPoint: clip.inPoint + newDuration,
        });
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
