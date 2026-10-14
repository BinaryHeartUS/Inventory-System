import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import AccountView from "./AccountView";

const meta = {
  component: AccountView,
  args: {
    username: "alex",
    roles: [{ chapterId: 1, chapterName: "Central", role: "Editor" }],
    pwError: null,
    pwSuccess: false,
    pwLoading: false,
    onChangePassword: fn(async () => true),
    onLogout: fn(),
  },
} satisfies Meta<typeof AccountView>;
export default meta;
type Story = StoryObj<typeof meta>;
const submitPassword: NonNullable<Story["play"]> = async ({ canvas, args }) => {
  await userEvent.type(canvas.getByTestId("current-password"), "old-password");
  await userEvent.type(canvas.getByTestId("new-password"), "new-password");
  await userEvent.type(canvas.getByTestId("confirm-password"), "new-password");
  await userEvent.click(canvas.getByRole("button", { name: "Update password" }));
  await expect(args.onChangePassword).toHaveBeenCalledWith(
    "old-password",
    "new-password",
    "new-password"
  );
};
export const ChangePassword: Story = {
  play: async (context) => {
    await submitPassword(context);
    await expect(context.canvas.getByTestId("current-password")).toHaveValue("");
  },
};
export const RejectedPassword: Story = {
  args: { onChangePassword: fn(async () => false) },
  play: async (context) => {
    await submitPassword(context);
    await expect(context.canvas.getByTestId("current-password")).toHaveValue("old-password");
  },
};
export const NoAccess: Story = {
  args: { roles: [], username: undefined },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("No chapter access")).toBeVisible();
  },
};
export const Error: Story = { args: { pwError: "Current password is incorrect" } };
export const Success: Story = { args: { pwSuccess: true } };
export const Saving: Story = {
  args: { pwLoading: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button", { name: /Saving/ })).toBeDisabled();
  },
};
export const SignOut: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sign out" }));
    await expect(args.onLogout).toHaveBeenCalledOnce();
  },
};
