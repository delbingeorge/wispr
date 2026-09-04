import { useState, useEffect } from "react";
import { useProjectStore } from "../stores/project-store";
import { loadProject } from "../storage/project-storage";
import type { Project, Clip } from "../types/projects";

async function verifyAssets(project: Project): Promise<string[]> {
  const missing: string[] = [];
  const root = await navigator.storage.getDirectory();

  for (const asset of project.assets) {
    try {
      await root.getFileHandle(asset.opfsPath);
    } catch {
      missing.push(asset.id);
    }
  }

  return missing;
}

export function useProjectLoader(projectId: string | null) {
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(false);
  const [missingAssets, setMissingAssets] = useState<string[]>([]);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      setFound(false);
      return;
    }

    loadProject(projectId)
      .then(async (saved) => {
        if (saved) {
          const project = saved.project as Project;

          useProjectStore.setState({
            project,
            clips: saved.clips as Record<string, Clip>,
          });

          const missing = await verifyAssets(project);
          setMissingAssets(missing);
          setFound(true);
        } else {
          setFound(false);
        }
      })
      .catch(() => {
        setFound(false);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  return { loading, found, missingAssets };
}
