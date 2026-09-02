import { useEffect } from "react";
import { useSelectionStore } from "../../core/stores/selection-store";
import { usePlaybackStore } from "../../core/stores/playback-store";
import { useProjectStore } from "../../core/stores/project-store";

export function useTimelineKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { selectedClipIds } = useSelectionStore.getState();

      if (e.key === "s" && !e.ctrlKey && !e.metaKey) {
        if (selectedClipIds.size !== 1) return;
        const clipId = [...selectedClipIds][0];
        const currentTime = usePlaybackStore.getState().currentTime;
        useProjectStore.getState().splitClip(clipId, currentTime);
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedClipIds.size === 0) return;
        const { removeClip } = useProjectStore.getState();
        for (const clipId of selectedClipIds) {
          removeClip(clipId);
        }
        useSelectionStore.getState().deselectAll();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
