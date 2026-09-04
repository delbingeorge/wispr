import type { Keyframe } from "../types/projects";
import { applyEasing } from "./easing";

export function resolveProperty(
  property: string,
  baseValue: number,
  keyframes: Keyframe[],
  clipTime: number,
): number {
  console.log("please work, ", property, baseValue, clipTime);

  const relevant = keyframes
    .filter((kf) => kf.property === property)
    .sort((a, b) => a.time - b.time);

  if (relevant.length === 0) return baseValue;

  if (clipTime <= relevant[0].time) return relevant[0].value;
  if (clipTime >= relevant[relevant.length - 1].time)
    return relevant[relevant.length - 1].value;

  let before = relevant[0];
  let after = relevant[relevant.length - 1];

  for (let i = 0; i < relevant.length - 1; i++) {
    if (clipTime >= relevant[i].time && clipTime <= relevant[i + 1].time) {
      before = relevant[i];
      after = relevant[i + 1];
      break;
    }
  }

  const duration = after.time - before.time;
  if (duration === 0) return before.value;

  const progress = (clipTime - before.time) / duration;
  const eased = applyEasing(progress, after.easing);

  return before.value + (after.value - before.value) * eased;
}
