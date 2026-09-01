type Resolution = {
  width: number;
  height: number;
};

type MediaMetadata = {
  width: number;
  height: number;
  codec: string;
  sampleRate?: number;
  channelCount?: number;
};

type AssetType = "video" | "audio" | "image";

type Asset = {
  id: string;
  name: string;
  fileName: string;
  type: string;
  duration: number;
  fileSize: number;
  opfsPath: string;
  metadata: MediaMetadata;
};

type TrackType = "video" | "audio" | "overlay";

type Track = {
  id: string;
  type: TrackType;
  label: string;
  clips: string[];
  muted: boolean;
  locked: boolean;
  visible: boolean;
};

type Project = {
  id: string;
  name: string;
  fps: number;
  tracks: Track[];
  assets: Asset[];
  createdAt: number;
  updatedAt: number;
};

export type {
  Resolution,
  MediaMetadata,
  AssetType,
  TrackType,
  Track,
  Project,
  Asset,
};
