import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../context/ToastContext";
import { useAddAsset } from "../context/AddAssetContext";
import { getAssetPath } from "../services/assetService";

/**
 * Shared "a code was scanned" handler used by the camera Scanner page.
 *
 * Mirrors the USB-wedge scanner behaviour in App.tsx: a barcode is a numeric
 * asset ID, so resolve its asset type and navigate to the matching detail page.
 * An unknown ID opens the "add asset" flow pre-filled with that ID.
 *
 * Must be used within AddAssetProvider (i.e. inside a routed page).
 */
export function useAssetScan() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { openAddAssetModal } = useAddAsset();

  return useCallback(
    async (barcode: string): Promise<void> => {
      const id = Number(barcode.trim());
      if (!barcode.trim() || Number.isNaN(id)) {
        showToast(`Invalid barcode: "${barcode}"`, false);
        return;
      }

      const path = await getAssetPath(id);
      if (path) {
        navigate(path);
        return;
      }

      // Unknown ID — offer to create a new asset with this ID.
      openAddAssetModal(id);
    },
    [navigate, showToast, openAddAssetModal]
  );
}
