import { useRef, useEffect, useCallback } from "react";
import { useProjectStore } from "../../core/stores/project-store";
import { usePlaybackStore } from "../../core/stores/playback-store";
import { useTimelineStore } from "../../core/stores/timeline-store";
import { pixelToTime } from "../../core/utils/time-coordinate";
import { TimelineRenderer, RULER_HEIGHT } from "./timeline-renderer";
import { getThumbnail } from "../../core/webcodecs/thumbnail-generator";

const renderer = new TimelineRenderer();

export function TimelineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dirtyRef = useRef(true);
  const rafRef = useRef<number>(0);

  const markDirty = useCallback(() => {
    dirtyRef.current = true;
  }, []);

  useEffect(() => {
    const unsubs = [
      useProjectStore.subscribe(markDirty),
      usePlaybackStore.subscribe(markDirty),
      useTimelineStore.subscribe(markDirty),
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
    const y = e.clientY - rect.top;

    if (y <= RULER_HEIGHT) {
      const { zoom, scrollX } = useTimelineStore.getState();
      const time = pixelToTime(e.clientX - rect.left, zoom, scrollX);
      usePlaybackStore.getState().setCurrentTime(Math.max(0, time));
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (e.buttons !== 1) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    if (y <= RULER_HEIGHT) {
      const { zoom, scrollX } = useTimelineStore.getState();
      const time = pixelToTime(e.clientX - rect.left, zoom, scrollX);
      usePlaybackStore.getState().setCurrentTime(Math.max(0, time));
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    />
  );
}
