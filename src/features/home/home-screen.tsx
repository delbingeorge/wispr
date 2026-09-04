import { useState, useEffect } from "react";
import {
  listProjects,
  deleteProject,
  type SavedProject,
} from "@/core/storage/project-storage";
import styles from "./styles/home-screen.module.css";

type Props = {
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
};

export function HomeScreen({ onOpenProject, onNewProject }: Props) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProjects()
      .then(setProjects)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <span className={styles.loading}>Loading projects...</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wispr</h1>
        <button className={styles.newBtn} onClick={onNewProject}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyText}>No projects yet</span>
          <span className={styles.emptyHint}>
            Create a new project to get started
          </span>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project) => (
            <div
              key={project.id}
              className={styles.card}
              onClick={() => onOpenProject(project.id)}
            >
              <div className={styles.cardBody}>
                <span className={styles.cardName}>{project.name}</span>
                <span className={styles.cardDate}>
                  {formatDate(project.savedAt)}
                </span>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(project.id);
                }}
                title="Delete project"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
