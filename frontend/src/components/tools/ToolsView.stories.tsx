import { createRef } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { tool } from "../../stories/fixtures";
import AddAssetButton from "../add-asset/AddAssetButton";
import ChapterTabs from "../chapters/ChapterTabs";
import { ToolRow } from "./ToolRow";
import ToolsView from "./ToolsView";

const meta = {
  component: ToolsView,
  render: (args) => <ToolsView {...args} sentinelRef={createRef<HTMLDivElement>()} />,
  args: {
    tools: [tool],
    loading: false,
    sentinelRef: { current: null },
    summaryLoaded: true,
    toolTotal: 1,
    chapterFilter: "All",
    onChapterChange: fn(),
    hasFilters: false,
    onClearFilters: fn(),
    chapterFilterControl: <ChapterTabs chapters={["Central"]} selected="All" onChange={fn()} />,
    addAssetButton: <AddAssetButton onClick={fn()} />,
    renderRow: (entry) => <ToolRow key={entry.id} tool={entry} chapter="Central" onSelect={fn()} />,
  },
} satisfies Meta<typeof ToolsView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {};
export const Loading: Story = { args: { loading: true, summaryLoaded: false, tools: [] } };
export const Empty: Story = { args: { tools: [], toolTotal: 0 } };
export const FilteredEmpty: Story = {
  args: { tools: [], hasFilters: true },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Clear filters" }));
    await expect(args.onClearFilters).toHaveBeenCalledOnce();
  },
};
