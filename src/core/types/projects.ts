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

type MediaClip = {
  id: string;
  trackId: string;
  assetId: string;
  kind: "media";
  startTime: number;
  duration: number;
  inPoint: number;
  outPoint: number;
};

type BaseOverlayProperties = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
};

type ShapeProperties = BaseOverlayProperties & {
  fill: string;
  stroke: string;
  strokeWidth: number;
};

type TextProperties = BaseOverlayProperties & {
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "bold";
  fill: string;
  textAlign: "left" | "center" | "right";
};

type ShapeType = "rectangle" | "ellipse" | "line" | "arrow";

type TextClip = {
  id: string;
  trackId: string;
  kind: "text";
  startTime: number;
  duration: number;
  text: string;
  properties: TextProperties;
};

type ShapeClip = {
  id: string;
  trackId: string;
  kind: "shape";
  shapeType: ShapeType;
  startTime: number;
  duration: number;
  properties: ShapeProperties;
};

type Clip = MediaClip | TextClip | ShapeClip;

export type {
  Resolution,
  MediaMetadata,
  AssetType,
  Asset,
  TrackType,
  Track,
  Project,
  MediaClip,
  BaseOverlayProperties,
  ShapeProperties,
  TextProperties,
  ShapeType,
  TextClip,
  ShapeClip,
  Clip,
};
