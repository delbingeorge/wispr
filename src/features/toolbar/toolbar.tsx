import { useSelectionStore } from "@/core/stores/selection-store";
import type { Tool } from "@/core/stores/selection-store";
import styles from "./styles/toolbar.module.css";
import { useState } from "react";
import { ExportDialog } from "../export/export-dialog";

const TOOLS: { tool: Tool; label: string }[] = [
  { tool: "select", label: "Select" },
  { tool: "text", label: "Text" },
  { tool: "rectangle", label: "Rect" },
  { tool: "ellipse", label: "Ellipse" },
  { tool: "line", label: "Line" },
  { tool: "arrow", label: "Arrow" },
];

export function Toolbar({ onBack }: { onBack: () => void }) {
  const activeTool = useSelectionStore((s) => s.activeTool);
  const [showExport, setShowExport] = useState(false);

  const handleToolClick = (tool: Tool) => {
    useSelectionStore.getState().setActiveTool(tool);
  };

  return (
    <>
      <div className={styles.toolbar}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          title="Back to projects"
        >
          {"<-"}
        </button>
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
        <button
          className={styles.exportBtn}
          onClick={() => setShowExport(true)}
        >
          Export
        </button>
      </div>
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
    </>
  );
}
