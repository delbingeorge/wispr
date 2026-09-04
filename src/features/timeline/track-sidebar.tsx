import { useProjectStore } from "@/core/stores/project-store";
import type { Track, TrackType } from "@/core/types/projects";
import styles from "./styles/track-sidebar.module.css";
import {
  Eye,
  EyeOff,
  Film,
  Lock,
  Trash,
  Unlock,
  VolumeMute,
} from "@/assets/icons";
import type { ReactElement } from "react";

const TRACK_ICONS: Record<TrackType, ReactElement> = {
  overlay: <></>, // do later
  video: <Film />,
  audio: <></>,
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
      {tracks.map((track) => (
        <div key={track.id} className={styles.track}>
          <div className={styles.trackInfo}>
            <span className={styles.icon}>{TRACK_ICONS[track.type]}</span>
            <span className={styles.label}>{track.label}</span>
          </div>
          <div className={styles.controls}>
            <button
              className={`${styles.btn} ${!track.visible ? styles.inactive : ""}`}
              onClick={() => handleToggleVisibility(track)}
              title={track.visible ? "Hide" : "Show"}
            >
              {track.visible ? <EyeOff /> : <Eye />}
            </button>
            {track.type === "audio" ? (
              <button
                className={`${styles.btn} ${track.muted ? styles.inactive : ""}`}
                onClick={() => handleToggleMute(track)}
                title={track.muted ? "Unmute" : "Mute"}
              >
                {track.muted ? <VolumeMute /> : "Unmute"}
              </button>
            ) : null}
            <button
              className={`${styles.btn} ${track.locked ? styles.inactive : ""}`}
              onClick={() => handleToggleLock(track)}
              title={track.locked ? "Unlock" : "Lock"}
            >
              {track.locked ? <Lock /> : <Unlock />}
            </button>
            <button
              className={styles.btn}
              onClick={() => handleRemoveTrack(track.id)}
              title="Delete track"
            >
              <Trash />
            </button>
          </div>
        </div>
      ))}
      <button className={styles.addTrack} onClick={handleAddTrack}>
        + Add track
      </button>
    </div>
  );
}
