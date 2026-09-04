import { useEffect, useRef } from "react";
import { useProjectStore } from "../stores/project-store";
import { saveProject } from "../storage/project-storage";

export function useAutoSave() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = useProjectStore.subscribe(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const { project, clips } = useProjectStore.getState();

        saveProject({
          id: project.id,
          name: project.name,
          project,
          clips,
          savedAt: Date.now(),
        });
      }, 3000);
    });

    return () => {
      unsub();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}
