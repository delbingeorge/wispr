import {
  createFile,
  DataStream,
  type MP4Info,
  type MP4Sample,
  type MP4ArrayBuffer,
} from "mp4box";

type GenerateMessage = {
  type: "generate";
  opfsPath: string;
  timestamps: number[];
  width: number;
  height: number;
};

function extractDescription(
  file: ReturnType<typeof createFile>,
  trackId: number,
): Uint8Array {
  const trak = file.getTrackById(trackId);
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

async function generateThumbnails(data: GenerateMessage) {
  const root = await navigator.storage.getDirectory();
  const handle = await root.getFileHandle(data.opfsPath);
  const file = await handle.getFile();
  const arrayBuffer = await file.arrayBuffer();

  const mp4boxFile = createFile();
  const allSamples: MP4Sample[] = [];

  const samplesReady = new Promise<{
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

      mp4boxFile.setExtractionOptions(videoTrack.id, null, { nbSamples: 1000 });
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

  const trackInfo = await samplesReady;

  const description = extractDescription(mp4boxFile, trackInfo.trackId);
  const canvas = new OffscreenCanvas(data.width, data.height);
  const ctx = canvas.getContext("2d")!;

  for (const targetTime of data.timestamps) {
    const targetTimeMicro = targetTime * 1_000_000;

    let syncIndex = 0;
    for (let i = 0; i < allSamples.length; i++) {
      const sampleTime =
        (allSamples[i].cts * 1_000_000) / allSamples[i].timescale;
      if (sampleTime > targetTimeMicro) break;
      if (allSamples[i].is_sync) syncIndex = i;
    }

    const decoded = await decodeSingleFrame(
      allSamples,
      syncIndex,
      targetTimeMicro,
      trackInfo.codec,
      description,
      trackInfo.width,
      trackInfo.height,
    );

    if (decoded) {
      ctx.drawImage(decoded, 0, 0, data.width, data.height);
      decoded.close();

      const bitmap = await createImageBitmap(canvas);
      self.postMessage(
        { type: "thumbnail", timestamp: targetTime, bitmap },
        { transfer: [bitmap] },
      );
    }
  }

  self.postMessage({ type: "complete" });
}

function decodeSingleFrame(
  samples: MP4Sample[],
  startIndex: number,
  targetTimeMicro: number,
  codec: string,
  description: Uint8Array,
  codedWidth: number,
  codedHeight: number,
): Promise<VideoFrame | null> {
  return new Promise((resolve) => {
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

    decoder.configure({
      codec,
      codedWidth,
      codedHeight,
      description,
    });

    for (let i = startIndex; i < samples.length; i++) {
      const sample = samples[i];
      const sampleTime = (sample.cts * 1_000_000) / sample.timescale;

      if (sampleTime > targetTimeMicro && i > startIndex) break;

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

self.onmessage = (e: MessageEvent<GenerateMessage>) => {
  if (e.data.type === "generate") {
    generateThumbnails(e.data).catch((err) => {
      self.postMessage({ type: "error", message: String(err) });
    });
  }
};
