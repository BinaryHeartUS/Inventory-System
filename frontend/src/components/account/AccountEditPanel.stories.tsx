import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { AccountEditPanel } from "./AccountEditPanel";

const meta = {
  component: AccountEditPanel,
  args: {
    account: {
      id: 2,
      name: "Alex",
      username: "alex",
      chapterRoles: [{ chapterId: 1, role: "Editor" }],
    },
    assignableRoles: ["Admin", "Chapter Admin", "Editor", "Viewer"],
    assignableChapters: [
      { id: 0, name: "National" },
      { id: 1, name: "Central" },
      { id: 3, name: "West" },
    ],
    nationalChapterId: 0,
    currentUserId: 10,
    chapterName: (id) => (id === 0 ? "National" : "Central"),
    onClose: fn(),
    onSaveRole: fn(async () => {}),
    onRemoveRole: fn(async () => {}),
    onAddRole: fn(async () => {}),
    onDeleteAccount: fn(async () => false),
  },
} satisfies Meta<typeof AccountEditPanel>;
export default meta;
type Story = StoryObj<typeof meta>;
const saveRole: NonNullable<Story["play"]> = async ({ canvas, args }) => {
  await userEvent.selectOptions(canvas.getAllByRole("combobox")[0], "Viewer");
  await userEvent.click(canvas.getByRole("button", { name: "Save" }));
  await expect(args.onSaveRole).toHaveBeenCalledWith(1, "Viewer");
};
export const SaveRole: Story = { play: saveRole };
export const SaveError: Story = {
  args: {
    onSaveRole: fn(async () => {
      throw new Error("Unable to save role");
    }),
  },
  play: async (context) => {
    await saveRole(context);
    await expect(context.canvas.getByText("Unable to save role")).toBeVisible();
  },
};
export const RemoveRole: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Remove" }));
    await expect(args.onRemoveRole).toHaveBeenCalledWith(1);
  },
};
export const RemoveError: Story = {
  args: {
    onRemoveRole: fn(async () => {
      throw new Error("Unable to remove role");
    }),
  },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Remove" }));
    await expect(canvas.getByText("Unable to remove role")).toBeVisible();
  },
};
const addRole: NonNullable<Story["play"]> = async ({ canvas, args }) => {
  await userEvent.selectOptions(canvas.getAllByRole("combobox")[1], "3");
  await userEvent.selectOptions(canvas.getAllByRole("combobox")[2], "Viewer");
  await userEvent.click(canvas.getByRole("button", { name: "Add" }));
  await expect(args.onAddRole).toHaveBeenCalledWith(3, "Viewer");
};
export const AddRole: Story = { play: addRole };
export const AddError: Story = {
  args: {
    onAddRole: fn(async () => {
      throw new Error("Unable to add role");
    }),
  },
  play: async (context) => {
    await addRole(context);
    await expect(context.canvas.getByText("Unable to add role")).toBeVisible();
  },
};
export const Self: Story = {
  args: { currentUserId: 2 },
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole("combobox")[0]).toBeDisabled();
    await expect(canvas.queryByRole("button", { name: "Delete Account" })).not.toBeInTheDocument();
  },
};
export const Admin: Story = {
  args: {
    account: {
      id: 2,
      name: "Alex",
      username: "alex",
      chapterRoles: [{ chapterId: 0, role: "Admin" }],
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("combobox")).not.toBeInTheDocument();
  },
};
export const NationalRole: Story = {
  args: {
    account: {
      id: 2,
      name: "Alex",
      username: "alex",
      chapterRoles: [{ chapterId: 0, role: "Viewer" }],
    },
  },
};
export const DeleteCancelled: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete Account" }));
    await expect(args.onDeleteAccount).toHaveBeenCalledOnce();
    await expect(canvas.getByRole("button", { name: "Delete Account" })).toBeEnabled();
  },
};
export const DeleteProceeding: Story = {
  args: { onDeleteAccount: fn(async () => true) },
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Delete Account" }));
    await expect(canvas.getByRole("button", { name: /Deleting/ })).toBeDisabled();
  },
};
