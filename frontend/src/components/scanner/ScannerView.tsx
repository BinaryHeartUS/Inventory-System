import { useState, type FormEvent, type RefObject } from "react";
import PageHeading from "../PageHeading";
import type { CameraScanError } from "../../hooks/useCameraScanner";

const ERROR_COPY: Record<Exclude<CameraScanError, null>, { title: string; body: string }> = {
  permission: {
    title: "Camera access blocked",
    body: "Allow camera access for this app in your browser or system settings, then try again.",
  },
  "not-found": {
    title: "No camera found",
    body: "This device doesn't expose a usable camera. Enter the asset ID manually below.",
  },
  insecure: {
    title: "Secure connection required",
    body: "Camera scanning needs an HTTPS connection.",
  },
  unsupported: {
    title: "Camera not supported",
    body: "This browser can't access the camera. Enter the asset ID manually below.",
  },
  unknown: {
    title: "Couldn't start the camera",
    body: "Something went wrong starting the camera. Enter the asset ID manually below.",
  },
};

export interface ScannerViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  error: CameraScanError;
  ready: boolean;
  torchSupported: boolean;
  torchOn: boolean;
  onToggleTorch: () => void;
  onManualSubmit: (id: string) => void;
}

/**
 * ScannerView — presentational camera viewfinder + manual ID fallback. The video
 * element ref and camera state are provided by the container; this component owns
 * only the manual-entry input draft.
 */
export default function ScannerView({
  videoRef,
  error,
  ready,
  torchSupported,
  torchOn,
  onToggleTorch,
  onManualSubmit,
}: ScannerViewProps) {
  const [manualId, setManualId] = useState("");

  function submitManual(e: FormEvent) {
    e.preventDefault();
    const value = manualId.trim();
    if (!value) return;
    setManualId("");
    onManualSubmit(value);
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <PageHeading title="Scanner" subtitle="Scan an asset barcode or QR code" compact />

      <div className="space-y-3">
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-900 shadow-sm">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline autoPlay />

          {/* Framing overlay */}
          {!error && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-3/5 w-4/5 rounded-xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
            </div>
          )}

          {/* Camera starting up */}
          {!error && !ready && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
              Starting camera…
            </div>
          )}

          {/* Torch toggle */}
          {ready && torchSupported && (
            <button
              type="button"
              onClick={onToggleTorch}
              aria-label={torchOn ? "Turn off flashlight" : "Turn on flashlight"}
              className={`absolute bottom-3 right-3 rounded-full p-3 backdrop-blur transition-colors ${
                torchOn ? "bg-white text-heart-blue" : "bg-black/40 text-white"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 2h6l-1 7h3l-7 13 1-9H7z" />
              </svg>
            </button>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900 p-6 text-center">
              <p className="text-sm font-semibold text-white">{ERROR_COPY[error].title}</p>
              <p className="text-xs text-slate-300">{ERROR_COPY[error].body}</p>
            </div>
          )}
        </div>

        {!error && (
          <p className="text-center text-sm text-slate-400">
            Point your camera at a label barcode or QR code.
          </p>
        )}
      </div>

      {/* Manual fallback */}
      <form onSubmit={submitManual} className="flex items-center gap-2 pt-2">
        <input
          type="number"
          inputMode="numeric"
          placeholder="Enter asset ID"
          value={manualId}
          onChange={(e) => setManualId(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition-all focus:border-heart-blue focus:ring-2 focus:ring-heart-blue"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-heart-blue px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          disabled={!manualId.trim()}
        >
          Go
        </button>
      </form>
    </div>
  );
}
