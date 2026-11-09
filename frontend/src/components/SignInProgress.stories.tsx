import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";
import SignInProgress from "./SignInProgress";

const meta = { component: SignInProgress } satisfies Meta<typeof SignInProgress>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Signing in with BinaryHeart" })
    ).toBeVisible();
    await expect(canvas.getByRole("status")).toHaveTextContent("Please wait...");
    await expect(canvas.getByRole("img", { name: "BinaryHeart" })).toBeVisible();
  },
};

export const Failed: Story = {
  args: {
    children: (
      <div role="alert">
        <p>Sign-in failed. Please start again.</p>
        <a href="/login">Return to sign-in</a>
      </div>
    ),
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole("alert")).toHaveTextContent("Sign-in failed.");
    await expect(canvas.getByRole("link", { name: "Return to sign-in" })).toHaveAttribute(
      "href",
      "/login"
    );
    await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
  },
};
