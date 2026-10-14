import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import DashboardView from "./DashboardView";
import ChapterTabs from "../chapters/ChapterTabs";
import AddAssetButton from "../add-asset/AddAssetButton";
import type { DashboardData } from "../../hooks/useDashboardData";

const data: DashboardData = {
  notStartedCount: 10,
  inProgressCount: 5,
  readyToDonateCount: 3,
  donatedCount: 2,
  desktopCount: 8,
  laptopCount: 8,
  tabletCount: 2,
  totalCount: 18,
  stuckCount: 2,
  completionRate: { donated: 2, total: 20 },
  chapterActivity: {
    activeChapters: 2,
    totalChapters: 3,
    chaptersWorkingOnDevices: 2,
    chaptersWithPickupsReady: 1,
  },
  receivedData: [],
  donatedActivityData: [],
  valueData: [],
  chartsLoading: false,
  completionPct: 10,
  avgDays: 12,
  sampleSize: 2,
};
const meta = {
  component: DashboardView,
  args: {
    selectedChapter: "All",
    onChapterChange: fn(),
    chartMonths: 6,
    data,
    onStatusSelect: fn(),
    onTypeSelect: fn(),
    onStuckSelect: fn(),
    chapterFilter: <ChapterTabs chapters={["Central", "West"]} selected="All" onChange={fn()} />,
    addAssetButton: <AddAssetButton onClick={fn()} />,
  },
} satisfies Meta<typeof DashboardView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Populated: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Not Started/ }));
    await expect(args.onStatusSelect).toHaveBeenCalledWith("Not Started");
    await userEvent.click(canvas.getByRole("button", { name: /Stuck Devices/ }));
    await expect(args.onStuckSelect).toHaveBeenCalledOnce();
  },
};
export const Loading: Story = {
  args: {
    data: {
      ...data,
      notStartedCount: null,
      inProgressCount: null,
      readyToDonateCount: null,
      donatedCount: null,
      desktopCount: null,
      laptopCount: null,
      tabletCount: null,
      totalCount: null,
      stuckCount: null,
      completionRate: null,
      chapterActivity: null,
      avgDays: null,
      chartsLoading: true,
    },
  },
};
export const Empty: Story = {
  args: {
    data: {
      ...data,
      inProgressCount: 0,
      readyToDonateCount: 0,
      totalCount: 0,
      stuckCount: 0,
      avgDays: null,
      sampleSize: 0,
      completionRate: { total: 0, donated: 0 },
    },
  },
};
export const SingleSample: Story = { args: { data: { ...data, sampleSize: 1 } } };
