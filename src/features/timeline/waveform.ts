type WaveformBar = {
  xFrac: number;
  widthFrac: number;
  amplitudeFrac: number;
};

function waveSeed(id: string): number {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function generateWaveformBars(
  clipId: string,
  durationSec: number,
  pxPerSec: number,
): WaveformBar[] {
  const bars = Math.max(8, Math.round((durationSec * pxPerSec) / 5));
  const out: WaveformBar[] = [];
  let seed = waveSeed(clipId);

  for (let i = 0; i < bars; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const amplitudeFrac = 0.18 + ((seed % 1000) / 1000) * 0.78;
    out.push({
      xFrac: i / bars,
      widthFrac: (1 / bars) * 0.55,
      amplitudeFrac,
    });
  }

  return out;
}
