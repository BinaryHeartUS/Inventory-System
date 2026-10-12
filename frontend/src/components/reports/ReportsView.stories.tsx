import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import ReportsView from "./ReportsView";
import ChapterTabs from "../chapters/ChapterTabs";

const meta = {
  component: ReportsView,
  args: {
    chapterFilter: <ChapterTabs chapters={["Central"]} selected="All" onChange={fn()} />,
    selectedChapter: "All",
    onChapterChange: fn(),
    selectedChapterLabel: "All Chapters",
    summaryLoaded: true,
    totalDevices: 20,
    pipeline: 10,
    ready: 5,
    donated: 4,
    scrapped: 1,
    completion: 20,
    pipelineCount: 10,
    valuationCount: 4,
    partsCount: 3,
    toolsCount: 2,
    busyExport: null,
    onExport: fn(),
  },
} satisfies Meta<typeof ReportsView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Exports: Story = {
  play: async ({ canvas, args }) => {
    for (const button of canvas.getAllByRole("button", { name: /Download CSV/ }))
      await userEvent.click(button);
    await expect(args.onExport).toHaveBeenCalledTimes(5);
  },
};
export const Loading: Story = { args: { summaryLoaded: false } };
export const Empty: Story = {
  args: {
    totalDevices: 0,
    pipelineCount: 0,
    valuationCount: 0,
    donated: 0,
    partsCount: 0,
    toolsCount: 0,
  },
};
export const Exporting: Story = { args: { busyExport: "pipeline" } };
