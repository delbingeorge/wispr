import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  listProjects,
  deleteProject,
  type SavedProject,
} from "@/core/storage/project-storage";
import styles from "./styles/home-screen.module.css";
import grads from "../../styles/gradients.module.css";
import glass from "../../styles/glass.module.css";
import { Logo, Search, MoreDots, Close, Warning, Check } from "@/assets/icons";

type ProjectCard = Omit<SavedProject, "clips"> & {
  thumb?: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  clipCount?: number;
  missing?: number;
  fixed?: boolean;
};

type Props = {
  onOpenProject: (projectId: string) => void;
  onNewProject: (projectId: string) => void;
};

const PLACEHOLDER_THUMB = "thumbs/movie-placeholder.jpg";
const PLACEHOLDER_THUMB_REMOTE =
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bW92aWV8ZW58MHx8MHx8fDA%3D";

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const fmtDur = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const plural = (n: number, unit: string) =>
  `${n} ${unit}${n === 1 ? "" : "s"} ago`;

const ago = (ms: number) => {
  if (ms < MIN) return "just now";
  if (ms < HOUR) return plural(Math.round(ms / MIN), "minute");
  if (ms < DAY) return plural(Math.round(ms / HOUR), "hour");
  if (ms < 2 * DAY) return "yesterday";
  if (ms < 30 * DAY) return plural(Math.round(ms / DAY), "day");
  return plural(Math.round(ms / (30 * DAY)), "month");
};

export function HomeScreen({ onOpenProject, onNewProject }: Props) {
  const [projects, setProjects] = useState<ProjectCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [newDlgOpen, setNewDlgOpen] = useState(false);
  const [newName, setNewName] = useState("Untitled Project");
  const [res, setRes] = useState({ w: 1920, h: 1080 });
  const [fps, setFps] = useState(30);
  const [menuFor, setMenuFor] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    listProjects().then((rows) => {
      const decorated: ProjectCard[] = rows.map((p) => ({
        ...p,
        thumb: PLACEHOLDER_THUMB,
        missing: 0,
      }));
      setProjects(decorated);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? projects.filter((p) => p.name.toLowerCase().includes(q))
      : projects;
  }, [projects, query]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setMenuFor(null);
  }, []);

  const handleDuplicate = useCallback((id: string) => {
    setProjects((prev) => {
      const i = prev.findIndex((p) => p.id === id);
      if (i < 0) return prev;
      const src = prev[i];
      const copy: ProjectCard = {
        ...src,
        id: `${src.id}-copy`,
        name: `${src.name} copy`,
        savedAt: Date.now(),
      };
      const next = [...prev];
      next.splice(i + 1, 0, copy);
      return next;
    });
    setMenuFor(null);
  }, []);

  const handleCreate = useCallback(() => {
    const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    onNewProject(id);
  }, [onNewProject]);

  const closeMenu = useCallback(() => setMenuFor(null), []);

  useEffect(() => {
    if (!menuFor) return;
    const onDown = () => closeMenu();
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [menuFor, closeMenu]);

  useEffect(() => {
    if (newDlgOpen) {
      setNewName("Untitled Project");
      setRes({ w: 1920, h: 1080 });
      setFps(30);
    }
  }, [newDlgOpen]);

  if (loading) {
    return (
      <div className={`${styles.container} ${grads.atmosphere}`}>
        <span className={styles.loading}>Loading projects...</span>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${grads.atmosphere}`}>
      <header className={`${styles.bar} ${glass.heavy}`}>
        <span className={styles.logo} aria-label="Wisp">
          <Logo />
        </span>
        <span className={styles.storage}>OPFS · local cache</span>
      </header>

      <main className={styles.main}>
        <div className={styles.head}>
          <div>
            <h1 className={styles.title}>Projects</h1>
            <p className={styles.sub}>
              Everything stays on this device, nothing is uploaded.
            </p>
          </div>
          <button className={styles.addBtn} onClick={() => setNewDlgOpen(true)}>
            New Project
          </button>
        </div>

        <div className={styles.tools}>
          <label className={styles.search}>
            <Search />
            <input
              type="search"
              placeholder="Search projects"
              spellCheck={false}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <span className={styles.count}>
            {query && filtered.length !== projects.length
              ? `${filtered.length} of ${projects.length}`
              : `${projects.length} projects`}
          </span>
        </div>

        <div className={styles.grid}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>
              {projects.length === 0 ? (
                <>
                  <h2>No projects yet</h2>
                  <p>
                    Create one to start cutting. Your media stays on this
                    device.
                  </p>
                  <button
                    className={styles.addBtn}
                    onClick={() => setNewDlgOpen(true)}
                  >
                    New Project
                  </button>
                </>
              ) : (
                <>
                  <h2>No projects match “{query}”</h2>
                  <p>Try a different name.</p>
                </>
              )}
            </div>
          ) : (
            filtered.map((p, i) => (
              <button
                key={p.id}
                className={`${styles.proj} ${p.fixed ? styles.projFixed : ""}`}
                onClick={() => onOpenProject(p.id)}
                data-id={p.id}
              >
                <span className={styles.projThumb}>
                  <img
                    src={p.thumb ?? PLACEHOLDER_THUMB}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== PLACEHOLDER_THUMB_REMOTE) {
                        img.src = PLACEHOLDER_THUMB_REMOTE;
                      }
                    }}
                  />
                  <span className={styles.projDur}>
                    {fmtDur(p.duration ?? 60 * (i + 1))}
                  </span>
                </span>
                <button
                  className={styles.projMore}
                  title="More"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuFor({ id: p.id, x: e.clientX, y: e.clientY });
                  }}
                >
                  <MoreDots />
                </button>
                <span className={styles.projName}>{p.name}</span>
                <span className={styles.projMeta}>
                  {p.width ?? 1920} × {p.height ?? 1080} · {p.fps ?? 30} fps ·{" "}
                  {p.clipCount ?? 0} clips
                </span>
                <span className={styles.projSaved}>
                  Auto-saved {ago(Date.now() - p.savedAt)}
                </span>
                {p.missing && !p.fixed ? (
                  <span className={styles.projWarn}>
                    <Warning />
                    {p.missing} media file{p.missing > 1 ? "s" : ""} missing
                    <button
                      className={styles.projFix}
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjects((prev) =>
                          prev.map((x) =>
                            x.id === p.id ? { ...x, fixed: true } : x,
                          ),
                        );
                      }}
                    >
                      Re-import
                    </button>
                  </span>
                ) : p.fixed ? (
                  <span className={styles.projWarn}>
                    <Check />
                    All media relinked
                  </span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </main>

      {menuFor && (
        <div
          ref={menuRef}
          className={styles.menu}
          style={{ left: menuFor.x, top: menuFor.y }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            className={styles.mi}
            onClick={() => {
              closeMenu();
              onOpenProject(menuFor.id);
            }}
          >
            <span>Open</span>
          </button>
          <button className={`${styles.mi} ${styles.miDisabled}`} disabled>
            <span>Rename…</span>
          </button>
          <button
            className={styles.mi}
            onClick={() => handleDuplicate(menuFor.id)}
          >
            <span>Duplicate</span>
          </button>
          <div className={styles.sep} />
          <button
            className={`${styles.mi} ${styles.miDanger}`}
            onClick={() => handleDelete(menuFor.id)}
          >
            <span>Delete</span>
          </button>
        </div>
      )}

      {newDlgOpen && (
        <div
          className={styles.dlgBackdrop}
          onClick={() => setNewDlgOpen(false)}
        >
          <div
            className={styles.dlg}
            role="dialog"
            aria-label="New project"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.dlgHead}>
              <span className={styles.dlgTitle}>New Project</span>
              <button
                className={styles.dlgX}
                title="Close"
                onClick={() => setNewDlgOpen(false)}
              >
                <Close />
              </button>
            </div>
            <div className={styles.dlgBody}>
              <div className={styles.dlgRow}>
                <span className={styles.dlgLabel}>Name</span>
                <label className={styles.nameField}>
                  <input
                    value={newName}
                    spellCheck={false}
                    autoFocus
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                    }}
                  />
                </label>
              </div>
              <div className={styles.dlgRow}>
                <span className={styles.dlgLabel}>Resolution</span>
                <div className={styles.dlgPick}>
                  {(
                    [
                      { w: 3840, h: 2160, label: "4K UHD" },
                      { w: 1920, h: 1080, label: "1080p" },
                      { w: 1280, h: 720, label: "720p" },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.label}
                      className={`${styles.chip} ${res.w === r.w && res.h === r.h ? styles.chipOn : ""}`}
                      onClick={() => setRes({ w: r.w, h: r.h })}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.dlgRow}>
                <span className={styles.dlgLabel}>Frame rate</span>
                <div className={styles.dlgPick}>
                  {[24, 30, 60].map((v) => (
                    <button
                      key={v}
                      className={`${styles.chip} ${fps === v ? styles.chipOn : ""}`}
                      onClick={() => setFps(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <p className={styles.dlgSummary}>
                {res.w} × {res.h} · {fps} fps · stored on this device
              </p>
            </div>
            <div className={styles.dlgFoot}>
              <button
                className={styles.dlgCancel}
                onClick={() => setNewDlgOpen(false)}
              >
                Cancel
              </button>
              <button className={styles.addBtn} onClick={handleCreate}>
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
