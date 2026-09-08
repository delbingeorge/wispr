import { useProjectStore } from "@/core/stores/project-store";
import { useSelectionStore } from "@/core/stores/selection-store";
import {
  clampOverlayPosition,
  clampOverlaySize,
} from "@/core/utils/overlay-bounds";
import styles from "./styles/properties-panel.module.css";
import { KeyframeSection } from "./keyframe-section";

export function PropertiesPanel() {
  const selectedClipIds = useSelectionStore((s) => s.selectedClipIds);
  const clips = useProjectStore((s) => s.clips);
  const project = useProjectStore((s) => s.project);

  if (selectedClipIds.size !== 1) return null;

  const clipId = [...selectedClipIds][0];
  const clip = clips[clipId];

  if (!clip || clip.kind === "media") return null;

  const updateProperty = (key: string, value: number | string) => {
    useProjectStore.getState().updateClip(clipId, {
      properties: { ...clip.properties, [key]: value },
    } as Partial<typeof clip>);
  };

  const p = clip.properties;

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Position</span>
        <div className={styles.row}>
          <label className={styles.label}>X</label>
          <input
            className={styles.input}
            type="number"
            value={Math.round(p.x)}
            onChange={(e) => {
              const { x } = clampOverlayPosition(
                Number(e.target.value),
                p.y,
                p.width,
                p.height,
                project.resolution.width,
                project.resolution.height,
              );
              updateProperty("x", x);
            }}
          />
          <label className={styles.label}>Y</label>
          <input
            className={styles.input}
            type="number"
            value={Math.round(p.y)}
            onChange={(e) => {
              const { y } = clampOverlayPosition(
                p.x,
                Number(e.target.value),
                p.width,
                p.height,
                project.resolution.width,
                project.resolution.height,
              );
              updateProperty("y", y);
            }}
          />
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>Size</span>
        <div className={styles.row}>
          <label className={styles.label}>W</label>
          <input
            className={styles.input}
            type="number"
            value={Math.round(p.width)}
            onChange={(e) => {
              const { width } = clampOverlaySize(
                Number(e.target.value),
                p.height,
                project.resolution.width,
                project.resolution.height,
              );
              updateProperty("width", width);
            }}
          />
          <label className={styles.label}>H</label>
          <input
            className={styles.input}
            type="number"
            value={Math.round(p.height)}
            onChange={(e) => {
              const { height } = clampOverlaySize(
                p.width,
                Number(e.target.value),
                project.resolution.width,
                project.resolution.height,
              );
              updateProperty("height", height);
            }}
          />
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.sectionTitle}>Transform</span>
        <div className={styles.row}>
          <label className={styles.label}>Rotation</label>
          <input
            className={styles.input}
            type="number"
            value={Math.round(p.rotation)}
            onChange={(e) => updateProperty("rotation", Number(e.target.value))}
          />
        </div>
        <div className={styles.row}>
          <label className={styles.label}>Opacity</label>
          <input
            className={styles.input}
            type="number"
            min={0}
            max={1}
            step={0.1}
            value={p.opacity}
            onChange={(e) => updateProperty("opacity", Number(e.target.value))}
          />
        </div>
      </div>

      {clip.kind === "shape" && (
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Appearance</span>
          <div className={styles.row}>
            <label className={styles.label}>Fill</label>
            <input
              className={styles.colorInput}
              type="color"
              value={clip.properties.fill.slice(0, 7)}
              onChange={(e) => updateProperty("fill", e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Stroke</label>
            <input
              className={styles.colorInput}
              type="color"
              value={clip.properties.stroke.slice(0, 7)}
              onChange={(e) => updateProperty("stroke", e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Stroke W</label>
            <input
              className={styles.input}
              type="number"
              min={0}
              value={clip.properties.strokeWidth}
              onChange={(e) =>
                updateProperty("strokeWidth", Number(e.target.value))
              }
            />
          </div>
        </div>
      )}

      {clip.kind === "text" && (
        <div className={styles.section}>
          <span className={styles.sectionTitle}>Text</span>
          <div className={styles.row}>
            <input
              className={styles.textInput}
              type="text"
              value={clip.text}
              onChange={(e) =>
                useProjectStore
                  .getState()
                  .updateClip(clipId, { text: e.target.value } as Partial<
                    typeof clip
                  >)
              }
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Font</label>
            <input
              className={styles.input}
              type="text"
              value={clip.properties.fontFamily}
              onChange={(e) => updateProperty("fontFamily", e.target.value)}
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Size</label>
            <input
              className={styles.input}
              type="number"
              min={8}
              value={clip.properties.fontSize}
              onChange={(e) =>
                updateProperty("fontSize", Number(e.target.value))
              }
            />
          </div>
          <div className={styles.row}>
            <label className={styles.label}>Color</label>
            <input
              className={styles.colorInput}
              type="color"
              value={clip.properties.fill}
              onChange={(e) => updateProperty("fill", e.target.value)}
            />
          </div>
        </div>
      )}

      <KeyframeSection clipId={clipId} clip={clip} />
    </div>
  );
}
