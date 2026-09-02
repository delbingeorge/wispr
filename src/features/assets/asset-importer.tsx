import { useCallback, useRef } from "react";
import { useProjectStore } from "../../core/stores/project-store.ts";
import { usePlaybackStore } from "../../core/stores/playback-store.ts";
import { extractMetadata } from "../../core/webcodecs/demuxer";
import { storeFileInOpfs } from "../../core/storage/opfs-storage";
import { generateId } from "../../core/utils/id-generator";
import { generateThumbnails } from "../../core/webcodecs/thumbnail-generator.ts";

export function AssetImporter() {
  const addAsset = useProjectStore((s) => s.addAsset);
  const addClip = useProjectStore((s) => s.addClip);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dirtyTimeline = useCallback(() => {
    usePlaybackStore
      .getState()
      .setCurrentTime(usePlaybackStore.getState().currentTime);
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      const assetId = generateId();
      const opfsPath = `${assetId}-${file.name}`;

      const metadata = await extractMetadata(file);
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

      const thumbnailCount = Math.max(1, Math.ceil(metadata.duration / 2));
      const timestamps = Array.from(
        { length: thumbnailCount },
        (_, i) => (i / thumbnailCount) * metadata.duration,
      );

      generateThumbnails(assetId, opfsPath, timestamps, 160, 90, dirtyTimeline);
    },
    [addAsset, addClip, dirtyTimeline],
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
