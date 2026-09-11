/**
 * Whether this device/browser can print asset labels.
 *
 * Label printing talks to a Niimbot label printer over the Web Serial API
 * (`navigator.serial`), which requires a USB serial connection and a Chromium
 * desktop browser. It is unavailable on mobile browsers (phones/tablets) and on
 * desktop browsers without Web Serial (e.g. Firefox, Safari). Hiding the
 * print-label UI where it can't work avoids offering an action that would fail.
 */
export function canPrintLabels(): boolean {
  return typeof navigator !== "undefined" && "serial" in navigator;
}
