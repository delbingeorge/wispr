declare module "mp4box" {
  interface MP4Track {
    id: number;
    type: "video" | "audio";
    codec: string;
    duration: number;
    timescale: number;
    nb_samples: number;
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

  interface MP4Sample {
    data: Uint8Array;
    cts: number;
    dts: number;
    duration: number;
    is_sync: boolean;
    timescale: number;
    size: number;
  }

  interface MP4ArrayBuffer extends ArrayBuffer {
    fileStart: number;
  }

  interface ISOFile {
    onReady: ((info: MP4Info) => void) | null;
    onError: ((error: Error) => void) | null;
    onSamples: (
      trackId: number,
      user: unknown,
      samples: MP4Sample[],
    ) => void | null;
    appendBuffer: (buffer: MP4ArrayBuffer) => void;
    flush: () => void;
    setExtractionOptions: (
      trackId: number,
      user?: unknown,
      options?: { nbSamples?: number },
    ) => void;
    start: () => void;
    getTrackById: (trackId: number) => MP4BoxTrack;
  }

  interface MP4BoxEntry {
    avcC?: MP4Box;
    hvcC?: MP4Box;
    vpcC?: MP4Box;
    av1C?: MP4Box;
  }

  interface MP4Box {
    write: (stream: DataStream) => void;
  }

  interface MP4BoxTrack {
    mdia: {
      minf: {
        stbl: {
          stsd: {
            entries: MP4BoxEntry[];
          };
        };
      };
    };
  }

  interface DataStream {
    buffer: ArrayBuffer;
  }

  interface DataStreamConstructor {
    new (
      buffer?: ArrayBuffer,
      byteOffset?: number,
      endianness?: boolean,
    ): DataStream;
    BIG_ENDIAN: boolean;
  }

  const DataStream: DataStreamConstructor;

  function createFile(): ISOFile;

  export {
    createFile,
    DataStream,
    MP4Info,
    MP4Track,
    MP4Sample,
    MP4ArrayBuffer,
    ISOFile,
  };
}
