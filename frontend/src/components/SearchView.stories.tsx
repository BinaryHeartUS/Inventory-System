import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withRouter } from "../stories/decorators";
import { device, part, tool } from "../stories/fixtures";
import SearchView from "./SearchView";

const meta = {
  component: SearchView,
  decorators: [withRouter],
  args: {
    assetId: "",
    assetIdError: null,
    findingAsset: false,
    onAssetIdChange: fn(),
    onAssetIdSearch: fn(),
    query: "",
    onQueryChange: fn(),
    searching: false,
    deviceResults: [],
    partResults: [],
    toolResults: [],
    resultCap: 50,
    chapterName: () => "Central",
  },
} satisfies Meta<typeof SearchView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SearchControls: Story = {
  args: { query: "ThinkPad" },
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("spinbutton"), "1");
    await expect(args.onAssetIdChange).toHaveBeenCalledWith("1");
    await userEvent.type(canvas.getByRole("textbox"), "A");
    await expect(args.onQueryChange).toHaveBeenCalledWith("ThinkPadA");
    await userEvent.click(canvas.getByRole("button", { name: "" }));
    await expect(args.onQueryChange).toHaveBeenLastCalledWith("");
  },
};
export const Empty: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Start typing to search across all inventory")).toBeVisible();
  },
};
export const AssetId: Story = {
  args: { assetId: "42" },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Search by asset ID" }));
    await expect(args.onAssetIdSearch).toHaveBeenCalledOnce();
  },
};
export const FindingAsset: Story = { args: { findingAsset: true } };
export const AssetError: Story = { args: { assetIdError: "Asset not found" } };
export const Searching: Story = { args: { query: "ThinkPad", searching: true } };
export const NoResults: Story = { args: { query: "missing" } };
export const AllResults: Story = {
  args: {
    query: "Central",
    deviceResults: [
      device,
      { ...device, id: 46, type: "Desktop" },
      { ...device, id: 47, type: "Tablet", deviceStuck: true },
    ],
    partResults: [part, { ...part, id: 48, wasPurchased: false }],
    toolResults: [tool],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("link")).toHaveLength(6);
  },
};
export const SingleResult: Story = { args: { query: "ThinkPad", deviceResults: [device] } };
export const Capped: Story = { args: { query: "Central", deviceResults: [device], resultCap: 1 } };
