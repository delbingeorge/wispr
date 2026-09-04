import type { Clip, TextClip, ShapeClip } from "@/core/types/projects";

export function renderOverlays(
  ctx: CanvasRenderingContext2D,
  clips: Record<string, Clip>,
  trackClipIds: string[],
  currentTime: number,
  canvasWidth: number,
  canvasHeight: number,
  projectWidth: number,
  projectHeight: number,
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

    if (clip.kind === "text") {
      renderTextClip(ctx, clip);
    } else if (clip.kind === "shape") {
      renderShapeClip(ctx, clip);
    }
  }

  ctx.restore();
}

function renderTextClip(ctx: CanvasRenderingContext2D, clip: TextClip) {
  const p = clip.properties;

  ctx.save();
  ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;

  ctx.fillStyle = p.fill;
  ctx.font = `${p.fontWeight} ${p.fontSize}px ${p.fontFamily}`;
  ctx.textAlign = p.textAlign;
  ctx.textBaseline = "middle";

  const textX =
    p.textAlign === "left"
      ? -p.width / 2
      : p.textAlign === "right"
        ? p.width / 2
        : 0;
  ctx.fillText(clip.text, textX, 0, p.width);

  ctx.restore();
}

function renderShapeClip(ctx: CanvasRenderingContext2D, clip: ShapeClip) {
  const p = clip.properties;

  ctx.save();
  ctx.translate(p.x + p.width / 2, p.y + p.height / 2);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;

  ctx.fillStyle = p.fill;
  ctx.strokeStyle = p.stroke;
  ctx.lineWidth = p.strokeWidth;

  switch (clip.shapeType) {
    case "rectangle":
      ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      if (p.strokeWidth > 0) {
        ctx.strokeRect(-p.width / 2, -p.height / 2, p.width, p.height);
      }
      break;

    case "ellipse":
      ctx.beginPath();
      ctx.ellipse(0, 0, p.width / 2, p.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      if (p.strokeWidth > 0) ctx.stroke();
      break;

    case "line":
      ctx.beginPath();
      ctx.moveTo(-p.width / 2, 0);
      ctx.lineTo(p.width / 2, 0);
      ctx.stroke();
      break;

    case "arrow":
      ctx.beginPath();
      ctx.moveTo(-p.width / 2, 0);
      ctx.lineTo(p.width / 2, 0);
      ctx.stroke();

      const arrowSize = Math.min(12, p.width / 4);
      ctx.beginPath();
      ctx.moveTo(p.width / 2, 0);
      ctx.lineTo(p.width / 2 - arrowSize, -arrowSize / 2);
      ctx.lineTo(p.width / 2 - arrowSize, arrowSize / 2);
      ctx.closePath();
      ctx.fillStyle = p.stroke;
      ctx.fill();
      break;
  }

  ctx.restore();
}
