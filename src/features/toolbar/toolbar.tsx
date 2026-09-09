import { useSelectionStore } from "@/core/stores/selection-store";
import type { Tool } from "@/core/stores/selection-store";
import { useProjectStore } from "@/core/stores/project-store";
import { useAssetLibraryStore } from "@/core/stores/asset-library-store";
import type { TrackType } from "@/core/types/projects";
import { nextTrackLabel } from "@/core/utils/track-naming";
import styles from "./styles/toolbar.module.css";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { ExportDialog } from "../export/export-dialog";
import { useMediaImport } from "../assets/use-media-import";
import { pickMediaFiles } from "../assets/pick-media-files";
import {
  Logo,
  Type,
  ShapeSquare,
  ShapeCircle,
  ShapeLine,
  ShapeArrow,
  Film,
  Music,
  Plus,
} from "@/assets/icons";

function setActiveTool(tool: Tool) {
  useSelectionStore.getState().setActiveTool(tool);
}

function insertTrack(type: TrackType) {
  const { project, addTrack } = useProjectStore.getState();
  addTrack(type, nextTrackLabel(project.tracks, type));
}

type MenuRow =
  | { kind: "sep" }
  | {
      kind: "action";
      label: string;
      icon?: ReactNode;
      keys?: string[];
      onSelect: () => void;
    };

function fileRows(onImport: () => void, onExport: () => void): MenuRow[] {
  return [
    {
      kind: "action",
      label: "Import Media…",
      keys: ["⌘", "I"],
      onSelect: onImport,
    },
    {
      kind: "action",
      label: "Asset Library",
      keys: ["⌘", "L"],
      onSelect: () => useAssetLibraryStore.getState().open(),
    },
    { kind: "sep" },
    {
      kind: "action",
      label: "Export Video…",
      keys: ["⌘", "E"],
      onSelect: onExport,
    },
  ];
}

const INSERT_ROWS: MenuRow[] = [
  {
    kind: "action",
    label: "Text",
    icon: <Type />,
    onSelect: () => setActiveTool("text"),
  },
  { kind: "sep" },
  {
    kind: "action",
    label: "Rectangle",
    icon: <ShapeSquare />,
    onSelect: () => setActiveTool("rectangle"),
  },
  {
    kind: "action",
    label: "Ellipse",
    icon: <ShapeCircle />,
    onSelect: () => setActiveTool("ellipse"),
  },
  {
    kind: "action",
    label: "Line",
    icon: <ShapeLine />,
    onSelect: () => setActiveTool("line"),
  },
  {
    kind: "action",
    label: "Arrow",
    icon: <ShapeArrow />,
    onSelect: () => setActiveTool("arrow"),
  },
  { kind: "sep" },
  {
    kind: "action",
    label: "Video Track",
    icon: <Film />,
    onSelect: () => insertTrack("video"),
  },
  {
    kind: "action",
    label: "Audio Track",
    icon: <Music />,
    onSelect: () => insertTrack("audio"),
  },
  {
    kind: "action",
    label: "Overlay Track",
    icon: <Plus />,
    onSelect: () => insertTrack("overlay"),
  },
];

function MenuBarDropdown({
  label,
  rows,
  open,
  onToggle,
  onSelectRow,
}: {
  label: string;
  rows: MenuRow[];
  open: boolean;
  onToggle: () => void;
  onSelectRow: () => void;
}) {
  return (
    <div
      className={styles.insertWrap}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <button
        className={`${styles.mbT} ${open ? styles.mbTOn : ""}`}
        onClick={onToggle}
      >
        {label}
      </button>
      {open && (
        <div className={styles.insertMenu}>
          {rows.map((row, i) =>
            row.kind === "sep" ? (
              <div key={i} className={styles.insertSep} />
            ) : (
              <button
                key={row.label}
                className={styles.insertRow}
                onClick={() => {
                  row.onSelect();
                  onSelectRow();
                }}
              >
                {row.icon && (
                  <span className={styles.insertIcon}>{row.icon}</span>
                )}
                <span className={styles.insertLabel}>{row.label}</span>
                {row.keys?.map((key) => (
                  <kbd
                    key={key}
                    className={`${styles.key} ${key === "⌘" ? styles.keyCmd : ""}`}
                  >
                    {key}
                  </kbd>
                ))}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function Toolbar({ onBack }: { onBack: () => void }) {
  const activeTool = useSelectionStore((s) => s.activeTool);
  const [showExport, setShowExport] = useState(false);
  const [openMenu, setOpenMenu] = useState<"file" | "insert" | null>(null);
  const { importFiles } = useMediaImport();

  const openFilePicker = useCallback(
    () => pickMediaFiles((files) => void importFiles(files)),
    [importFiles],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.metaKey && !e.ctrlKey) return;

      if (e.key === "i") {
        e.preventDefault();
        openFilePicker();
      }

      if (e.key === "e") {
        e.preventDefault();
        setShowExport(true);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openFilePicker]);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = () => setOpenMenu(null);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [openMenu]);

  return (
    <>
      <div className={styles.toolbar}>
        <span onClick={onBack} className={styles.logo}>
          <Logo />
        </span>

        <nav className={styles.menubar} aria-label="Main menu">
          <MenuBarDropdown
            label="File"
            rows={fileRows(openFilePicker, () => setShowExport(true))}
            open={openMenu === "file"}
            onToggle={() =>
              setOpenMenu((current) => (current === "file" ? null : "file"))
            }
            onSelectRow={() => setOpenMenu(null)}
          />

          <button className={`${styles.mbT} ${styles.mbTPlaceholder}`} disabled>
            Edit
          </button>
          <button className={`${styles.mbT} ${styles.mbTPlaceholder}`} disabled>
            View
          </button>

          <MenuBarDropdown
            label="Insert"
            rows={INSERT_ROWS}
            open={openMenu === "insert"}
            onToggle={() =>
              setOpenMenu((current) =>
                current === "insert" ? null : "insert",
              )
            }
            onSelectRow={() => setOpenMenu(null)}
          />

          <button className={`${styles.mbT} ${styles.mbTPlaceholder}`} disabled>
            Help
          </button>
        </nav>

        <span className={styles.divider} />

        <button
          className={`${styles.btn} ${activeTool === "select" ? styles.active : ""}`}
          onClick={() => setActiveTool("select")}
        >
          Select
        </button>

      </div>
      {showExport && <ExportDialog onClose={() => setShowExport(false)} />}
    </>
  );
}
