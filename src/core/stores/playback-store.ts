import { create } from "zustand";

type PlaybackState = {
  currentTime: number;
  isPlaying: boolean;
  playbackRate: number;
  duration: number;
  setCurrentTime: (time: number) => void;
  setDuraction: (duration: number) => void;
  play: () => void;
  pause: () => void;
  togglePlayback: () => void;
  setPlaybackRate: (rate: number) => void;
};

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentTime: 0,
  isPlaying: false,
  playbackRate: 1,
  duration: 0,

  setCurrentTime: (time) => set({ currentTime: time }),
  setDuraction: (duration) => set({ duration }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),

  togglePlayback: () => {
    const { isPlaying } = get();
    set({ isPlaying: !isPlaying });
  },

  setPlaybackRate: (rate) => set({ playbackRate: rate }),
}));
