/**
 * AddAssetModalContainer — data for the Add Asset wizard.
 *
 * Supplies lookup options and the chapter list from context, and an
 * ID-uniqueness check backed by assetService, to the presentational
 * AddAssetModal.
 */

import type { AnyDevice, Part, Tool } from "../types/inventory";
import { useLookups } from "../hooks/useLookups";
import { useChapters } from "../context/ChapterContext";
import { checkAssetIdExists } from "../services/assetService";
import { AddAssetModal } from "../components/AddAssetModal";

export function AddAssetModalContainer({
  scanId,
  onAdd,
  onCancel,
}: {
  scanId?: number;
  onAdd?: (asset: AnyDevice | Part | Tool) => void;
  onCancel: () => void;
}) {
  const lookups = useLookups();
  const { chapters: chapterList } = useChapters();

  return (
    <AddAssetModal
      scanId={scanId}
      lookups={lookups}
      chapterList={chapterList}
      checkAssetId={checkAssetIdExists}
      onAdd={onAdd}
      onCancel={onCancel}
    />
  );
}
