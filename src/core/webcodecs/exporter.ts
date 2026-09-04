type ExportCallbacks = {
  onProgress: (percent: number, phase: string) => void;
  onComplete: (blob: Blob) => void;
  onError: (message: string) => void;
};

let worker: Worker | null = null;

export function startExport(
  data: {
    clips: Record<string, unknown>;
    tracks: unknown[];
    assets: unknown[];
    resolution: { width: number; height: number };
    fps: number;
    bitrate: number;
    duration: number;
  },
  callbacks: ExportCallbacks,
) {
  if (worker) {
    worker.terminate();
  }

  worker = new Worker(new URL("../workers/export-worker.ts", import.meta.url), {
    type: "module",
  });

  worker.onmessage = (e: MessageEvent) => {
    if (e.data.type === "progress") {
      callbacks.onProgress(e.data.percent, e.data.phase);
    }

    if (e.data.type === "complete") {
      callbacks.onComplete(e.data.blob);
      worker?.terminate();
      worker = null;
    }

    if (e.data.type === "error") {
      callbacks.onError(e.data.message);
      worker?.terminate();
      worker = null;
    }
  };

  worker.postMessage({ type: "export", ...data });
}

export function cancelExport() {
  if (worker) {
    worker.postMessage({ type: "cancel" });
    worker.terminate();
    worker = null;
  }
}
