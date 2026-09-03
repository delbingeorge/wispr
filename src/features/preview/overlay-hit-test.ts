import type { Clip, TextClip, ShapeClip } from "@/core/types/projects";

type OverlayHitResult =
  | { type: "none" }
  | { type: "body"; clipId: string }
  | { type: "resize"; clipId: string; handle: ResizeHandle }
  | { type: "rotate"; clipId: string };

type ResizeHandle = "nw" | "ne" | "sw" | "se";

const HANDLE_SIZE = 8;
const ROTATE_OFFSET = 20;

function inverseRotatePoint(
  px: number,
  py: number,
  cx: number,
  cy: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = (-angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  return {
    x: cos * dx - sin * dy + cx,
    y: sin * dx + cos * dy + cy,
  };
}

function getOverlayClip(clip: Clip): (TextClip | ShapeClip) | null {
  if (clip.kind === "text" || clip.kind === "shape") return clip;
  return null;
}

export function hitTestOverlays(
  projectX: number,
  projectY: number,
  clips: Record<string, Clip>,
  overlayClipIds: string[],
  currentTime: number,
): OverlayHitResult {
  for (let i = overlayClipIds.length - 1; i >= 0; i--) {
    const clipId = overlayClipIds[i];
    const clip = clips[clipId];
    if (!clip) continue;

    const overlay = getOverlayClip(clip);
    if (!overlay) continue;
    if (
      currentTime < overlay.startTime ||
      currentTime > overlay.startTime + overlay.duration
    )
      continue;

    const p = overlay.properties;
    const cx = p.x + p.width / 2;
    const cy = p.y + p.height / 2;

    const local = inverseRotatePoint(projectX, projectY, cx, cy, p.rotation);

    const rotateX = cx;
    const rotateY = p.y - ROTATE_OFFSET;
    const rotateLocal = inverseRotatePoint(
      projectX,
      projectY,
      cx,
      cy,
      p.rotation,
    );
    if (
      Math.abs(rotateLocal.x - rotateX) < HANDLE_SIZE * 2 &&
      Math.abs(rotateLocal.y - rotateY) < HANDLE_SIZE * 2
    ) {
      return { type: "rotate", clipId };
    }

    const corners: { handle: ResizeHandle; hx: number; hy: number }[] = [
      { handle: "nw", hx: p.x, hy: p.y },
      { handle: "ne", hx: p.x + p.width, hy: p.y },
      { handle: "sw", hx: p.x, hy: p.y + p.height },
      { handle: "se", hx: p.x + p.width, hy: p.y + p.height },
    ];

    for (const { handle, hx, hy } of corners) {
      if (
        Math.abs(local.x - hx) < HANDLE_SIZE &&
        Math.abs(local.y - hy) < HANDLE_SIZE
      ) {
        return { type: "resize", clipId, handle };
      }
    }

    if (
      local.x >= p.x &&
      local.x <= p.x + p.width &&
      local.y >= p.y &&
      local.y <= p.y + p.height
    ) {
      return { type: "body", clipId };
    }
  }

  return { type: "none" };
}

export type { OverlayHitResult, ResizeHandle };
export { HANDLE_SIZE, ROTATE_OFFSET };
