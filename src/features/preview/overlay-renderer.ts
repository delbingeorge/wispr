import type {
  Clip,
  TextClip,
  ShapeClip,
  Keyframe,
} from "@/core/types/projects";
import { resolveProperty } from "@/core/utils/keyframe-interpolation";
import { HANDLE_SIZE, ROTATE_OFFSET } from "./overlay-hit-test";
import { gc } from "the-good-console";

type ResolvedProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
};

function resolveOverlayProps(
  properties: Record<string, unknown>,
  keyframes: Keyframe[],
  clipTime: number,
): ResolvedProps {
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

export function renderOverlays(
  ctx: CanvasRenderingContext2D,
  clips: Record<string, Clip>,
  trackClipIds: string[],
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number,
  projectWidth: number,
  projectHeight: number,
  selectedClipId: string | null,
) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const scaleX = canvasWidth / projectWidth;
  const scaleY = canvasHeight / projectHeight;

  ctx.save();
  ctx.scale(scaleX, scaleY);

  for (const clipId of trackClipIds) {
    const clip = clips[clipId];
    if (!clip) continue;
    if (clip.kind !== "text" && clip.kind !== "shape") continue;
    if (
      currentTime < clip.startTime ||
      currentTime > clip.startTime + clip.duration
    )
      continue;

    const clipTime = currentTime - clip.startTime;

    if (clip.kind === "text") {
      renderTextClip(ctx, clip, clipTime);
    } else if (clip.kind === "shape") {
      renderShapeClip(ctx, clip, clipTime);
    }

    if (clipId === selectedClipId) {
      renderHandles(ctx, clip, clipTime);
    }
  }

  ctx.restore();
}

function renderHandles(
  ctx: CanvasRenderingContext2D,
  clip: TextClip | ShapeClip,
  clipTime: number,
) {
  const r = resolveOverlayProps(
    clip.properties as unknown as Record<string, unknown>,
    clip.keyframes,
    clipTime,
  );
  const cx = r.x + r.width / 2;
  const cy = r.y + r.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((r.rotation * Math.PI) / 180);

  ctx.strokeStyle = "#e8e44f";
  ctx.lineWidth = 1.5;
  ctx.setLineDash([]);
  ctx.strokeRect(-r.width / 2, -r.height / 2, r.width, r.height);

  const corners = [
    { x: -r.width / 2, y: -r.height / 2 },
    { x: r.width / 2, y: -r.height / 2 },
    { x: -r.width / 2, y: r.height / 2 },
    { x: r.width / 2, y: r.height / 2 },
  ];

  ctx.fillStyle = "#e8e44f";
  for (const corner of corners) {
    ctx.fillRect(
      corner.x - HANDLE_SIZE / 2,
      corner.y - HANDLE_SIZE / 2,
      HANDLE_SIZE,
      HANDLE_SIZE,
    );
  }

  ctx.beginPath();
  ctx.moveTo(0, -r.height / 2);
  ctx.lineTo(0, -r.height / 2 - ROTATE_OFFSET);
  ctx.strokeStyle = "#e8e44f";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, -r.height / 2 - ROTATE_OFFSET, 5, 0, Math.PI * 2);
  ctx.fillStyle = "#e8e44f";
  ctx.fill();

  ctx.restore();
}

function renderTextClip(
  ctx: CanvasRenderingContext2D,
  clip: TextClip,
  clipTime: number,
) {
  const base = clip.properties;
  const r = resolveOverlayProps(
    base as unknown as Record<string, unknown>,
    clip.keyframes,
    clipTime,
  );
  const fontSize = resolveProperty(
    "fontSize",
    base.fontSize,
    clip.keyframes,
    clipTime,
  );

  ctx.save();
  ctx.translate(r.x + r.width / 2, r.y + r.height / 2);
  ctx.rotate((r.rotation * Math.PI) / 180);
  ctx.globalAlpha = r.opacity;

  ctx.fillStyle = base.fill;
  ctx.font = `${base.fontWeight} ${fontSize}px ${base.fontFamily}`;
  ctx.textAlign = base.textAlign;
  ctx.textBaseline = "middle";

  const textX =
    base.textAlign === "left"
      ? -r.width / 2
      : base.textAlign === "right"
        ? r.width / 2
        : 0;
  ctx.fillText(clip.text, textX, 0, r.width);

  ctx.restore();
}

function renderShapeClip(
  ctx: CanvasRenderingContext2D,
  clip: ShapeClip,
  clipTime: number,
) {
  const base = clip.properties;
  const r = resolveOverlayProps(
    base as unknown as Record<string, unknown>,
    clip.keyframes,
    clipTime,
  );
  const strokeWidth = resolveProperty(
    "strokeWidth",
    base.strokeWidth,
    clip.keyframes,
    clipTime,
  );

  ctx.save();
  ctx.translate(r.x + r.width / 2, r.y + r.height / 2);
  ctx.rotate((r.rotation * Math.PI) / 180);
  ctx.globalAlpha = r.opacity;

  ctx.fillStyle = base.fill;
  ctx.strokeStyle = base.stroke;
  ctx.lineWidth = strokeWidth;

  switch (clip.shapeType) {
    case "rectangle":
      ctx.fillRect(-r.width / 2, -r.height / 2, r.width, r.height);
      if (strokeWidth > 0) {
        ctx.strokeRect(-r.width / 2, -r.height / 2, r.width, r.height);
      }
      break;

    case "ellipse":
      gc.log("ell pressed");
      ctx.beginPath();
      ctx.ellipse(0, 0, r.width / 2, r.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      if (strokeWidth > 0) ctx.stroke();
      break;

    case "line":
      gc.log("line pressed");

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
      ctx.fillStyle = base.stroke;
      ctx.fill();
      break;
  }

  ctx.restore();
}
