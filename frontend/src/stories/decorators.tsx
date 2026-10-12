import type { Decorator } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { fn } from "storybook/test";
import NotesPane from "../components/NotesPane";
import AddAssetButton from "../components/add-asset/AddAssetButton";
import { PrintLabelModal } from "../components/PrintLabelModal";
import { PartyPickerModal } from "../components/parties/PartyPickerModal";
import { DevicePickerModal } from "../components/devices/DevicePickerModal";
import { createRef } from "react";
import type { DetailViewContent } from "../components/DetailViewContent";
import { device, organization, person } from "./fixtures";

function DevicePickerContent() {
  return (
    <DevicePickerModal
      devices={[device]}
      loading={false}
      initialLoading={false}
      search=""
      onSearchChange={fn()}
      sentinelRef={createRef<HTMLDivElement>()}
      onSelect={fn()}
      onCancel={fn()}
    />
  );
}

export const detailContent: DetailViewContent = {
  notesPane: <NotesPane notes={[]} onAddNote={fn()} onEditNote={fn()} />,
  addAssetButton: <AddAssetButton onClick={fn()} />,
  unsavedChangesGuard: <></>,
  printModal: (
    <PrintLabelModal
      assetIds={[42]}
      status="idle"
      errorMsg={null}
      serialSupported
      onPrint={fn()}
      onClose={fn()}
    />
  ),
  partyPicker: (
    <PartyPickerModal
      parties={[person, organization]}
      loading={false}
      onSelect={fn()}
      onCancel={fn()}
      onCreate={fn(async () => {})}
    />
  ),
  recipientPicker: (
    <PartyPickerModal
      parties={[person, organization]}
      loading={false}
      onSelect={fn()}
      onCancel={fn()}
      onCreate={fn(async () => {})}
    />
  ),
  devicePicker: <DevicePickerContent />,
};

export const withRouter: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);

export const withTable: Decorator = (Story) => (
  <table className="w-full">
    <tbody>
      <Story />
    </tbody>
  </table>
);
