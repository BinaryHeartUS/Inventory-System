import { fireEvent, userEvent } from "storybook/test";

export async function changeFormControls(element: HTMLElement) {
  for (const control of element.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea")) {
    if (control.disabled || !control.isConnected) continue;
    if (control instanceof HTMLSelectElement) {
      for (const option of Array.from(control.options)) {
        if (!option.disabled) await userEvent.selectOptions(control, option.value);
      }
    } else if (
      control instanceof HTMLInputElement &&
      (control.type === "checkbox" || control.type === "radio")
    ) {
      await userEvent.click(control);
    } else if (control instanceof HTMLInputElement && control.type === "date") {
      fireEvent.change(control, { target: { value: "2026-01-16" } });
      fireEvent.change(control, { target: { value: "" } });
    } else {
      await userEvent.clear(control);
      await userEvent.type(
        control,
        control instanceof HTMLInputElement && control.type === "number" ? "1" : "A"
      );
    }
  }
}
