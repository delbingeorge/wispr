export type MediaKind = "video" | "audio" | "image";

export type MediaInfo = {
  kind: MediaKind;
  duration: number;
  width: number;
  height: number;
  codec: string;
};

const DEFAULT_IMAGE_DURATION = 5;

const probeVideo = (file: File): Promise<MediaInfo> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    const cleanup = () => URL.revokeObjectURL(url);

    v.onloadedmetadata = () => {
      const info: MediaInfo = {
        kind: "video",
        duration: Number.isFinite(v.duration) ? v.duration : 0,
        width: v.videoWidth,
        height: v.videoHeight,
        codec: file.type.split("/")[1] ?? "unknown",
      };
      cleanup();
      resolve(info);
    };
    v.onerror = () => {
      cleanup();
      reject(new Error(`Could not read video: ${file.name}`));
    };

    v.src = url;
  });

const probeAudio = (file: File): Promise<MediaInfo> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("audio");
    a.preload = "metadata";
    const cleanup = () => URL.revokeObjectURL(url);

    a.onloadedmetadata = () => {
      const info: MediaInfo = {
        kind: "audio",
        duration: Number.isFinite(a.duration) ? a.duration : 0,
        width: 0,
        height: 0,
        codec: file.type.split("/")[1] ?? "unknown",
      };
      cleanup();
      resolve(info);
    };
    a.onerror = () => {
      cleanup();
      reject(new Error(`Could not read audio: ${file.name}`));
    };

    a.src = url;
  });

const probeImage = (file: File): Promise<MediaInfo> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    const cleanup = () => URL.revokeObjectURL(url);

    img.onload = () => {
      const info: MediaInfo = {
        kind: "image",
        duration: DEFAULT_IMAGE_DURATION,
        width: img.naturalWidth,
        height: img.naturalHeight,
        codec: file.type.split("/")[1] ?? "unknown",
      };
      cleanup();
      resolve(info);
    };
    img.onerror = () => {
      cleanup();
      reject(new Error(`Could not read image: ${file.name}`));
    };

    img.src = url;
  });

export function detectMediaKind(file: File): MediaKind | null {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("image/")) return "image";
  return null;
}

export function probeMedia(file: File): Promise<MediaInfo> {
  const kind = detectMediaKind(file);
  if (!kind) return Promise.reject(new Error(`Unsupported file: ${file.name}`));
  if (kind === "video") return probeVideo(file);
  if (kind === "audio") return probeAudio(file);
  return probeImage(file);
}
