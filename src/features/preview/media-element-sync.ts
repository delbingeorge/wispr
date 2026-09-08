import { usePlaybackStore } from "@/core/stores/playback-store";
import type { Asset } from "@/core/types/projects";
import type { ActiveTrackClip } from "@/core/utils/clip-lookup";
import { getAssetBlobUrl } from "./asset-blob-cache";

const DRIFT_THRESHOLD_SECONDS = 0.15;

type ElementSyncState = {
  loadedAssetId: string | null;
  pendingAssetId: string | null;
  requestToken: number;
  wasPlaying: boolean;
};

const elementStates = new WeakMap<HTMLMediaElement, ElementSyncState>();

function getElementState(element: HTMLMediaElement): ElementSyncState {
  let state = elementStates.get(element);
  if (!state) {
    state = {
      loadedAssetId: null,
      pendingAssetId: null,
      requestToken: 0,
      wasPlaying: false,
    };
    elementStates.set(element, state);
  }
  return state;
}

function playElement(element: HTMLMediaElement, state: ElementSyncState) {
  state.wasPlaying = true;
  const token = state.requestToken;
  element.play().catch((error) => {
    if (state.requestToken !== token) return;
    if (error?.name !== "AbortError") console.error(error);
  });
}

function loadAndSyncElement(
  element: HTMLMediaElement,
  isVideo: boolean,
  active: ActiveTrackClip,
  asset: Asset,
  state: ElementSyncState,
) {
  state.pendingAssetId = asset.id;
  const token = ++state.requestToken;

  if (state.wasPlaying) {
    element.pause();
    state.wasPlaying = false;
  }
  if (isVideo) element.style.visibility = "hidden";

  getAssetBlobUrl(asset.id, asset.opfsPath)
    .then((url) => {
      if (state.requestToken !== token) return;

      const onLoaded = () => {
        element.removeEventListener("loadedmetadata", onLoaded);
        if (state.requestToken !== token) return;

        state.loadedAssetId = asset.id;
        state.pendingAssetId = null;

        const live = usePlaybackStore.getState();
        element.playbackRate = live.playbackRate;
        element.currentTime =
          active.clip.inPoint + (live.currentTime - active.clip.startTime);
        if (isVideo) element.style.visibility = "visible";

        if (live.isPlaying) playElement(element, state);
      };

      element.addEventListener("loadedmetadata", onLoaded);
      element.src = url;
    })
    .catch((error) => console.error(error));
}

export function syncMediaElement(
  element: HTMLMediaElement,
  isVideo: boolean,
  active: ActiveTrackClip | null,
  asset: Asset | undefined,
  currentTime: number,
  isPlaying: boolean,
  playbackRate: number,
) {
  const state = getElementState(element);
  element.playbackRate = playbackRate;

  if (!isVideo && active) {
    element.muted = active.track.muted;
  }

  if (!active || !asset) {
    if (state.wasPlaying) {
      element.pause();
      state.wasPlaying = false;
    }
    if (isVideo) element.style.visibility = "hidden";
    return;
  }

  if (state.pendingAssetId && state.pendingAssetId !== asset.id) {
    state.pendingAssetId = null;
    state.requestToken++;
  }

  if (state.loadedAssetId !== asset.id) {
    if (state.pendingAssetId !== asset.id) {
      loadAndSyncElement(element, isVideo, active, asset, state);
    }
    return;
  }

  if (isVideo) element.style.visibility = "visible";

  const sourceTime = active.clip.inPoint + (currentTime - active.clip.startTime);
  if (Math.abs(element.currentTime - sourceTime) > DRIFT_THRESHOLD_SECONDS) {
    element.currentTime = sourceTime;
  }

  if (isPlaying && !state.wasPlaying) {
    playElement(element, state);
  } else if (!isPlaying && state.wasPlaying) {
    state.wasPlaying = false;
    element.pause();
  }
}
