import type { EasingType } from "../types/projects";

function easeIn(t: number): number {
  return t * t * t;
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function applyEasing(t: number, easing: EasingType): number {
  switch (easing) {
    case "linear":
      return t;
    case "ease-in":
      return easeIn(t);
    case "ease-out":
      return easeOut(t);
    case "ease-in-out":
      return easeInOut(t);
  }
}
