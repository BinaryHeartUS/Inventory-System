import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";
import { PrintLabelModal } from "./PrintLabelModal";

const meta = {
  component: PrintLabelModal,
  args: {
    assetIds: [42],
    status: "idle",
    errorMsg: null,
    serialSupported: true,
    onPrint: fn(),
    onClose: fn(),
  },
} satisfies Meta<typeof PrintLabelModal>;
export default meta;
type Story = StoryObj<typeof meta>;
export const PreviewAndPrint: Story = {
  play: async ({ canvas, canvasElement, args }) => {
    const preview = canvasElement.querySelector("canvas")!;
    await expect(preview).toHaveAttribute("width", "400");
    await waitFor(() => {
      const pixels = preview.getContext("2d")!.getImageData(0, 112, 400, 128).data;
      expect(pixels.some((channel, index) => index % 4 !== 3 && channel < 100)).toBe(true);
    });
    await userEvent.click(canvas.getByRole("button", { name: "Print Label" }));
    await expect(args.onPrint).toHaveBeenCalledOnce();
  },
};
export const Batch: Story = { args: { assetIds: [42, 43, 44] } };
export const ShowSingleIdList: Story = { args: { showIdList: true } };
export const Connecting: Story = {
  args: { status: "connecting" },
  play: async ({ canvas, canvasElement, args }) => {
    await expect(canvas.getByRole("button", { name: "Print Label" })).toBeDisabled();
    await userEvent.click(canvasElement.querySelector(".absolute")!);
    await expect(args.onClose).not.toHaveBeenCalled();
  },
};
export const Printing: Story = { args: { status: "printing" } };
export const PrintingBatch: Story = { args: { status: "printing", assetIds: [42, 43] } };
export const Done: Story = {
  args: { status: "done" },
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Close" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
export const BatchDone: Story = { args: { status: "done", assetIds: [42, 43] } };
export const Error: Story = { args: { status: "error", errorMsg: "Printer disconnected" } };
export const ErrorFallback: Story = { args: { status: "error" } };
export const UnsupportedBrowser: Story = { args: { serialSupported: false } };
export const NoIds: Story = { args: { assetIds: [] } };
export const Skip: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Skip" }));
    await expect(args.onClose).toHaveBeenCalledOnce();
  },
};
