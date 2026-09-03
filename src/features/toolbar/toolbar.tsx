import { useSelectionStore } from "@/core/stores/selection-store";
import type { Tool } from "@/core/stores/selection-store";
import styles from "./styles/toolbar.module.css";

const TOOLS: { tool: Tool; label: string }[] = [
  { tool: "select", label: "Select" },
  { tool: "text", label: "Text" },
  { tool: "rectangle", label: "Rect" },
  { tool: "ellipse", label: "Ellipse" },
  { tool: "line", label: "Line" },
  { tool: "arrow", label: "Arrow" },
];

export function Toolbar() {
  const activeTool = useSelectionStore((s) => s.activeTool);

  const handleToolClick = (tool: Tool) => {
    useSelectionStore.getState().setActiveTool(tool);
  };

  return (
    <div className={styles.toolbar}>
      <span className={styles.logo}>Wispr</span>
      <div className={styles.tools}>
        {TOOLS.map(({ tool, label }) => (
          <button
            key={tool}
            className={`${styles.btn} ${activeTool === tool ? styles.active : ""}`}
            onClick={() => handleToolClick(tool)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
