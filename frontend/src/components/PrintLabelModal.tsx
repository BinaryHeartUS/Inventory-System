import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

// ─── Label dimensions ─────────────────────────────────────────────────────────
// 50 × 30 mm labels at 203 dpi (NIIMBOT standard thermal head resolution):
//   50mm × (203 / 25.4) ≈ 400 px  (print-head axis)
//   30mm × (203 / 25.4) ≈ 240 px  (feed axis)

const LABEL_W = 400;
const LABEL_H = 240;

async function drawLabel(canvas: HTMLCanvasElement, assetId: number) {
  canvas.width = LABEL_W;
  canvas.height = LABEL_H;

  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, LABEL_W, LABEL_H);

  // Organisation logo + name — logo is 60 px tall, vertically centred with the text.
  const LOGO_H = 60;
  const ROW_MID = 66; // vertical midpoint of the header row
  ctx.font = "bold 22px sans-serif";
  const TEXT_LABEL = "BinaryHeart";

  await new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const logoW = Math.round((img.naturalWidth / img.naturalHeight) * LOGO_H);
      const textW = ctx.measureText(TEXT_LABEL).width;
      const gap = 8;
      const startX = Math.round((LABEL_W - logoW - gap - textW) / 2);
      // Force the (potentially coloured) logo to pure B&W so it prints
      // correctly on a monochrome thermal head.
      ctx.filter = "grayscale(1)";
      ctx.drawImage(img, startX, ROW_MID - LOGO_H / 2, logoW, LOGO_H);
      ctx.filter = "none";
      ctx.fillStyle = "black";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(TEXT_LABEL, startX + logoW + gap, ROW_MID);
      ctx.textBaseline = "alphabetic";
      resolve();
    };
    img.onerror = () => {
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(TEXT_LABEL, LABEL_W / 2, 60);
      resolve();
    };
    img.src = "/icon.png";
  });

  // Generate Code128 barcode on a temporary canvas, then blit it centred.
  // "1" prints as "000001", "1042" prints as "001042", etc.
  const tmp = document.createElement("canvas");
  JsBarcode(tmp, String(assetId).padStart(6, "0"), {
    format: "CODE128",
    width: 3, // module (thin bar) width in px
    height: 100, // bar height in px
    displayValue: true, // human-readable digits below bars
    fontSize: 16,
    margin: 0,
    textMargin: 4,
  });

  const bx = Math.round((LABEL_W - tmp.width) / 2);
  ctx.drawImage(tmp, bx, 112);
}

// ─── Component ────────────────────────────────────────────────────────────────

export type PrintStatus = "idle" | "connecting" | "printing" | "done" | "error";

export function PrintLabelModal({
  assetId,
  status,
  errorMsg,
  serialSupported,
  onPrint,
  onClose,
}: {
  assetId: number;
  status: PrintStatus;
  errorMsg: string | null;
  serialSupported: boolean;
  onPrint: (canvas: HTMLCanvasElement) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      drawLabel(canvasRef.current, assetId);
    }
  }, [assetId]);

  const busy = status === "connecting" || status === "printing";
  const paddedId = String(assetId).padStart(6, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop — not dismissible while printing */}
      <div className="absolute inset-0 bg-black/40" onClick={busy ? undefined : onClose} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Print Barcode Label</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Asset <span className="font-mono font-medium text-slate-600">#{paddedId}</span> added
              successfully.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className="ml-4 shrink-0 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Non-Chromium warning */}
        {!serialSupported && (
          <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-200 px-3.5 py-3">
            <svg
              className="shrink-0 mt-0.5 text-amber-500"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p className="text-xs text-amber-800 leading-snug">
              Printing requires a <span className="font-semibold">Chromium-based browser</span>{" "}
              (Chrome, Edge, Opera, etc.). Your current browser does not support the Web Serial API
              needed to communicate with the printer.
            </p>
          </div>
        )}

        {/* Label preview */}
        <div className="px-6 py-5 flex flex-col items-center gap-4">
          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 shadow-inner">
            {/* Displayed at half size (200 × 120 px) — actual canvas is 400 × 240 */}
            <canvas ref={canvasRef} style={{ width: 200, height: 120 }} className="block" />
          </div>

          <p className="text-xs text-center min-h-[16px]">
            {status === "idle" && (
              <span className="text-slate-500">
                Connect the NIIMBOT printer via USB, then click Print.
              </span>
            )}
            {status === "connecting" && (
              <span className="text-blue-600 animate-pulse">Connecting to printer…</span>
            )}
            {status === "printing" && (
              <span className="text-blue-600 animate-pulse">Printing…</span>
            )}
            {status === "done" && (
              <span className="text-green-600 font-medium">Label printed successfully.</span>
            )}
            {status === "error" && (
              <span className="text-red-500">{errorMsg ?? "Print failed. Please try again."}</span>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {status === "done" ? "Close" : "Skip"}
          </button>

          {status !== "done" && (
            <button
              onClick={() => canvasRef.current && onPrint(canvasRef.current)}
              disabled={busy || !serialSupported}
              className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed px-5 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              {busy && (
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
              )}
              {status === "error" ? "Retry" : "Print Label"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
