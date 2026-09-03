import { useCallback } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { useSelectionStore } from "@/core/stores/selection-store";
import { generateId } from "@/core/utils/id-generator";
import type { TextClip, ShapeClip, Tool } from "../../core/types/projects";

export function useOverlayPlacement(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const activeTool = useSelectionStore.getState().activeTool;
      if (activeTool === "select") return;

      const rect = canvas.getBoundingClientRect();
      const { project } = useProjectStore.getState();

      const scaleX = project.resolution.width / rect.width;
      const scaleY = project.resolution.height / rect.height;
      const projectX = (e.clientX - rect.left) * scaleX;
      const projectY = (e.clientY - rect.top) * scaleY;

      const currentTime = usePlaybackStore.getState().currentTime;

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
        };
        useProjectStore.getState().addClip(clip);
      } else {
        const clip: ShapeClip = {
          id: clipId,
          trackId: overlayTrack.id,
          kind: "shape",
          shapeType: activeTool,
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
        };
        useProjectStore.getState().addClip(clip);
      }

      useSelectionStore.getState().selectClip(clipId);
      useSelectionStore.getState().setActiveTool("select");
    },
    [canvasRef],
  );

  return handleCanvasClick;
}
