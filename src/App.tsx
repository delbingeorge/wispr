import styles from "./app.module.css";
import { PlaybackControls } from "./features/preview/playback-controls";
import { PreviewCanvas } from "./features/preview/preview-canvas";
import { PropertiesPanel } from "./features/properties/properties-panel";
import { TimelineCanvas } from "./features/timeline/timeline-canvas";
import { TrackSidebar } from "./features/timeline/track-sidebar";
import { useTimelineKeyboard } from "./features/timeline/use-timeline-keyboard";
import { Toolbar } from "./features/toolbar/toolbar";
import { useAutoSave } from "./core/hooks/use-auto-save";

import { useState, useCallback } from "react";
import { HomeScreen } from "./features/home/home-screen";
import { useProjectLoader } from "./core/hooks/use-project-loader";
import { useProjectStore } from "./core/stores/project-store";
import { generateId } from "./core/utils/id-generator";

import grads from "./styles/gradients.module.css";

export default function App() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const { loading, missingAssets } = useProjectLoader(activeProjectId);

  const handleNewProject = useCallback(() => {
    const id = generateId();
    useProjectStore.getState().resetProject(id);
    setActiveProjectId(id);
  }, []);

  const handleOpenProject = useCallback((projectId: string) => {
    setActiveProjectId(projectId);
  }, []);

  const handleBackToHome = useCallback(() => {
    setActiveProjectId(null);
  }, []);

  if (!activeProjectId) {
    return (
      <HomeScreen
        onOpenProject={handleOpenProject}
        onNewProject={handleNewProject}
      />
    );
  }

  if (loading) {
    return <div className={styles.loading}>Loading project...</div>;
  }

  return <Editor missingAssets={missingAssets} onBack={handleBackToHome} />;
}

function Editor({
  missingAssets,
  onBack,
}: {
  missingAssets: string[];
  onBack: () => void;
}) {
  useTimelineKeyboard();
  useAutoSave();

  return (
    <div className={`${styles.layout} ${grads.atmosphere}`}>
      <Toolbar onBack={onBack} />
      <div className={styles.preview}>
        <PreviewCanvas />
        {missingAssets.length > 0 && (
          <div className={styles.warning}>
            {missingAssets.length} asset(s) missing. Re-import the original
            files to restore them.
          </div>
        )}
      </div>
      <PropertiesPanel />
      <PlaybackControls />
      <div className={styles.timelineArea}>
        <TrackSidebar />
        <div className={styles.timeline}>
          <TimelineCanvas />
        </div>
      </div>
    </div>
  );
}
