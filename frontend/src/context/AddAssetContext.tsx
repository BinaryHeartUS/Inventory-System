import { createContext, useContext, type ReactNode } from "react";

interface AddAssetContextValue {
  openAddAssetModal: (scanId?: number) => void;
}

const AddAssetContext = createContext<AddAssetContextValue | undefined>(undefined);

interface Props {
  children: ReactNode;
  onOpen: (scanId?: number) => void;
}

export function AddAssetProvider({ children, onOpen }: Props) {
  return (
    <AddAssetContext.Provider value={{ openAddAssetModal: onOpen }}>
      {children}
    </AddAssetContext.Provider>
  );
}

export function useAddAsset() {
  const context = useContext(AddAssetContext);
  if (!context) {
    throw new Error("useAddAsset must be used within AddAssetProvider");
  }
  return context;
}
