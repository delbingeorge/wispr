import { useProjectStore } from "@/core/stores/project-store";
import { usePlaybackStore } from "@/core/stores/playback-store";
import { generateId } from "@/core/utils/id-generator";
import type { TextClip, ShapeClip, EasingType } from "@/core/types/projects";
import styles from "./styles/keyframe-section.module.css";

const ANIMATABLE_PROPERTIES = [
  { key: "x", label: "X" },
  { key: "y", label: "Y" },
  { key: "width", label: "Width" },
  { key: "height", label: "Height" },
  { key: "rotation", label: "Rotation" },
  { key: "opacity", label: "Opacity" },
];

type Props = {
  clipId: string;
  clip: TextClip | ShapeClip;
};

export function KeyframeSection({ clipId, clip }: Props) {
  const currentTime = usePlaybackStore((s) => s.currentTime);
  const clipTime = currentTime - clip.startTime;

  const handleAddKeyframe = (property: string) => {
    const value = clip.properties[
      property as keyof typeof clip.properties
    ] as number;
    useProjectStore.getState().addKeyframe(clipId, {
      id: generateId(),
      time: clipTime,
      property,
      value,
      easing: "linear",
    });
  };

  const handleRemoveKeyframe = (keyframeId: string) => {
    useProjectStore.getState().removeKeyframe(clipId, keyframeId);
  };

  const handleChangeEasing = (keyframeId: string, easing: EasingType) => {
    const kf = clip.keyframes.find((k) => k.id === keyframeId);
    if (!kf) return;
    useProjectStore.getState().removeKeyframe(clipId, keyframeId);
    useProjectStore.getState().addKeyframe(clipId, { ...kf, easing });
  };

  return (
    <div className={styles.section}>
      <span className={styles.sectionTitle}>Keyframes</span>
      {ANIMATABLE_PROPERTIES.map(({ key, label }) => {
        const keyframesForProp = clip.keyframes
          .filter((kf) => kf.property === key)
          .sort((a, b) => a.time - b.time);

        return (
          <div key={key} className={styles.property}>
            <div className={styles.propertyHeader}>
              <span className={styles.propertyLabel}>{label}</span>
              <button
                className={styles.addBtn}
                onClick={() => handleAddKeyframe(key)}
                title={`Add keyframe for ${label} at current time`}
              >
                ◆+
              </button>
            </div>
            {keyframesForProp.length > 0 && (
              <div className={styles.keyframeList}>
                {keyframesForProp.map((kf) => (
                  <div key={kf.id} className={styles.keyframeRow}>
                    <span className={styles.diamond}>◆</span>
                    <span className={styles.keyframeTime}>
                      {kf.time.toFixed(2)}s
                    </span>
                    <span className={styles.keyframeValue}>
                      {typeof kf.value === "number"
                        ? kf.value.toFixed(1)
                        : kf.value}
                    </span>
                    <select
                      className={styles.easingSelect}
                      value={kf.easing}
                      onChange={(e) =>
                        handleChangeEasing(kf.id, e.target.value as EasingType)
                      }
                    >
                      <option value="linear">Linear</option>
                      <option value="ease-in">Ease In</option>
                      <option value="ease-out">Ease Out</option>
                      <option value="ease-in-out">Ease In Out</option>
                    </select>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveKeyframe(kf.id)}
                      title="Remove keyframe"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
