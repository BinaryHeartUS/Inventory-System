import { createRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withRouter } from "../../stories/decorators";
import { device } from "../../stories/fixtures";
import ChapterTabs from "../chapters/ChapterTabs";
import AddAssetButton from "../add-asset/AddAssetButton";
import { DEFAULT_DEVICE_STATUSES, DEVICE_TYPES } from "./deviceFilters";
import DevicesView from "./DevicesView";

const meta = {
  component: DevicesView,
  decorators: [withRouter],
  render: (args) => <DevicesView {...args} sentinelRef={createRef<HTMLDivElement>()} />,
  args: {
    chapterFilterControl: <ChapterTabs chapters={["Central"]} selected="All" onChange={fn()} />,
    addAssetButton: <AddAssetButton onClick={fn()} />,
    search: "",
    onSearchChange: fn(),
    selectedTypes: [...DEVICE_TYPES],
    onSelectedTypesChange: fn(),
    selectedStatuses: [...DEFAULT_DEVICE_STATUSES],
    onSelectedStatusesChange: fn(),
    operatingSystemOptions: ["Linux"],
    selectedOperatingSystems: ["Linux"],
    onSelectedOperatingSystemsChange: fn(),
    chapterFilter: "All",
    onChapterFilterChange: fn(),
    showStuck: false,
    onShowStuckChange: fn(),
    yearFrom: "",
    yearTo: "",
    yearError: null,
    onYearRangeChange: fn(),
    acquiredFrom: "",
    acquiredTo: "",
    acquisitionError: null,
    onAcquisitionRangeChange: fn(),
    sortKey: "id",
    sortDir: "asc",
    onSort: fn(),
    devices: [device],
    loading: false,
    sentinelRef: { current: null },
    deviceSubtitle: "1 device",
    hasFilters: false,
    onClearFilters: fn(),
  },
} satisfies Meta<typeof DevicesView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Overview: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByRole("textbox"), "A");
    await expect(args.onSearchChange).toHaveBeenCalledWith("A");
  },
};
export const Loading: Story = { args: { devices: [], loading: true } };
export const LoadingMore: Story = { args: { loading: true } };
export const Empty: Story = { args: { devices: [] } };
export const FilteredEmpty: Story = {
  args: { devices: [], hasFilters: true },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getAllByRole("button", { name: "Clear filters" })[0]);
    await expect(args.onClearFilters).toHaveBeenCalledOnce();
  },
};
