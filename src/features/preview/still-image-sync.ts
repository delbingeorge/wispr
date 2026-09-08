import type { Asset } from "@/core/types/projects";
import { getAssetBlobUrl } from "./asset-blob-cache";

const requestedAssetIds = new WeakMap<HTMLImageElement, string>();

export function syncStillImage(
  element: HTMLImageElement,
  asset: Asset | undefined,
) {
  if (!asset) {
    element.style.visibility = "hidden";
    return;
  }

  if (requestedAssetIds.get(element) === asset.id) {
    if (element.complete && element.naturalWidth > 0) {
      element.style.visibility = "visible";
    }
    return;
  }

  requestedAssetIds.set(element, asset.id);
  element.style.visibility = "hidden";

  getAssetBlobUrl(asset.id, asset.opfsPath)
    .then((url) => {
      if (requestedAssetIds.get(element) !== asset.id) return;

      const onLoad = () => {
        element.removeEventListener("load", onLoad);
        if (requestedAssetIds.get(element) !== asset.id) return;
        element.style.visibility = "visible";
      };

      element.addEventListener("load", onLoad);
      element.src = url;
    })
    .catch((error) => console.error(error));
}
