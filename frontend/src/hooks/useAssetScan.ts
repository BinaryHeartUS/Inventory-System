import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { useAddAsset } from "../context/AddAssetContext";
import { getDevice } from "../services/deviceService";
import { getPart } from "../services/partService";
import { getTool } from "../services/toolService";

/**
 * Shared "a code was scanned" handler used by the camera Scanner page.
 *
 * Mirrors the USB-wedge scanner behaviour in App.tsx: a barcode is a numeric
 * asset ID — look it up as a device, then part, then tool, and navigate to the
 * matching detail page. An unknown ID opens the "add asset" flow pre-filled
 * with that ID.
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

      const device = await getDevice(id);
      if (device) {
        navigate(`/devices/${id}`);
        return;
      }

      const part = await getPart(id);
      if (part) {
        navigate(`/parts/${id}`);
        return;
      }

      const tool = await getTool(id);
      if (tool) {
        navigate(`/tools/${id}`);
        return;
      }

      // Unknown ID — offer to create a new asset with this ID.
      openAddAssetModal(id);
    },
    [navigate, showToast, openAddAssetModal]
  );
}
