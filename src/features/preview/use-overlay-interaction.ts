import { useCallback, useRef } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { useSelectionStore } from "@/core/stores/selection-store";
import { hitTestOverlays, type ResizeHandle } from "./overlay-hit-test";
import { generateId } from "../../core/utils/id-generator";
import type { TextClip, ShapeClip, ShapeType } from "../../core/types/projects";

type DragState = {
  type: "move" | "resize" | "rotate";
  clipId: string;
  startMouseX: number;
  startMouseY: number;
  originalX: number;
  originalY: number;
  originalWidth: number;
  originalHeight: number;
  originalRotation: number;
  handle?: ResizeHandle;
};

export function useOverlayInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const dragRef = useRef<DragState | null>(null);

  const toProjectCoords = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const { project } = useProjectStore.getState();
      const scaleX = project.resolution.width / rect.width;
      const scaleY = project.resolution.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
        scaleX,
        scaleY,
      };
    },
    [canvasRef],
  );

  const getOverlayClipIds = useCallback(() => {
    const { project } = useProjectStore.getState();
    return project.tracks
      .filter((t) => t.type === "overlay")
      .flatMap((t) => t.clips);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = toProjectCoords(e);
      if (!coords) return;

      const activeTool = useSelectionStore.getState().activeTool;

      if (activeTool !== "select") {
        handlePlacement(coords.x, coords.y);
        return;
      }

      const { clips } = useProjectStore.getState();
      const currentTime = usePlaybackStore.getState().currentTime;
      const overlayClipIds = getOverlayClipIds();

      const hit = hitTestOverlays(
        coords.x,
        coords.y,
        clips,
        overlayClipIds,
        currentTime,
      );

      if (hit.type === "none") {
        useSelectionStore.getState().deselectAll();
        return;
      }

      useSelectionStore.getState().selectClip(hit.clipId);
      const clip = clips[hit.clipId];
      if (!clip || clip.kind === "media") return;

      const p = clip.properties;

      dragRef.current = {
        type:
          hit.type === "body"
            ? "move"
            : hit.type === "resize"
              ? "resize"
              : "rotate",
        clipId: hit.clipId,
        startMouseX: coords.x,
        startMouseY: coords.y,
        originalX: p.x,
        originalY: p.y,
        originalWidth: p.width,
        originalHeight: p.height,
        originalRotation: p.rotation,
        handle: hit.type === "resize" ? hit.handle : undefined,
      };
    },
    [toProjectCoords, getOverlayClipIds],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.buttons !== 1 || !dragRef.current) return;

      const coords = toProjectCoords(e);
      if (!coords) return;

      const drag = dragRef.current;
      const dx = coords.x - drag.startMouseX;
      const dy = coords.y - drag.startMouseY;

      if (drag.type === "move") {
        useProjectStore.getState().updateClip(drag.clipId, {
          properties: {
            ...(
              useProjectStore.getState().clips[drag.clipId] as
                TextClip | ShapeClip
            ).properties,
            x: drag.originalX + dx,
            y: drag.originalY + dy,
          },
        } as any);
      }

      if (drag.type === "resize" && drag.handle) {
        let newX = drag.originalX;
        let newY = drag.originalY;
        let newW = drag.originalWidth;
        let newH = drag.originalHeight;

        if (drag.handle === "se") {
          newW = Math.max(20, drag.originalWidth + dx);
          newH = Math.max(20, drag.originalHeight + dy);
        } else if (drag.handle === "sw") {
          newX = drag.originalX + dx;
          newW = Math.max(20, drag.originalWidth - dx);
          newH = Math.max(20, drag.originalHeight + dy);
        } else if (drag.handle === "ne") {
          newY = drag.originalY + dy;
          newW = Math.max(20, drag.originalWidth + dx);
          newH = Math.max(20, drag.originalHeight - dy);
        } else if (drag.handle === "nw") {
          newX = drag.originalX + dx;
          newY = drag.originalY + dy;
          newW = Math.max(20, drag.originalWidth - dx);
          newH = Math.max(20, drag.originalHeight - dy);
        }

        useProjectStore.getState().updateClip(drag.clipId, {
          properties: {
            ...(
              useProjectStore.getState().clips[drag.clipId] as
                TextClip | ShapeClip
            ).properties,
            x: newX,
            y: newY,
            width: newW,
            height: newH,
          },
        } as any);
      }

      if (drag.type === "rotate") {
        const clip = useProjectStore.getState().clips[drag.clipId];
        if (!clip || clip.kind === "media") return;
        const p = clip.properties;
        const cx = p.x + p.width / 2;
        const cy = p.y + p.height / 2;
        const angle =
          Math.atan2(coords.y - cy, coords.x - cx) * (180 / Math.PI) + 90;

        useProjectStore.getState().updateClip(drag.clipId, {
          properties: { ...p, rotation: angle },
        } as any);
      }
    },
    [toProjectCoords],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const handlePlacement = useCallback((projectX: number, projectY: number) => {
    const activeTool = useSelectionStore.getState().activeTool;
    const currentTime = usePlaybackStore.getState().currentTime;
    const { project } = useProjectStore.getState();

    let overlayTrack = project.tracks.find((t) => t.type === "overlay");
    if (!overlayTrack) {
      useProjectStore.getState().addTrack("overlay", "Overlay");
      overlayTrack = useProjectStore
        .getState()
        .project.tracks.find((t) => t.type === "overlay")!;
    }

    const clipId = generateId();

    if (activeTool === "text") {
      const clip: TextClip = {
        id: clipId,
        trackId: overlayTrack.id,
        kind: "text",
        startTime: currentTime,
        duration: 5,
        text: "Text",
        properties: {
          x: projectX - 100,
          y: projectY - 20,
          width: 200,
          height: 40,
          rotation: 0,
          opacity: 1,
          fontFamily: "Inter",
          fontSize: 32,
          fontWeight: "normal",
          fill: "#ffffff",
          textAlign: "center",
        },
        keyframes: [],
      };
      useProjectStore.getState().addClip(clip);
    } else {
      const clip: ShapeClip = {
        id: clipId,
        trackId: overlayTrack.id,
        kind: "shape",
        shapeType: activeTool as ShapeType,
        startTime: currentTime,
        duration: 5,
        properties: {
          x: projectX - 75,
          y: projectY - 75,
          width: 150,
          height: 150,
          rotation: 0,
          opacity: 1,
          fill: "#ffffff33",
          stroke: "#ffffff",
          strokeWidth: 2,
        },
        keyframes: [],
      };
      useProjectStore.getState().addClip(clip);
    }

    useSelectionStore.getState().selectClip(clipId);
    useSelectionStore.getState().setActiveTool("select");
  }, []);

  return { handleMouseDown, handleMouseMove, handleMouseUp };
}
