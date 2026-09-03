import styles from "./app.module.css";
import { PlaybackControls } from "./features/preview/playback-controls";
import { PreviewCanvas } from "./features/preview/preview-canvas";
import { TimelineCanvas } from "./features/timeline/timeline-canvas";
import { useTimelineKeyboard } from "./features/timeline/use-timeline-keyboard";
import { Toolbar } from "./features/toolbar/toolbar";

export default function App() {
  useTimelineKeyboard();

  return (
    <div className={styles.layout}>
      <Toolbar />
      <div className={styles.preview}>
        <PreviewCanvas />
      </div>
      <PlaybackControls />
      <div className={styles.timeline}>
        <TimelineCanvas />
      </div>
    </div>
  );
}
