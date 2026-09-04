import { useProjectStore } from "@/core/stores/project-store";
import { useSelectionStore } from "@/core/stores/selection-store";
import styles from "./styles/properties-panel.module.css";
import glass from "../../styles/glass.module.css";
import { KeyframeSection } from "./keyframe-section";

export function PropertiesPanel() {
  const selectedClipIds = useSelectionStore((s) => s.selectedClipIds);
  const clips = useProjectStore((s) => s.clips);

  if (selectedClipIds.size !== 1) {
    return (
      <div className={`${styles.panel} ${glass.panel}`}>
        <span className={styles.empty}>Select an overlay to edit</span>
      </div>
    );
  }

  const clipId = [...selectedClipIds][0];
  const clip = clips[clipId];

  if (!clip || clip.kind === "media") {
    return (
      <div className={`${styles.panel} ${glass.panel}`}>
        <span className={styles.empty}>Select an overlay to edit</span>
      </div>
    );
  }

  const updateProperty = (key: string, value: number | string) => {
    useProjectStore.getState().updateClip(clipId, {
      properties: { ...clip.properties, [key]: value },
    } as Partial<typeof clip>);
  };

  const p = clip.properties;

  return (
    <div className={`${styles.panel} ${glass.panel}`}>
      <div className={styles.section}>
        <span className={styles.sectionTitle}>Position</span>
        <div className={styles.row}>
          <label className={styles.label}>X</label>
          <input
            className={styles.input}
            type="number"
            value={Math.round(p.x)}
            onChange={(e) => updateProperty("x", Number(e.target.value))}
          />
          <label className={styles.label}>Y</label>
          <input
            className={styles.input}
            type="number"
            value={Math.round(p.y)}
            onChange={(e) => updateProperty("y", Number(e.target.value))}
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
            onChange={(e) => updateProperty("width", Number(e.target.value))}
          />
          <label className={styles.label}>H</label>
          <input
            className={styles.input}
            type="number"
            value={Math.round(p.height)}
            onChange={(e) => updateProperty("height", Number(e.target.value))}
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
