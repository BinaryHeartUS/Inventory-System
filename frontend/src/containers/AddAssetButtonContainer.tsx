import { useAddAsset } from "../context/AddAssetContext";
import { useWritableChapters } from "../context/ChapterContext";
import AddAssetButton from "../components/add-asset/AddAssetButton";

export default function AddAssetButtonContainer({ className = "" }: { className?: string }) {
  const { openAddAssetModal } = useAddAsset();
  const writableChapters = useWritableChapters();
  if (writableChapters.length === 0) return null;
  return <AddAssetButton className={className} onClick={() => openAddAssetModal()} />;
}
