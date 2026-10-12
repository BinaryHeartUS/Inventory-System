import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import LoginView from "./LoginView";

const meta = {
  component: LoginView,
  args: { error: null, loading: false, onLogin: fn() },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LoginView>;
export default meta;
type Story = StoryObj<typeof meta>;
export const SignIn: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.type(canvas.getByTestId("login-username"), "alex");
    await userEvent.type(canvas.getByTestId("login-password"), "example-password");
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(args.onLogin).toHaveBeenCalledWith("alex", "example-password");
  },
};
export const RequiredFields: Story = {
  play: async ({ canvas, args }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Sign in" }));
    await expect(args.onLogin).not.toHaveBeenCalled();
  },
};
export const Loading: Story = {
  args: { loading: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("button")).toBeDisabled();
  },
};
export const Error: Story = {
  args: { error: "Invalid username or password" },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("Invalid username or password")).toBeVisible();
  },
};
