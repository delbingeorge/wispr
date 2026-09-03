import { useEffect } from "react";
import { useSelectionStore } from "@/core/stores/selection-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { useProjectStore } from "@/core/stores/project-store";
import { useHistoryStore } from "@/core/stores/history-store";
import {
  createSplitCommand,
  createDeleteCommand,
} from "@/core/commands/clip-commands";
import { gc } from "@/core/utils/logger";

export function useTimelineKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const { selectedClipIds } = useSelectionStore.getState();
      gc.log("selected clid ids", selectedClipIds);

      const { dispatch, undo, redo } = useHistoryStore.getState();

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        usePlaybackStore.getState().togglePlayback();
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const { currentTime } = usePlaybackStore.getState();
        const step = e.shiftKey ? 5 : 1;
        usePlaybackStore
          .getState()
          .setCurrentTime(Math.max(0, currentTime - step));
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const { currentTime, duration } = usePlaybackStore.getState();
        const step = e.shiftKey ? 5 : 1;
        usePlaybackStore
          .getState()
          .setCurrentTime(Math.min(duration, currentTime + step));
        return;
      }

      if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
        if (selectedClipIds.size !== 1) return;
        const clipId = [...selectedClipIds][0];
        const clip = useProjectStore.getState().clips[clipId];

        if (!clip) return;

        const currentTime = usePlaybackStore.getState().currentTime;
        if (
          currentTime <= clip.startTime ||
          currentTime >= clip.startTime + clip.duration
        )
          return;
        dispatch(createSplitCommand(clipId, currentTime, { ...clip }));
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedClipIds.size === 0) return;

        const { clips } = useProjectStore.getState();
        for (const clipId of selectedClipIds) {
          const clip = clips[clipId];
          if (clip) {
            dispatch(createDeleteCommand(clipId, { ...clip }));
          }
        }
        useSelectionStore.getState().deselectAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
