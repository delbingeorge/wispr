import { createFile, type MP4ArrayBuffer, type MP4Info } from "mp4box";

type VideoMetadata = {
  width: number;
  height: number;
  codec: string;
  duration: number;
};

export function extractMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const mp4boxFile = createFile();

    mp4boxFile.onReady = (info: MP4Info) => {
      const videoTrack = info.tracks.find((t) => t.type === "video");
      console.log("Video OBJ: ", videoTrack);

      if (!videoTrack || !videoTrack.video) {
        reject(new Error("No video track found"));
        return;
      }

      resolve({
        width: videoTrack.video.width,
        height: videoTrack.video.height,
        codec: videoTrack.codec,
        duration: videoTrack.duration / videoTrack.timescale,
      });
    };

    mp4boxFile.onError = (error: Error) => {
      reject(error);
    };

    file.arrayBuffer().then((buffer) => {
      const mp4Buffer = buffer as MP4ArrayBuffer;
      mp4Buffer.fileStart = 0;
      mp4boxFile.appendBuffer(mp4Buffer);
      mp4boxFile.flush();
    });
  });
}
