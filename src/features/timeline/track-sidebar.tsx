import { useProjectStore } from "@/core/stores/project-store";
import { useTimelineStore } from "@/core/stores/timeline-store";
import type { Track, TrackType } from "@/core/types/projects";
import { nextTrackLabel } from "@/core/utils/track-naming";
import { LANE_TOP, getTrackLayout } from "./track-layout";
import { useTimelineWheel } from "./use-timeline-wheel";
import styles from "./styles/track-sidebar.module.css";
import {
  Eye,
  EyeOff,
  Film,
  Fx,
  Lock,
  Music,
  Plus,
  Trash,
  Unlock,
  Volume,
  VolumeMute,
} from "@/assets/icons";
import {
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from "react";

const TRACK_ICONS: Record<TrackType, ReactElement> = {
  overlay: <Fx />,
  video: <Film />,
  audio: <Music />,
};

export function TrackSidebar({
  canvasRef,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  useTimelineWheel(sidebarRef, canvasRef);

  const tracks = useProjectStore((s) => s.project.tracks);
  const scrollY = useTimelineStore((s) => s.scrollY);
  const addTrack = useProjectStore((s) => s.addTrack);
  const removeTrack = useProjectStore((s) => s.removeTrack);
  const updateTrack = useProjectStore((s) => s.updateTrack);

  const [addMenuPos, setAddMenuPos] = useState<{ x: number; y: number } | null>(
    null,
  );

  useEffect(() => {
    if (!addMenuPos) return;
    const onDown = () => setAddMenuPos(null);
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [addMenuPos]);

  const handleOpenAddMenu = (e: React.MouseEvent) => {
    const width = 172;
    const height = 115;
    const pad = 8;
    setAddMenuPos({
      x: Math.min(e.clientX, window.innerWidth - width - pad),
      y: Math.min(e.clientY, window.innerHeight - height - pad),
    });
  };

  const handleInsertTrack = (type: TrackType) => {
    addTrack(type, nextTrackLabel(tracks, type));
    setAddMenuPos(null);
  };

  const handleToggleVisibility = (track: Track) => {
    updateTrack(track.id, { visible: !track.visible });
  };

  const handleToggleLock = (track: Track) => {
    updateTrack(track.id, { locked: !track.locked });
  };

  const handleToggleMute = (track: Track) => {
    updateTrack(track.id, { muted: !track.muted });
  };

  const handleRemoveTrack = (trackId: string) => {
    removeTrack(trackId);
  };

  return (
    <div className={styles.sidebar} ref={sidebarRef}>
      <div
        className={styles.trackList}
        style={{ transform: `translateY(${LANE_TOP - scrollY}px)` }}
      >
        {getTrackLayout(tracks).map(({ track, height }) => {
          const isAudio = track.type === "audio";
          const hidden = !isAudio && !track.visible;

          return (
            <div
              key={track.id}
              className={`${styles.track} ${hidden ? styles.trackOff : ""}`}
              data-track={track.id}
              style={{ height }}
            >
              <span className={styles.trackIcon}>
                {TRACK_ICONS[track.type]}
              </span>
              <span className={styles.trackLabel}>{track.label}</span>

              <button
                className={`${styles.btn} ${styles.btnAdd}`}
                title={`Add to ${track.label}`}
                disabled={track.locked}
              >
                <Plus />
              </button>

              {isAudio ? (
                <button
                  className={styles.btn}
                  onClick={() => handleToggleMute(track)}
                  title={track.muted ? "Unmute" : "Mute"}
                >
                  {track.muted ? <VolumeMute /> : <Volume />}
                </button>
              ) : (
                <button
                  className={styles.btn}
                  onClick={() => handleToggleVisibility(track)}
                  title={track.visible ? "Hide" : "Show"}
                >
                  {track.visible ? <Eye /> : <EyeOff />}
                </button>
              )}

              <button
                className={`${styles.btn} ${track.locked ? styles.btnOn : ""}`}
                onClick={() => handleToggleLock(track)}
                title={track.locked ? "Unlock" : "Lock"}
              >
                {track.locked ? <Lock /> : <Unlock />}
              </button>

              <button
                className={styles.btn}
                onClick={() => handleRemoveTrack(track.id)}
                title={track.deletable ? `Remove ${track.label}` : "Default track"}
                disabled={!track.deletable}
              >
                <Trash />
              </button>
            </div>
          );
        })}

        <button className={styles.addTrack} onClick={handleOpenAddMenu}>
          <Plus className={styles.addTrackIcon} />
          Add track
        </button>
      </div>

      {addMenuPos && (
        <div
          className={styles.menu}
          style={{ left: addMenuPos.x, top: addMenuPos.y }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            className={styles.mi}
            onClick={() => handleInsertTrack("video")}
          >
            <span>Video track</span>
          </button>
          <button
            className={styles.mi}
            onClick={() => handleInsertTrack("audio")}
          >
            <span>Audio track</span>
          </button>
          <button
            className={styles.mi}
            onClick={() => handleInsertTrack("overlay")}
          >
            <span>Overlay track</span>
          </button>
        </div>
      )}
    </div>
  );
}
