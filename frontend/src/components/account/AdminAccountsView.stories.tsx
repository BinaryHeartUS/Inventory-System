import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import AdminAccountsView from "./AdminAccountsView";
import { AccountEditPanel } from "./AccountEditPanel";

const account = {
  id: 2,
  name: "Alex",
  username: "alex",
  chapterRoles: [{ chapterId: 1, role: "Editor" }],
};
const chapters = [
  { id: 0, name: "National" },
  { id: 1, name: "Central" },
];
const meta = {
  component: AdminAccountsView,
  args: {
    isAdmin: true,
    canManage: true,
    groups: [{ chapterId: 1, name: "Central", accounts: [account] }],
    accountsLoaded: true,
    listError: null,
    assignableRoles: ["Admin", "Chapter Admin", "Editor", "Viewer"],
    assignableChapters: chapters,
    nationalChapterId: 0,
    currentUserId: 10,
    chapterName: () => "Central",
    onCreate: fn(async (): Promise<string | null> => null),
    onReload: fn(),
    renderEditPanel: (entry, onClose, onDeleted) => (
      <AccountEditPanel
        account={entry}
        assignableRoles={["Editor", "Viewer"]}
        assignableChapters={chapters}
        nationalChapterId={0}
        currentUserId={10}
        chapterName={() => "Central"}
        onClose={onClose}
        onSaveRole={async () => {}}
        onRemoveRole={async () => {}}
        onAddRole={async () => {}}
        onDeleteAccount={async () => {
          onDeleted();
          return true;
        }}
      />
    ),
  },
} satisfies Meta<typeof AdminAccountsView>;
export default meta;
type Story = StoryObj<typeof meta>;
const createAccount: NonNullable<Story["play"]> = async ({ canvas, args }) => {
  await userEvent.click(canvas.getByRole("button", { name: "New Account" }));
  await userEvent.type(canvas.getByTestId("account-full-name"), "Alex");
  await userEvent.type(canvas.getByTestId("account-username"), "alex");
  await userEvent.type(canvas.getByTestId("account-password"), "example-password");
  await userEvent.selectOptions(canvas.getByTestId("account-chapter-0"), "1");
  await userEvent.selectOptions(canvas.getByTestId("account-role-0"), "Editor");
  await userEvent.click(canvas.getByRole("button", { name: "Create Account" }));
  await expect(args.onCreate).toHaveBeenCalledWith({
    name: "Alex",
    username: "alex",
    password: "example-password",
    affiliations: [{ chapter: "1", role: "Editor" }],
  });
};
export const Groups: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: /Central/ }));
    await expect(canvas.getByText("alex")).toBeVisible();
    await userEvent.click(canvas.getByText("alex"));
    await expect(canvas.getByRole("button", { name: "Delete Account" })).toBeVisible();
  },
};
export const Create: Story = {
  play: async (context) => {
    await createAccount(context);
    await expect(context.canvas.queryByTestId("account-full-name")).not.toBeInTheDocument();
  },
};
export const CreateError: Story = {
  args: { onCreate: fn(async (): Promise<string | null> => "Username already exists") },
  play: async (context) => {
    await createAccount(context);
    await expect(context.canvas.getByText("Username already exists")).toBeVisible();
  },
};
export const CancelCreate: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "New Account" }));
    await userEvent.click(canvas.getByRole("button", { name: "Cancel" }));
    await expect(canvas.queryByTestId("account-full-name")).not.toBeInTheDocument();
  },
};
export const ChapterAdmin: Story = {
  args: { isAdmin: false, assignableRoles: ["Editor", "Viewer"] },
};
export const ReadOnly: Story = {
  args: { canManage: false },
  play: async ({ canvas }) => {
    await expect(canvas.queryByRole("button", { name: "New Account" })).not.toBeInTheDocument();
  },
};
export const Loading: Story = { args: { accountsLoaded: false } };
export const Empty: Story = { args: { groups: [] } };
export const Error: Story = { args: { listError: "Unable to load accounts" } };
