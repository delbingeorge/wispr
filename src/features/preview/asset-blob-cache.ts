import { readFileFromOpfs } from "@/core/storage/opfs-storage";

const resolvedUrls = new Map<string, string>();
const pendingUrls = new Map<string, Promise<string>>();

export function getAssetBlobUrl(
  assetId: string,
  opfsPath: string,
): Promise<string> {
  const resolved = resolvedUrls.get(assetId);
  if (resolved) return Promise.resolve(resolved);

  const pending = pendingUrls.get(assetId);
  if (pending) return pending;

  const request = readFileFromOpfs(opfsPath)
    .then((file) => {
      const url = URL.createObjectURL(file);
      resolvedUrls.set(assetId, url);
      pendingUrls.delete(assetId);
      return url;
    })
    .catch((error) => {
      pendingUrls.delete(assetId);
      throw error;
    });

  pendingUrls.set(assetId, request);
  return request;
}

export function releaseAllAssetBlobUrls(): void {
  for (const url of resolvedUrls.values()) {
    URL.revokeObjectURL(url);
  }
  resolvedUrls.clear();
  pendingUrls.clear();
}
