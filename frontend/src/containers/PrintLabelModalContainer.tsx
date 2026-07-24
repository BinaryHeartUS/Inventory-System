import { useState } from "react";
import { NiimbotSerialClient, ImageEncoder } from "@mmote/niimbluelib";
import { PrintLabelModal, type PrintStatus } from "../components/PrintLabelModal";

export function PrintLabelModalContainer({
  assetId,
  onClose,
}: {
  assetId: number;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<PrintStatus>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const serialSupported = "serial" in navigator;

  async function handlePrint(canvas: HTMLCanvasElement) {
    setStatus("connecting");
    setErrorMsg(null);

    // NiimbotSerialClient uses Web Serial API (Chromium 89+).
    // connect() triggers the browser's port-picker dialog on first use.
    const client = new NiimbotSerialClient();
    try {
      await client.connect();
      setStatus("printing");

      // 'top' = no rotation — canvas width (400 px) maps to the 50 mm print head.
      // If your labels come out sideways, change 'top' to 'left'.
      const encoded = ImageEncoder.encodeCanvas(canvas, "top");

      // getPrintTaskType() auto-detects for some models; falls back to 'B1'.
      // If your printer model is not auto-detected, change 'B1' to match your model.
      const taskType = client.getPrintTaskType() ?? "B1";
      const task = client.abstraction.newPrintTask(taskType, {
        totalPages: 1,
        statusPollIntervalMs: 100,
        statusTimeoutMs: 8_000,
      });

      await task.printInit();
      await task.printPage(encoded, 1);
      await task.waitForPageFinished();
      await task.waitForFinished();
      setStatus("done");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      // "Failed to open serial port" on Linux almost always means either:
      //   1. The user's account is not in the `dialout` group, or
      //   2. The `brltty` service has claimed the port (common on Debian/Ubuntu).
      if (msg.toLowerCase().includes("failed to open serial port")) {
        setErrorMsg(
          "Could not open the port. If on Linux: run  sudo usermod -aG dialout $USER  " +
            "and log out/in. " +
            "On any OS, close the NIIMBOT app if it is running."
        );
      } else {
        setErrorMsg(msg);
      }
      setStatus("error");
    } finally {
      try {
        client.disconnect();
      } catch {
        /* ignore disconnect errors */
      }
    }
  }

  return (
    <PrintLabelModal
      assetId={assetId}
      status={status}
      errorMsg={errorMsg}
      serialSupported={serialSupported}
      onPrint={handlePrint}
      onClose={onClose}
    />
  );
}
