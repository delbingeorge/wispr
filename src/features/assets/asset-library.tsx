import { useMemo, useRef, useState } from "react";
import { useProjectStore } from "@/core/stores/project-store";
import {
  useAssetLibraryStore,
  type AssetLibraryFilter,
} from "@/core/stores/asset-library-store";
import { addAssetsToTimeline } from "./add-assets-to-timeline";
import { useMediaImport } from "./use-media-import";
import { AssetLibraryCard } from "./asset-library-card";
import { Close, Search } from "@/assets/icons";
import styles from "./styles/asset-library.module.css";

const FILTERS: { label: string; value: AssetLibraryFilter }[] = [
  { label: "All", value: "all" },
  { label: "Video", value: "video" },
  { label: "Image", value: "image" },
  { label: "Audio", value: "audio" },
];

export function AssetLibrary() {
  const targetTrackId = useAssetLibraryStore((s) => s.targetTrackId);
  const initialFilter = useAssetLibraryStore((s) => s.initialFilter);
  const close = useAssetLibraryStore((s) => s.close);
  const assets = useProjectStore((s) => s.project.assets);
  const { importFiles } = useMediaImport();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [filter, setFilter] = useState<AssetLibraryFilter>(initialFilter);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionAnchorId, setSelectionAnchorId] = useState<string | null>(
    null,
  );

  const visibleAssets = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assets.filter(
      (asset) =>
        (filter === "all" || asset.type === filter) &&
        (!q || asset.name.toLowerCase().includes(q)),
    );
  }, [assets, filter, query]);

  const handleCardClick = (assetId: string, event: React.MouseEvent) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (event.shiftKey && selectionAnchorId) {
        const ids = visibleAssets.map((a) => a.id);
        const anchorIndex = ids.indexOf(selectionAnchorId);
        const clickedIndex = ids.indexOf(assetId);
        if (anchorIndex !== -1 && clickedIndex !== -1) {
          const [start, end] = [anchorIndex, clickedIndex].sort(
            (a, b) => a - b,
          );
          for (let i = start; i <= end; i++) next.add(ids[i]);
          return next;
        }
      }
      if (next.has(assetId)) {
        next.delete(assetId);
      } else {
        next.add(assetId);
      }
      return next;
    });
    setSelectionAnchorId(assetId);
  };

  const handleAddToTimeline = () => {
    addAssetsToTimeline([...selectedIds], targetTrackId);
    close();
  };

  const handleImportClick = () => {
    close();
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) void importFiles(files);
    e.target.value = "";
  };

  const countText = selectedIds.size
    ? `${selectedIds.size} selected`
    : visibleAssets.length === assets.length
      ? `${assets.length} items`
      : `${visibleAssets.length} of ${assets.length}`;

  return (
    <div className={styles.overlay} onClick={close}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <span className={styles.title}>Assets</span>
          <span className={styles.count}>{countText}</span>
          <button className={styles.closeBtn} onClick={close} title="Close">
            <Close />
          </button>
        </div>

        <label className={styles.search}>
          <Search />
          <input
            type="search"
            placeholder="Search assets"
            spellCheck={false}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`${styles.chip} ${filter === f.value ? styles.chipOn : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.grid}>
          {visibleAssets.map((asset) => (
            <AssetLibraryCard
              key={asset.id}
              asset={asset}
              selected={selectedIds.has(asset.id)}
              onClick={(e) => handleCardClick(asset.id, e)}
            />
          ))}
        </div>

        {visibleAssets.length === 0 && (
          <p className={styles.empty}>
            {assets.length === 0
              ? "No assets yet — import media to get started."
              : "No assets match that search."}
          </p>
        )}

        <div className={styles.foot}>
          <button className={styles.importBtn} onClick={handleImportClick}>
            Import media
          </button>
          <button
            className={styles.addBtn}
            disabled={selectedIds.size === 0}
            onClick={handleAddToTimeline}
          >
            {selectedIds.size ? `Add ${selectedIds.size} to timeline` : "Add to timeline"}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,image/*,audio/*"
          multiple
          hidden
          onChange={handleFileInputChange}
        />
      </div>
    </div>
  );
}
