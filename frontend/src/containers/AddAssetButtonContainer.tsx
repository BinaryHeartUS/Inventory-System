import { useAddAsset } from "../context/AddAssetContext";
import AddAssetButton from "../components/add-asset/AddAssetButton";

export default function AddAssetButtonContainer({ className = "" }: { className?: string }) {
  const { openAddAssetModal } = useAddAsset();
  return <AddAssetButton className={className} onClick={() => openAddAssetModal()} />;
}
