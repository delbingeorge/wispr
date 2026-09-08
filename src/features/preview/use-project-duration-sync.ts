import { useEffect } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { computeProjectDuration } from "@/core/utils/clip-lookup";

export function useProjectDurationSync() {
  useEffect(() => {
    const sync = () => {
      const { project, clips } = useProjectStore.getState();
      const duration = computeProjectDuration(clips, project.tracks);
      usePlaybackStore.getState().setDuration(duration);
    };

    sync();

    return useProjectStore.subscribe(sync);
  }, []);
}
