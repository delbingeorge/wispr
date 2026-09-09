import { useEffect } from "react";
import { useSelectionStore } from "@/core/stores/selection-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { useHistoryStore } from "@/core/stores/history-store";
import { useAssetLibraryStore } from "@/core/stores/asset-library-store";
import {
  deleteSelectedClips,
  splitClipAtTime,
} from "@/core/commands/clip-commands";
import { zoomIn, zoomOut, zoomToFit } from "./timeline-view-actions";

export function useTimelineKeyboard() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      const { selectedClipIds } = useSelectionStore.getState();

      const { undo, redo } = useHistoryStore.getState();

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

      if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        useAssetLibraryStore.getState().open();
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
        splitClipAtTime(
          [...selectedClipIds][0],
          usePlaybackStore.getState().currentTime,
        );
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        deleteSelectedClips();
      }

      if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        zoomIn();
      }

      if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        zoomOut();
      }

      if (e.key === "0") zoomToFit();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
