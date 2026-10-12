import type { ReactNode } from "react";

export interface DetailViewContent {
  notesPane?: ReactNode;
  addAssetButton?: ReactNode;
  unsavedChangesGuard?: ReactNode;
  printModal?: ReactNode;
  partyPicker?: ReactNode;
  recipientPicker?: ReactNode;
  devicePicker?: ReactNode;
}
