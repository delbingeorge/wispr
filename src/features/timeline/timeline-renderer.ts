import type { Clip, Track, Keyframe, MediaClip } from "@/core/types/projects";
import { timeToPixel } from "@/core/utils/time-coordinate";
import { formatTime } from "@/core/utils/time-format";
import {
  RULER_HEIGHT,
  getTrackLayout,
  PLAYHEAD_GRIP_TOP,
  PLAYHEAD_GRIP_WIDTH,
  PLAYHEAD_GRIP_HEIGHT,
  type TrackLayoutEntry,
} from "./track-layout";
import { generateWaveformBars } from "./waveform";
import { getCanvasIcon, type CanvasIconKey } from "./canvas-icon-cache";

const TICK_INTERVALS = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
const MIN_TICK_SPACING = 150;
const MINOR_DIVISORS = [12, 6, 5, 4, 2, 1];
const MIN_SUBTICK_SPACING = 12;
const ACCENT = "#e8e44f";
const INK = "#ece5e4";

type RenderData = {
  zoom: number;
  scrollX: number;
  scrollY: number;
  currentTime: number;
  tracks: Track[];
  clips: Record<string, Clip>;
  assetNames: Record<string, string>;
  width: number;
  height: number;
  snapLine: number | null;
  getThumbnail: (assetId: string, timestamp: number) => ImageBitmap | null;
  selectedClipIds: Set<string>;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export class TimelineRenderer {
  render(ctx: CanvasRenderingContext2D, data: RenderData) {
    ctx.clearRect(0, 0, data.width, data.height);
    const layout = getTrackLayout(data.tracks);

    ctx.save();
    ctx.beginPath();
    ctx.rect(
      0,
      RULER_HEIGHT,
      data.width,
      Math.max(0, data.height - RULER_HEIGHT),
    );
    ctx.clip();
    this.renderTrackLanes(ctx, data, layout);
    this.renderClips(ctx, data, layout);
    ctx.restore();

    this.renderRuler(ctx, data);
    this.renderPlayhead(ctx, data);
    this.renderSnapLine(ctx, data);
  }

  private renderTrackLanes(
    ctx: CanvasRenderingContext2D,
    data: RenderData,
    layout: TrackLayoutEntry[],
  ) {
    const lanesTop = RULER_HEIGHT - data.scrollY;

    const grad = ctx.createLinearGradient(0, 0, data.width, 0);
    grad.addColorStop(0.012, "#302a2b");
    grad.addColorStop(0.099, "#332a2b");
    grad.addColorStop(0.248, "#372d2d");
    grad.addColorStop(0.413, "#392c2d");
    grad.addColorStop(0.578, "#362d2d");
    grad.addColorStop(0.743, "#302c2d");
    grad.addColorStop(0.867, "#2d2b2c");
    grad.addColorStop(0.988, "#2b292c");
    ctx.fillStyle = grad;
    ctx.fillRect(
      0,
      RULER_HEIGHT,
      data.width,
      Math.max(0, data.height - RULER_HEIGHT),
    );

    for (const entry of layout) {
      const y = lanesTop + entry.top;
      ctx.fillStyle =
        entry.track.type === "video"
          ? "rgba(255,255,255,.028)"
          : "rgba(255,255,255,.014)";
      this.roundRect(ctx, 0, y, data.width, entry.height, 8);
      ctx.fill();
    }
  }

  private renderClips(
    ctx: CanvasRenderingContext2D,
    data: RenderData,
    layout: TrackLayoutEntry[],
  ) {
    for (const entry of layout) {
      const track = entry.track;
      ctx.globalAlpha = track.visible ? 1 : 0.32;

      const trackY = RULER_HEIGHT + entry.top - data.scrollY;

      for (const clipId of track.clips) {
        const clip = data.clips[clipId];
        if (!clip) continue;

        const x = timeToPixel(clip.startTime, data.zoom, data.scrollX);
        const width = Math.max(8, clip.duration * data.zoom);
        if (x + width < 0 || x > data.width) continue;

        const selected = data.selectedClipIds.has(clipId);

        if (clip.kind === "media") {
          if (track.type === "audio") {
            this.renderMediaOnAudio(
              ctx,
              clip,
              data,
              x,
              trackY,
              width,
              entry.height,
              selected,
              track.muted,
            );
          } else {
            this.renderMediaOnVideo(
              ctx,
              clip,
              data,
              x,
              trackY,
              width,
              entry.height,
              selected,
            );
          }
        } else {
          this.renderOverlayClip(
            ctx,
            clip,
            data,
            x,
            trackY,
            width,
            entry.height,
            selected,
          );
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  private renderMediaOnVideo(
    ctx: CanvasRenderingContext2D,
    clip: MediaClip,
    data: RenderData,
    x: number,
    y: number,
    width: number,
    height: number,
    selected: boolean,
  ) {
    this.roundRect(ctx, x, y, width, height, 13);
    ctx.fillStyle = selected ? ACCENT : "rgba(255,255,255,.055)";
    ctx.fill();

    const padV = 3.3;
    const padH = 11;
    const innerX = x + padH;
    const innerY = y + padV;
    const innerWidth = Math.max(0, width - padH * 2);
    const innerHeight = Math.max(0, height - padV * 2);

    if (innerWidth > 0 && innerHeight > 0) {
      ctx.save();
      this.roundRect(ctx, innerX, innerY, innerWidth, innerHeight, 6.5);
      ctx.clip();
      this.renderThumbnails(
        ctx,
        clip,
        data,
        innerX,
        innerY,
        innerWidth,
        innerHeight,
      );
      ctx.restore();
    }

    this.renderClipLabel(ctx, data.assetNames[clip.assetId] ?? "", x, y, width);
    this.renderTrimHandles(ctx, x, y, height);
  }

  private renderClipLabel(
    ctx: CanvasRenderingContext2D,
    name: string,
    clipX: number,
    clipY: number,
    clipWidth: number,
  ) {
    if (!name) return;

    ctx.font = "9px Inter, system-ui, sans-serif";
    const paddingX = 6;
    const textWidth = ctx.measureText(name).width;
    const maxChipWidth = Math.max(0, clipWidth - 15 - 6);
    const chipWidth = Math.min(textWidth + paddingX * 2, maxChipWidth);
    if (chipWidth <= paddingX * 2) return;

    const chipX = clipX + 15;
    const chipY = clipY + 6;
    const chipHeight = 15;

    this.roundRect(ctx, chipX, chipY, chipWidth, chipHeight, 4);
    ctx.fillStyle = "rgba(16,14,14,.62)";
    ctx.fill();

    ctx.save();
    ctx.beginPath();
    ctx.rect(chipX, chipY, chipWidth, chipHeight);
    ctx.clip();
    ctx.fillStyle = "#fff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(name, chipX + paddingX, chipY + chipHeight / 2);
    ctx.restore();
  }

  private renderTrimHandles(
    ctx: CanvasRenderingContext2D,
    clipX: number,
    clipY: number,
    clipHeight: number,
  ) {
    const handleWidth = 2.6;
    const handleHeight = 14;
    const handleY = clipY + (clipHeight - handleHeight) / 2;

    ctx.fillStyle = "rgba(255,255,255,.5)";
    this.roundRect(
      ctx,
      clipX - handleWidth / 2,
      handleY,
      handleWidth,
      handleHeight,
      1.3,
    );
    ctx.fill();
  }

  private renderMediaOnAudio(
    ctx: CanvasRenderingContext2D,
    clip: MediaClip,
    data: RenderData,
    x: number,
    y: number,
    width: number,
    height: number,
    selected: boolean,
    muted: boolean,
  ) {
    const radius = height / 2;
    this.roundRect(ctx, x, y, width, height, radius);
    if (selected) {
      ctx.fillStyle = "rgba(238,255,136,.22)";
    } else {
      const grad = ctx.createLinearGradient(x, 0, x + width, 0);
      grad.addColorStop(0, "rgba(255,255,255,.035)");
      grad.addColorStop(0.8, "rgba(255,255,255,.012)");
      grad.addColorStop(1, "rgba(255,255,255,.003)");
      ctx.fillStyle = grad;
    }
    ctx.fill();

    const badgeRadius = 10.75;
    const badgeInset = 10;
    const badgeCx = x + badgeInset + badgeRadius;
    const badgeCy = y + height / 2;
    const waveLeft = x + badgeInset + badgeRadius * 2 + 20;
    const waveRight = x + width - 14;

    if (badgeCx + badgeRadius <= x + width) {
      ctx.beginPath();
      ctx.arc(badgeCx, badgeCy, badgeRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.07)";
      ctx.fill();

      const iconSize = 15;
      const bitmap = getCanvasIcon("music", INK, iconSize);
      if (bitmap) {
        ctx.drawImage(
          bitmap,
          badgeCx - iconSize / 2,
          badgeCy - iconSize / 2,
          iconSize,
          iconSize,
        );
      }
    }

    const waveWidth = waveRight - waveLeft;
    if (waveWidth > 4) {
      this.renderWaveform(
        ctx,
        clip,
        data,
        waveLeft,
        y,
        waveWidth,
        height,
        selected,
        muted,
      );
    }
  }

  private renderWaveform(
    ctx: CanvasRenderingContext2D,
    clip: MediaClip,
    data: RenderData,
    waveX: number,
    clipY: number,
    waveWidth: number,
    clipHeight: number,
    selected: boolean,
    muted: boolean,
  ) {
    const bars = generateWaveformBars(clip.id, clip.duration, data.zoom);
    const playedFrac = muted
      ? 0
      : clamp((data.currentTime - clip.startTime) / clip.duration, 0, 1);
    const litColor = selected ? "#2c2d19" : ACCENT;
    const unlitColor = selected
      ? "rgba(30,28,10,.32)"
      : "rgba(255,255,255,.26)";

    for (const bar of bars) {
      const barX = waveX + bar.xFrac * waveWidth;
      const barWidth = Math.max(0.6, bar.widthFrac * waveWidth);
      const barHeight = bar.amplitudeFrac * clipHeight;
      const barY = clipY + (clipHeight - barHeight) / 2;
      const radius = Math.min(1, barWidth / 2, barHeight / 2);

      ctx.fillStyle = bar.xFrac < playedFrac ? litColor : unlitColor;
      this.roundRect(ctx, barX, barY, barWidth, barHeight, radius);
      ctx.fill();
    }
  }

  private renderOverlayClip(
    ctx: CanvasRenderingContext2D,
    clip: Extract<Clip, { kind: "text" | "shape" }>,
    data: RenderData,
    x: number,
    y: number,
    width: number,
    height: number,
    selected: boolean,
  ) {
    this.roundRect(ctx, x, y, width, height, 9);
    ctx.fillStyle = selected
      ? "rgba(238,255,136,.22)"
      : "rgba(126,142,255,.20)";
    ctx.fill();

    this.roundRect(ctx, x + 0.5, y + 0.5, width - 1, height - 1, 8.5);
    ctx.strokeStyle = selected ? ACCENT : "rgba(126,142,255,.36)";
    ctx.lineWidth = 1;
    ctx.stroke();

    const iconKey: CanvasIconKey | null =
      clip.kind === "text"
        ? "type"
        : clip.shapeType === "rectangle"
          ? "shape-square"
          : clip.shapeType === "ellipse"
            ? "shape-circle"
            : clip.shapeType === "line"
              ? "shape-line"
              : clip.shapeType === "arrow"
                ? "shape-arrow"
                : null;

    const iconSize = 13;
    let textX = x + 11;

    if (iconKey) {
      const bitmap = getCanvasIcon(iconKey, INK, iconSize);
      if (bitmap) {
        ctx.drawImage(
          bitmap,
          x + 11,
          y + (height - iconSize) / 2,
          iconSize,
          iconSize,
        );
      }
      textX = x + 11 + iconSize + 7;
    }

    const name = clip.kind === "text" ? clip.text || "Text" : clip.shapeType;
    const maxTextWidth = x + width - 13 - textX;

    if (maxTextWidth > 10) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();
      ctx.fillStyle = INK;
      ctx.font = "9.3px Inter, system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(name, textX, y + height / 2);
      ctx.restore();
    }

    if (clip.keyframes?.length) {
      this.renderKeyframeDiamonds(ctx, clip.keyframes, x, y, height, data.zoom);
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
    const grad = ctx.createLinearGradient(0, 0, data.width, 0);
    grad.addColorStop(0.012, "#372e2f");
    grad.addColorStop(0.099, "#3a2f2e");
    grad.addColorStop(0.248, "#403130");
    grad.addColorStop(0.413, "#423131");
    grad.addColorStop(0.578, "#3d3131");
    grad.addColorStop(0.743, "#352e31");
    grad.addColorStop(0.867, "#312f30");
    grad.addColorStop(0.988, "#2f2c2f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, data.width, RULER_HEIGHT);

    ctx.fillStyle = "rgba(255,255,255,.045)";
    ctx.fillRect(0, RULER_HEIGHT - 1, data.width, 1);

    const major = this.pickMajorInterval(data.zoom);
    const divisor =
      MINOR_DIVISORS.find(
        (d) => (major / d) * data.zoom >= MIN_SUBTICK_SPACING,
      ) ?? 1;
    const minor = major / divisor;

    const startN = Math.max(0, Math.ceil(data.scrollX / data.zoom / minor));
    const safetyLimit = startN + 100000;

    for (let n = startN; n < safetyLimit; n++) {
      const t = Math.round(n * minor * 1000) / 1000;
      const x = timeToPixel(t, data.zoom, data.scrollX);
      if (x > data.width + 1) break;

      const onMajor = n % divisor === 0;
      const tickTop = onMajor ? 7 : 9.5;
      const tickBottom = onMajor ? 18 : 16;

      ctx.strokeStyle = onMajor
        ? "rgba(255,255,255,.70)"
        : "rgba(255,255,255,.20)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, tickTop);
      ctx.lineTo(Math.round(x) + 0.5, tickBottom);
      ctx.stroke();

      if (onMajor) {
        ctx.fillStyle = INK;
        ctx.font = "9.5px Inter, system-ui, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.fillText(formatTime(t), Math.round(x) + 5, 12.5);
      }
    }
  }

  private renderPlayhead(ctx: CanvasRenderingContext2D, data: RenderData) {
    const x = timeToPixel(data.currentTime, data.zoom, data.scrollX);

    if (x < 0 || x > data.width) return;

    const lineX = Math.round(x);

    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(lineX, 6);
    ctx.lineTo(lineX, data.height);
    ctx.stroke();

    ctx.fillStyle = ACCENT;
    ctx.beginPath();
    ctx.arc(lineX, 9.65, 3.25, 0, Math.PI * 2);
    ctx.fill();

    this.roundRect(
      ctx,
      lineX - PLAYHEAD_GRIP_WIDTH / 2,
      PLAYHEAD_GRIP_TOP,
      PLAYHEAD_GRIP_WIDTH,
      PLAYHEAD_GRIP_HEIGHT,
      PLAYHEAD_GRIP_WIDTH / 2,
    );
    ctx.fillStyle = ACCENT;
    ctx.fill();

    const dotRadius = 1.3;
    const dotGap = 6;
    const dotSpacing = dotRadius * 2 + dotGap;
    const dotsHeight = dotRadius * 2 * 3 + dotGap * 2;
    const firstDotY =
      PLAYHEAD_GRIP_TOP + (PLAYHEAD_GRIP_HEIGHT - dotsHeight) / 2 + dotRadius;

    ctx.fillStyle = "#221f10";
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(lineX, firstDotY + i * dotSpacing, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderKeyframeDiamonds(
    ctx: CanvasRenderingContext2D,
    keyframes: Keyframe[],
    clipX: number,
    clipY: number,
    clipHeight: number,
    zoom: number,
  ) {
    const seen = new Set<number>();

    for (const kf of keyframes) {
      if (seen.has(kf.time)) continue;
      seen.add(kf.time);

      const x = clipX + kf.time * zoom;
      const y = clipY + clipHeight - 8;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = ACCENT;
      ctx.fillRect(-3.5, -3.5, 7, 7);
      ctx.strokeStyle = "rgba(20,18,10,.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(-3.5, -3.5, 7, 7);
      ctx.restore();
    }
  }

  private pickMajorInterval(zoom: number): number {
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
    const radius = Math.max(0, Math.min(r, w / 2, h / 2));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  private renderSnapLine(ctx: CanvasRenderingContext2D, data: RenderData) {
    if (data.snapLine === null) return;

    const x = timeToPixel(data.snapLine, data.zoom, data.scrollX);
    if (x < 0 || x > data.width) return;

    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(Math.round(x) + 0.5, RULER_HEIGHT);
    ctx.lineTo(Math.round(x) + 0.5, data.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
