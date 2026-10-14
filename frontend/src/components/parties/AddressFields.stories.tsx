import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent } from "storybook/test";
import { AddressFields } from "./AddressFields";

const meta = {
  component: AddressFields,
  args: {
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    setStreet: fn(),
    setCity: fn(),
    setState: fn(),
    setZipCode: fn(),
    setCountry: fn(),
  },
} satisfies Meta<typeof AddressFields>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Empty: Story = {
  play: async ({ canvas, args }) => {
    const inputs = canvas.getAllByRole("textbox");
    for (const [index, callback] of [
      args.setStreet,
      args.setCity,
      args.setState,
      args.setCountry,
    ].entries()) {
      await userEvent.type(inputs[index === 3 ? 4 : index], "A");
      await expect(callback).toHaveBeenCalledWith("A");
    }
    await userEvent.type(inputs[3], "A1");
    await expect(args.setZipCode).toHaveBeenLastCalledWith("1");
  },
};
export const Populated: Story = {
  args: { street: "123 Main St", city: "Chicago", state: "IL", zipCode: "60601", country: "USA" },
};
