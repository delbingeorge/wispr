import {
  createFile,
  type MP4ArrayBuffer,
  type MP4Info,
  type MP4Sample,
  type ISOFile,
  DataStream,
} from "mp4box";
import type { Clip, Track, Keyframe } from "../types/projects";
import { resolveProperty } from "../utils/keyframe-interpolation";

type ExportMessage = {
  type: "export";
  clips: Record<string, Clip>;
  tracks: Track[];
  assets: {
    id: string;
    opfsPath: string;
    duration: number;
    metadata: { width: number; height: number; codec: string };
  }[];
  resolution: { width: number; height: number };
  fps: number;
  bitrate: number;
  duration: number;
};

type AssetData = {
  samples: MP4Sample[];
  codec: string;
  width: number;
  height: number;
  description: Uint8Array;
};

function extractDescription(mp4boxFile: ISOFile, trackId: number): Uint8Array {
  const trak = mp4boxFile.getTrackById(trackId);
  const entries = trak.mdia.minf.stbl.stsd.entries;

  for (const entry of entries) {
    const box = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
    if (box) {
      const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
      box.write(stream);
      return new Uint8Array(stream.buffer, 8);
    }
  }

  throw new Error("No codec description found");
}

async function loadAssetSamples(opfsPath: string): Promise<{
  samples: MP4Sample[];
  codec: string;
  width: number;
  height: number;
  description: Uint8Array;
}> {
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle(opfsPath);
  const file = await handle.getFile();
  const arrayBuffer = await file.arrayBuffer();

  const mp4boxFile = createFile();
  const allSamples: MP4Sample[] = [];

  const result = await new Promise<{
    trackId: number;
    codec: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    let trackInfo: {
      trackId: number;
      codec: string;
      width: number;
      height: number;
    } | null = null;

    mp4boxFile.onReady = (info: MP4Info) => {
      const videoTrack = info.tracks.find((t) => t.type === "video");
      if (!videoTrack || !videoTrack.video) {
        reject(new Error("No video track"));
        return;
      }

      trackInfo = {
        trackId: videoTrack.id,
        codec: videoTrack.codec,
        width: videoTrack.video.width,
        height: videoTrack.video.height,
      };

      mp4boxFile.onSamples = (
        _trackId: number,
        _user: unknown,
        samples: MP4Sample[],
      ) => {
        allSamples.push(...samples);
      };

      mp4boxFile.setExtractionOptions(videoTrack.id, null, {
        nbSamples: 1000,
      });
      mp4boxFile.start();
    };

    mp4boxFile.onError = (error: Error) => reject(error);

    const mp4Buffer = arrayBuffer as MP4ArrayBuffer;
    mp4Buffer.fileStart = 0;
    mp4boxFile.appendBuffer(mp4Buffer);
    mp4boxFile.flush();

    setTimeout(() => {
      if (trackInfo) resolve(trackInfo);
      else reject(new Error("No track info after parse"));
    }, 200);
  });

  const description = extractDescription(mp4boxFile, result.trackId);

  return {
    samples: allSamples,
    codec: result.codec,
    width: result.width,
    height: result.height,
    description,
  };
}

function decodeFrameAtTime(
  samples: MP4Sample[],
  targetTimeMicro: number,
  codec: string,
  description: Uint8Array,
  codedWidth: number,
  codedHeight: number,
): Promise<VideoFrame | null> {
  return new Promise((resolve) => {
    let syncIndex = 0;
    for (let i = 0; i < samples.length; i++) {
      const sampleTime = (samples[i].cts * 1_000_000) / samples[i].timescale;
      if (sampleTime > targetTimeMicro) break;
      if (samples[i].is_sync) syncIndex = i;
    }

    let lastFrame: VideoFrame | null = null;

    const decoder = new VideoDecoder({
      output: (frame: VideoFrame) => {
        if (lastFrame) lastFrame.close();

        if (frame.timestamp <= targetTimeMicro) {
          lastFrame = frame;
        } else {
          frame.close();
        }
      },
      error: () => resolve(null),
    });

    decoder.configure({ codec, codedWidth, codedHeight, description });

    for (let i = syncIndex; i < samples.length; i++) {
      const sample = samples[i];
      const sampleTime = (sample.cts * 1_000_000) / sample.timescale;

      if (sampleTime > targetTimeMicro && i > syncIndex) break;

      decoder.decode(
        new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: sampleTime,
          duration: (sample.duration * 1_000_000) / sample.timescale,
          data: sample.data,
        }),
      );
    }

    decoder.flush().then(() => {
      decoder.close();
      resolve(lastFrame);
    });
  });
}

function resolveOverlayProps(
  properties: Record<string, unknown>,
  keyframes: Keyframe[],
  clipTime: number,
) {
  return {
    x: resolveProperty("x", properties.x as number, keyframes, clipTime),
    y: resolveProperty("y", properties.y as number, keyframes, clipTime),
    width: resolveProperty(
      "width",
      properties.width as number,
      keyframes,
      clipTime,
    ),
    height: resolveProperty(
      "height",
      properties.height as number,
      keyframes,
      clipTime,
    ),
    rotation: resolveProperty(
      "rotation",
      properties.rotation as number,
      keyframes,
      clipTime,
    ),
    opacity: resolveProperty(
      "opacity",
      properties.opacity as number,
      keyframes,
      clipTime,
    ),
  };
}

function drawOverlays(
  ctx: OffscreenCanvasRenderingContext2D,
  clips: Record<string, Clip>,
  tracks: Track[],
  currentTime: number,
) {
  const overlayClipIds = tracks
    .filter((t) => t.type === "overlay" && t.visible)
    .flatMap((t) => t.clips);

  for (const clipId of overlayClipIds) {
    const clip = clips[clipId];
    if (!clip) continue;
    if (clip.kind !== "text" && clip.kind !== "shape") continue;
    if (
      currentTime < clip.startTime ||
      currentTime > clip.startTime + clip.duration
    )
      continue;

    const clipTime = currentTime - clip.startTime;
    const base = clip.properties;
    const r = resolveOverlayProps(
      base as unknown as Record<string, unknown>,
      clip.keyframes ?? [],
      clipTime,
    );

    ctx.save();
    ctx.translate(r.x + r.width / 2, r.y + r.height / 2);
    ctx.rotate((r.rotation * Math.PI) / 180);
    ctx.globalAlpha = r.opacity;

    if (clip.kind === "text") {
      const fontSize = resolveProperty(
        "fontSize",
        clip.properties.fontSize,
        clip.keyframes ?? [],
        clipTime,
      );
      ctx.fillStyle = clip.properties.fill;
      ctx.font = `${clip.properties.fontWeight} ${fontSize}px ${clip.properties.fontFamily}`;
      ctx.textAlign = clip.properties.textAlign;
      ctx.textBaseline = "middle";
      const textX =
        clip.properties.textAlign === "left"
          ? -r.width / 2
          : clip.properties.textAlign === "right"
            ? r.width / 2
            : 0;
      ctx.fillText(clip.text, textX, 0, r.width);
    }

    if (clip.kind === "shape") {
      const strokeWidth = resolveProperty(
        "strokeWidth",
        clip.properties.strokeWidth,
        clip.keyframes ?? [],
        clipTime,
      );
      ctx.fillStyle = clip.properties.fill;
      ctx.strokeStyle = clip.properties.stroke;
      ctx.lineWidth = strokeWidth;

      console.log("Clips shapeType clicked:", clip.shapeType);
      switch (clip.shapeType) {
        case "rectangle":
          ctx.fillRect(-r.width / 2, -r.height / 2, r.width, r.height);
          if (strokeWidth > 0)
            ctx.strokeRect(-r.width / 2, -r.height / 2, r.width, r.height);
          break;
        case "ellipse":
          console.log("ellipse alwasy fks up pls wrk");
          ctx.beginPath();
          ctx.ellipse(0, 0, r.width / 2, r.height / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          if (strokeWidth > 0) ctx.stroke();
          break;
        case "line":
          ctx.beginPath();
          ctx.moveTo(-r.width / 2, 0);
          ctx.lineTo(r.width / 2, 0);
          ctx.stroke();
          break;
        case "arrow":
          ctx.beginPath();
          ctx.moveTo(-r.width / 2, 0);
          ctx.lineTo(r.width / 2, 0);
          ctx.stroke();
          const arrowSize = Math.min(12, r.width / 4);
          ctx.beginPath();
          ctx.moveTo(r.width / 2, 0);
          ctx.lineTo(r.width / 2 - arrowSize, -arrowSize / 2);
          ctx.lineTo(r.width / 2 - arrowSize, arrowSize / 2);
          ctx.closePath();
          ctx.fillStyle = clip.properties.stroke;
          ctx.fill();
          break;
      }
    }

    ctx.restore();
  }
}

function findActiveMediaClip(
  clips: Record<string, Clip>,
  tracks: Track[],
  time: number,
): Clip | null {
  for (const track of tracks) {
    if (track.type !== "video" || !track.visible) continue;
    for (const clipId of track.clips) {
      const clip = clips[clipId];
      if (!clip || clip.kind !== "media") continue;
      if (time >= clip.startTime && time < clip.startTime + clip.duration) {
        return clip;
      }
    }
  }
  return null;
}

async function runExport(data: ExportMessage) {
  console.log("cursor reached inside run export");
  const { clips, tracks, assets, resolution, fps, bitrate, duration } = data;
  const totalFrames = Math.ceil(duration * fps);
  const canvas = new OffscreenCanvas(resolution.width, resolution.height);
  const ctx = canvas.getContext("2d")!;

  const assetDataMap = new Map<string, AssetData>();

  self.postMessage({ type: "progress", percent: 0, phase: "loading" });

  for (const asset of assets) {
    const assetData = await loadAssetSamples(asset.opfsPath);
    assetDataMap.set(asset.id, assetData);
  }

  const encodedChunks: {
    data: ArrayBuffer;
    type: string;
    timestamp: number;
    duration: number;
  }[] = [];
  let encoderDescription: ArrayBuffer | null = null;

  const encoder = new VideoEncoder({
    output: (
      chunk: EncodedVideoChunk,
      metadata?: EncodedVideoChunkMetadata,
    ) => {
      if (metadata?.decoderConfig?.description) {
        encoderDescription = metadata.decoderConfig.description as ArrayBuffer;
      }

      const buffer = new ArrayBuffer(chunk.byteLength);
      chunk.copyTo(buffer);
      encodedChunks.push({
        data: buffer,
        type: chunk.type,
        timestamp: chunk.timestamp,
        duration: chunk.duration ?? 0,
      });
    },
    error: (err) => {
      self.postMessage({ type: "error", message: String(err) });
    },
  });

  encoder.configure({
    codec: "avc1.640028",
    width: resolution.width,
    height: resolution.height,
    bitrate,
    framerate: fps,
  });

  self.postMessage({ type: "progress", percent: 5, phase: "encoding" });

  for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
    const currentTime = frameIndex / fps;
    const timestampMicro = Math.round(frameIndex * (1_000_000 / fps));

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, resolution.width, resolution.height);

    const activeClip = findActiveMediaClip(clips, tracks, currentTime);

    if (activeClip && activeClip.kind === "media") {
      const assetData = assetDataMap.get(activeClip.assetId);
      if (assetData) {
        const sourceTime =
          activeClip.inPoint + (currentTime - activeClip.startTime);
        const sourceTimeMicro = sourceTime * 1_000_000;

        const decoded = await decodeFrameAtTime(
          assetData.samples,
          sourceTimeMicro,
          assetData.codec,
          assetData.description,
          assetData.width,
          assetData.height,
        );

        if (decoded) {
          ctx.drawImage(decoded, 0, 0, resolution.width, resolution.height);
          decoded.close();
        }
      }
    }

    drawOverlays(ctx, clips, tracks, currentTime);

const frame = new VideoFrame(canvas, { timestamp: timestampMicro });
    encoder.encode(frame, { keyFrame: frameIndex % (fps * 2) === 0 });
    frame.close();

    const percent = 5 + Math.round((frameIndex / totalFrames) * 90);
    if (frameIndex % fps === 0) {
      self.postMessage({ type: "progress", percent, phase: "encoding" });
    }
  }

  await encoder.flush();
  encoder.close();

  self.postMessage({ type: "progress", percent: 95, phase: "muxing" });

  const mp4File = createFile();
  const timescale = 90000;
  const sampleDuration = timescale / fps;

  const trackId = mp4File.addTrack({
    timescale,
    width: resolution.width,
    height: resolution.height,
    nb_samples: encodedChunks.length,
    codec: "avc1.640028",
    avcDecoderConfigRecord: encoderDescription ?? undefined,
  });

  console.log(trackId);

  for (const chunk of encodedChunks) {
    mp4File.addSample(trackId, chunk.data, {
      duration: sampleDuration,
      is_sync: chunk.type === "key",
    });
  }

  const stream = mp4File.getBuffer() as unknown as DataStream;
  const blob = new Blob([stream.buffer], { type: "video/mp4" });

  self.postMessage({ type: "complete", blob });
}

self.onmessage = (e: MessageEvent) => {
  if (e.data.type === "export") {
    runExport(e.data).catch((err) => {
      self.postMessage({ type: "error", message: String(err) });
    });
  }

  if (e.data.type === "cancel") {
    self.close();
  }
};
