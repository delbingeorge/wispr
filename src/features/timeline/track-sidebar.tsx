import { useProjectStore } from "@/core/stores/project-store";
import type { Track, TrackType } from "@/core/types/projects";
import styles from "./styles/track-sidebar.module.css";
import {
  Eye,
  EyeOff,
  Film,
  Lock,
  Music,
  Plus,
  Trash,
  Unlock,
  Volume,
  VolumeMute,
} from "@/assets/icons";
import type { ReactElement } from "react";

const TRACK_ICONS: Record<TrackType, ReactElement> = {
  overlay: <Plus />,
  video: <Film />,
  audio: <Music />,
};

export function TrackSidebar() {
  const tracks = useProjectStore((s) => s.project.tracks);
  const addTrack = useProjectStore((s) => s.addTrack);
  const removeTrack = useProjectStore((s) => s.removeTrack);
  const updateTrack = useProjectStore((s) => s.updateTrack);

  const handleAddTrack = () => {
    const videoCount = tracks.filter((t) => t.type === "video").length;
    addTrack("video", `Video ${videoCount + 1}`);
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
    <div className={styles.sidebar}>
      {tracks.map((track) => {
        const isAudio = track.type === "audio";
        const hidden = !isAudio && !track.visible;

        return (
          <div
            key={track.id}
            className={`${styles.track} ${hidden ? styles.trackOff : ""}`}
            data-track={track.id}
          >
            <span className={styles.trackIcon}>{TRACK_ICONS[track.type]}</span>
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
              title={`Remove ${track.label}`}
            >
              <Trash />
            </button>
          </div>
        );
      })}

      <button className={styles.addTrack} onClick={handleAddTrack}>
        + Add track
      </button>
    </div>
  );
}
