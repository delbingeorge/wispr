import { useCallback, useRef } from "react";
import { storeFileInOpfs } from "../../core/storage/opfs-storage";
import { generateId } from "../../core/utils/id-generator";
import { useProjectStore } from "../../core/stores/project-store";
import { extractMetadata } from "../../core/webcodecs/demuxer";

export function AssetImporter() {
  const addAsset = useProjectStore((s) => s.addAsset);
  const addClip = useProjectStore((s) => s.addClip);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      const assetId = generateId();
      const opfsPath = `${assetId}-${file.name}`;

      const metadata = await extractMetadata(file);
      console.log(metadata);

      await storeFileInOpfs(file, opfsPath);

      addAsset({
        id: assetId,
        name: file.name.replace(/\.[^.]+$/, ""),
        fileName: file.name,
        type: "video",
        duration: metadata.duration,
        fileSize: file.size,
        opfsPath,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          codec: metadata.codec,
        },
      });
      const { project, clips } = useProjectStore.getState();
      const videoTrack = project.tracks.find((t) => t.type === "video");

      if (!videoTrack) return;

      const existingClips = Object.values(clips).filter(
        (c) => c.trackId === videoTrack.id,
      );

      const startTime = existingClips.reduce(
        (max, c) => Math.max(max, c.startTime + c.duration),
        0,
      );

      addClip({
        id: generateId(),
        trackId: videoTrack.id,
        assetId,
        kind: "media",
        startTime,
        duration: metadata.duration,
        inPoint: 0,
        outPoint: metadata.duration,
      });
    },
    [addAsset, addClip],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      files
        .filter((file) => file.type.startsWith("video/"))
        .forEach((file) => handleFile(file));
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      files.forEach((file) => handleFile(file));
    },
    [handleFile],
  );

  return (
    <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={handleClick}>
      <p>Drop a video to start</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4"
        multiple
        onChange={handleInputChange}
      />
    </div>
  );
}
