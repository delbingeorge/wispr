import type { Track } from "../../core/types/projects";
import { timeToPixel } from "../../core/utils/time-coordinate";
import { formatTime } from "../../core/utils/time-format";

const RULER_HEIGHT = 30;
const TRACK_HEIGHT = 60;
const TICK_INTERVALS = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
const MIN_TICK_SPACING = 60;

type RenderData = {
  zoom: number;
  scrollX: number;
  currentTime: number;
  tracks: Track[];
  width: number;
  height: number;
};

export class TimelineRenderer {
  render(ctx: CanvasRenderingContext2D, data: RenderData) {
    ctx.clearRect(0, 0, data.width, data.height);
    this.renderTrackLanes(ctx, data);
    this.renderRuler(ctx, data);
    this.renderPlayhead(ctx, data);
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
}

export { RULER_HEIGHT, TRACK_HEIGHT };
