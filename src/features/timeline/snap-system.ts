import type { MediaClip } from "../../core/types/projects";

const SNAP_THRESHOLD_PX = 8;

type SnapResult = {
  snappedTime: number;
  snapLine: number | null;
};

export function findSnapTarget(
  candidateTime: number,
  clips: Record<string, MediaClip>,
  currentTime: number,
  excludeClipId: string,
  zoom: number,
): SnapResult {
  const thresholdTime = SNAP_THRESHOLD_PX / zoom;
  const targets: number[] = [0, currentTime];

  for (const clip of Object.values(clips)) {
    if (clip.id === excludeClipId) continue;
    targets.push(clip.startTime);
    targets.push(clip.startTime + clip.duration);
  }

  let closest = candidateTime;
  let minDistance = thresholdTime;
  let snapLine: number | null = null;

  for (const target of targets) {
    console.log("cursor reached here");
    const distance = Math.abs(candidateTime - target);
    if (distance < minDistance) {
      console.log("cursor reached inside condition");

      minDistance = distance;
      closest = target;
      snapLine = target;
    }
  }

  return { snappedTime: closest, snapLine };
}
