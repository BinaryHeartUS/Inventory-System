import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { withRouter } from "../../stories/decorators";
import ChaptersView from "./ChaptersView";

const meta = {
  component: ChaptersView,
  decorators: [withRouter],
  args: {
    chapters: [
      { id: 0, name: "National" },
      { id: 1, name: "Central" },
      { id: 2, name: "West" },
    ],
    summaryByChapter: new Map(),
    summaryLoaded: true,
    isNationalAdmin: true,
    deletingId: null,
    onCreate: fn(async (): Promise<string | null> => null),
    onDelete: fn(),
  },
} satisfies Meta<typeof ChaptersView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const EmptyChapters: Story = { args: { chapters: [] } };
export const Loading: Story = { args: { summaryLoaded: false } };
export const Viewer: Story = {
  args: { isNationalAdmin: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: /New Chapter/ })).not.toBeInTheDocument();
  },
};
export const Deleting: Story = { args: { deletingId: 1 } };
export const Create: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /New Chapter/ }));
    await userEvent.type(canvas.getByRole("textbox"), "  North  ");
    await userEvent.click(canvas.getByRole("button", { name: "Create Chapter" }));
    await expect(args.onCreate).toHaveBeenCalledWith("North");
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
export const BlankName: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: /New Chapter/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Create Chapter" }));
    await expect(canvas.getByText("Chapter name must not be blank.")).toBeVisible();
    await expect(args.onCreate).not.toHaveBeenCalled();
  },
};
export const CreateError: Story = {
  args: { onCreate: fn(async () => "Chapter already exists") },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /New Chapter/ }));
    await userEvent.type(canvas.getByRole("textbox"), "Central");
    await userEvent.click(canvas.getByRole("button", { name: "Create Chapter" }));
    await expect(canvas.getByText("Chapter already exists")).toBeVisible();
  },
};
export const Cancel: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /New Chapter/ }));
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByRole("textbox")).not.toBeInTheDocument();
  },
};
