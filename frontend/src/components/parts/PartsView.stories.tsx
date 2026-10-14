import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { part } from "../../stories/fixtures";
import AddAssetButton from "../add-asset/AddAssetButton";
import ChapterTabs from "../chapters/ChapterTabs";
import { PartRow } from "./PartRow";
import PartsView from "./PartsView";

const meta = {
  component: PartsView,
  args: {
    partTypes: ["RAM", "Charger"],
    filters: {},
    sortedTypes: [
      { type: "RAM", count: 1 },
      { type: "Charger", count: 2 },
    ],
    countsLoading: false,
    totalTypes: 2,
    totalParts: 3,
    chapterFilter: "All",
    typeFilter: "All",
    sourceFilter: "All",
    showInDevice: false,
    expandedTypes: new Set<string>(),
    hasFilters: false,
    onChapterChange: fn(),
    onTypeChange: fn(),
    onSourceChange: fn(),
    onShowInDeviceChange: fn(),
    onToggleGroup: fn(),
    onClearFilters: fn(),
    chapterFilterControl: <ChapterTabs chapters={["Central"]} selected="All" onChange={fn()} />,
    addAssetButton: <AddAssetButton onClick={fn()} />,
    renderTypeRows: (type) => (
      <PartRow part={{ ...part, type }} chapter="Central" onSelect={fn()} hideTypeCol />
    ),
  },
} satisfies Meta<typeof PartsView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Groups: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /RAM 1 part/ }));
    await expect(args.onToggleGroup).toHaveBeenCalledWith("RAM");
    await userEvent.selectOptions(canvas.getAllByRole("combobox")[0], "RAM");
    await expect(args.onTypeChange).toHaveBeenCalledWith("RAM");
    await userEvent.selectOptions(canvas.getAllByRole("combobox")[1], "Purchased");
    await expect(args.onSourceChange).toHaveBeenCalledWith("Purchased");
    await userEvent.click(canvas.getByRole("checkbox"));
    await expect(args.onShowInDeviceChange).toHaveBeenCalledWith(true);
  },
};
export const Expanded: Story = { args: { expandedTypes: new Set(["RAM"]), showInDevice: true } };
export const Empty: Story = { args: { sortedTypes: [], totalTypes: 0, totalParts: 0 } };
export const Loading: Story = { args: { sortedTypes: [], countsLoading: true } };
export const FilteredEmpty: Story = {
  args: { sortedTypes: [], hasFilters: true },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getAllByRole("button", { name: "Clear filters" })[0]);
    await expect(args.onClearFilters).toHaveBeenCalledOnce();
  },
};
