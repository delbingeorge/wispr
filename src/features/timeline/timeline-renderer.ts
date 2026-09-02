import type { Track } from "@/core/types/projects";
import type { MediaClip } from "@/core/types/projects";
import { timeToPixel } from "@/core/utils/time-coordinate";
import { formatTime } from "@/core/utils/time-format";

const RULER_HEIGHT = 30;
const TRACK_HEIGHT = 60;
const CLIP_MARGIN = 2;
const CLIP_RADIUS = 4;
const TICK_INTERVALS = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
const MIN_TICK_SPACING = 60;

type RenderData = {
  zoom: number;
  scrollX: number;
  currentTime: number;
  tracks: Track[];
  clips: Record<string, MediaClip>;
  assetNames: Record<string, string>;
  width: number;
  height: number;
  snapLine: number | null;
  getThumbnail: (assetId: string, timestamp: number) => ImageBitmap | null;
  selectedClipIds: Set<string>;
};

export class TimelineRenderer {
  render(ctx: CanvasRenderingContext2D, data: RenderData) {
    ctx.clearRect(0, 0, data.width, data.height);
    this.renderTrackLanes(ctx, data);
    this.renderClips(ctx, data);
    this.renderRuler(ctx, data);
    this.renderPlayhead(ctx, data);
    this.renderSnapLine(ctx, data);
  }

  private renderTrackLanes(ctx: CanvasRenderingContext2D, data: RenderData) {
    for (let i = 0; i < data.tracks.length; i++) {
      const y = RULER_HEIGHT + i * TRACK_HEIGHT;
      ctx.fillStyle = i % 2 === 0 ? "#1e1e1e" : "#242424";
      ctx.fillRect(0, y, data.width, TRACK_HEIGHT);

      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(0, y + TRACK_HEIGHT - 1, data.width, 1);
    }
  }

  private renderClips(ctx: CanvasRenderingContext2D, data: RenderData) {
    for (let i = 0; i < data.tracks.length; i++) {
      const track = data.tracks[i];
      const trackY = RULER_HEIGHT + i * TRACK_HEIGHT;

      for (const clipId of track.clips) {
        const clip = data.clips[clipId];
        if (!clip) continue;

        const x = timeToPixel(clip.startTime, data.zoom, data.scrollX);
        const width = clip.duration * data.zoom;

        if (x + width < 0 || x > data.width) continue;

        const y = trackY + CLIP_MARGIN;
        const height = TRACK_HEIGHT - CLIP_MARGIN * 2;

        ctx.save();
        this.roundRect(ctx, x, y, width, height, CLIP_RADIUS);
        ctx.clip();

        ctx.fillStyle = "#3a5a3a";
        ctx.fillRect(x, y, width, height);

        this.renderThumbnails(ctx, clip, data, x, y, width, height);

        ctx.restore();

        ctx.strokeStyle = "#4a7a4a";
        ctx.lineWidth = 1;
        this.roundRect(ctx, x, y, width, height, CLIP_RADIUS);
        ctx.stroke();

        if (data.selectedClipIds.has(clipId)) {
          ctx.strokeStyle = "#e8e44f";
          ctx.lineWidth = 2;
          this.roundRect(ctx, x, y, width, height, CLIP_RADIUS);
          ctx.stroke();
        }

        const name = data.assetNames[clip.assetId] ?? "";
        const textPadding = 8;
        const maxTextWidth = width - textPadding * 2;

        if (maxTextWidth > 20) {
          ctx.fillStyle = "#e0e0e0";
          ctx.font = "11px Inter, system-ui, sans-serif";
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.clip();
          ctx.fillText(name, x + textPadding, y + height / 2);
          ctx.restore();
        }
      }
    }
  }

  private renderThumbnails(
    ctx: CanvasRenderingContext2D,
    clip: MediaClip,
    data: RenderData,
    clipX: number,
    clipY: number,
    clipWidth: number,
    clipHeight: number,
  ) {
    const thumbWidth = (clipHeight / 9) * 16;
    const thumbCount = Math.ceil(clipWidth / thumbWidth);

    for (let i = 0; i < thumbCount; i++) {
      const drawX = clipX + i * thumbWidth;
      const sourceTime = clip.inPoint + (i / thumbCount) * clip.duration;

      const bitmap = data.getThumbnail(clip.assetId, sourceTime);
      if (bitmap) {
        ctx.drawImage(bitmap, drawX, clipY, thumbWidth, clipHeight);
      }
    }
  }

  private renderRuler(ctx: CanvasRenderingContext2D, data: RenderData) {
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, data.width, RULER_HEIGHT);

    ctx.fillStyle = "#3a3a3a";
    ctx.fillRect(0, RULER_HEIGHT - 1, data.width, 1);

    const tickInterval = this.pickTickInterval(data.zoom);
    const subTicks = 4;

    const startTime =
      Math.floor(data.scrollX / data.zoom / tickInterval) * tickInterval;
    const endTime = (data.scrollX + data.width) / data.zoom;

    for (let time = startTime; time <= endTime; time += tickInterval) {
      const x = timeToPixel(time, data.zoom, data.scrollX);

      if (x < 0 || x > data.width) continue;

      ctx.strokeStyle = "#555555";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, RULER_HEIGHT - 12);
      ctx.lineTo(Math.round(x) + 0.5, RULER_HEIGHT - 1);
      ctx.stroke();

      ctx.fillStyle = "#888888";
      ctx.font = "10px Inter, system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(formatTime(time), Math.round(x), RULER_HEIGHT - 15);

      const subInterval = tickInterval / subTicks;
      for (let s = 1; s < subTicks; s++) {
        const subX = timeToPixel(
          time + s * subInterval,
          data.zoom,
          data.scrollX,
        );
        if (subX < 0 || subX > data.width) continue;

        ctx.strokeStyle = "#3a3a3a";
        ctx.beginPath();
        ctx.moveTo(Math.round(subX) + 0.5, RULER_HEIGHT - 6);
        ctx.lineTo(Math.round(subX) + 0.5, RULER_HEIGHT - 1);
        ctx.stroke();
      }
    }
  }

  private renderPlayhead(ctx: CanvasRenderingContext2D, data: RenderData) {
    const x = timeToPixel(data.currentTime, data.zoom, data.scrollX);

    if (x < 0 || x > data.width) return;

    ctx.strokeStyle = "#e8e44f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.round(x), 0);
    ctx.lineTo(Math.round(x), data.height);
    ctx.stroke();

    ctx.fillStyle = "#e8e44f";
    ctx.beginPath();
    ctx.arc(Math.round(x), RULER_HEIGHT, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private pickTickInterval(zoom: number): number {
    for (const interval of TICK_INTERVALS) {
      if (interval * zoom >= MIN_TICK_SPACING) {
        return interval;
      }
    }
    return TICK_INTERVALS[TICK_INTERVALS.length - 1];
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  }

  private renderSnapLine(ctx: CanvasRenderingContext2D, data: RenderData) {
    if (data.snapLine === null) return;

    const x = timeToPixel(data.snapLine, data.zoom, data.scrollX);
    if (x < 0 || x > data.width) return;

    ctx.strokeStyle = "#e8e44f";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + 0.5, RULER_HEIGHT);
    ctx.lineTo(Math.round(x) + 0.5, data.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export { RULER_HEIGHT, TRACK_HEIGHT };
