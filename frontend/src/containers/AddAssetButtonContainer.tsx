/**
 * AddAssetButtonContainer — wires the presentational AddAssetButton to the
 * add-asset flow via the AddAsset context. Drop-in replacement for the button;
 * accepts the same optional className.
 */

import { useAddAsset } from "../context/AddAssetContext";
import AddAssetButton from "../components/AddAssetButton";

export default function AddAssetButtonContainer({ className = "" }: { className?: string }) {
  const { openAddAssetModal } = useAddAsset();
  return <AddAssetButton className={className} onClick={() => openAddAssetModal()} />;
}
