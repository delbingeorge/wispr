import { useCallback, useState } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import { storeFileInOpfs } from "@/core/storage/opfs-storage";
import { generateId } from "@/core/utils/id-generator";
import { generateAssetThumbnails } from "@/core/webcodecs/thumbnail-generator";
import { detectMediaKind, probeMedia } from "@/core/utils/media-detect";
import type { Asset } from "@/core/types/projects";
import { toast } from "@/features/ui/toast-store";

async function importOneFile(file: File): Promise<string | null> {
  const kind = detectMediaKind(file);
  if (!kind) {
    toast.err(`Skipped ${file.name}`, "Unsupported file type");
    return null;
  }

  try {
    const info = await probeMedia(file);
    const assetId = generateId();
    const opfsPath = `${assetId}-${file.name}`;

    await storeFileInOpfs(file, opfsPath);

    const { addAsset } = useProjectStore.getState();

    const asset: Asset = {
      id: assetId,
      name: file.name.replace(/\.[^.]+$/, ""),
      fileName: file.name,
      type: kind,
      duration: info.duration,
      fileSize: file.size,
      opfsPath,
      metadata: {
        width: info.width,
        height: info.height,
        codec: info.codec,
      },
    };

    addAsset(asset);
    generateAssetThumbnails(asset);

    return assetId;
  } catch (err) {
    const detail =
      err instanceof Error ? err.message : "Could not read file";
    toast.err(`Failed to import ${file.name}`, detail);
    return null;
  }
}

export function useMediaImport() {
  const [busy, setBusy] = useState(false);

  const importFiles = useCallback(async (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    setBusy(true);
    try {
      const results = await Promise.all(list.map(importOneFile));
      const imported = results.filter((id): id is string => id !== null);
      if (imported.length > 0) {
        toast.ok(
          `Imported ${imported.length} file${imported.length > 1 ? "s" : ""}`,
          "Added to the asset library",
        );
      }
    } finally {
      setBusy(false);
    }
  }, []);

  return { importFiles, busy };
}
