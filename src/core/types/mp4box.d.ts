declare module "mp4box" {
  interface MP4Track {
    id: number;
    type: "video" | "audio";
    codec: string;
    duration: number;
    timescale: number;
    video?: {
      width: number;
      height: number;
    };
  }

  interface MP4Info {
    duration: number;
    timescale: number;
    tracks: MP4Track[];
  }

  interface MP4ArrayBuffer extends ArrayBuffer {
    fileStart: number;
  }

  interface ISOFile {
    onReady: ((info: MP4Info) => void) | null;
    onError: ((error: Error) => void) | null;
    appendBuffer: (buffer: MP4ArrayBuffer) => void;
    flush: () => void;
  }

  function createFile(): ISOFile;

  export { createFile, MP4Info, MP4Track, MP4ArrayBuffer, ISOFile };
}
