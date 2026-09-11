import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { BarcodeFormat, DecodeHintType } from "@zxing/library";

/**
 * Drives a live camera barcode/QR scan into the provided <video> element.
 *
 * Decodes CODE-128 (the format printed on BinaryHeart asset labels) and QR
 * codes. Prefers the rear ("environment") camera. Calls `onDecode` with the
 * decoded text on every successful frame — the caller is responsible for
 * debouncing / acting once.
 */

export type CameraScanError =
  | "permission"
  | "not-found"
  | "insecure"
  | "unsupported"
  | "unknown"
  | null;

interface Options {
  videoRef: RefObject<HTMLVideoElement | null>;
  onDecode: (text: string) => void;
  /** When false, the camera is stopped (e.g. while a result is being handled). */
  active?: boolean;
}

interface Result {
  error: CameraScanError;
  ready: boolean;
  torchSupported: boolean;
  torchOn: boolean;
  toggleTorch: () => void;
}

function buildReader(): BrowserMultiFormatReader {
  const hints = new Map();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.QR_CODE]);
  return new BrowserMultiFormatReader(hints);
}

export function useCameraScanner({ videoRef, onDecode, active = true }: Options): Result {
  // Capability check is stable for the lifetime of the component, so derive it
  // once rather than setting error state inside an effect.
  const unsupportedReason = useMemo<CameraScanError>(() => {
    if (typeof window === "undefined") return "unsupported";
    if (!window.isSecureContext) return "insecure";
    if (!navigator.mediaDevices?.getUserMedia) return "unsupported";
    return null;
  }, []);

  const [error, setError] = useState<CameraScanError>(unsupportedReason);
  const [ready, setReady] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const controlsRef = useRef<IScannerControls | null>(null);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  // Keep the latest callback without restarting the camera on every render.
  const onDecodeRef = useRef(onDecode);
  useEffect(() => {
    onDecodeRef.current = onDecode;
  }, [onDecode]);

  useEffect(() => {
    if (!active || unsupportedReason) return;

    let cancelled = false;
    const reader = buildReader();

    reader
      .decodeFromConstraints(
        { video: { facingMode: { ideal: "environment" } } },
        videoRef.current!,
        (result) => {
          if (result) onDecodeRef.current(result.getText());
        }
      )
      .then((controls) => {
        if (cancelled) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
        setReady(true);

        const stream = videoRef.current?.srcObject as MediaStream | null;
        const track = stream?.getVideoTracks()[0] ?? null;
        trackRef.current = track;
        const caps = track?.getCapabilities?.() as
          | (MediaTrackCapabilities & { torch?: boolean })
          | undefined;
        setTorchSupported(Boolean(caps?.torch));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "SecurityError") setError("permission");
        else if (name === "NotFoundError" || name === "OverconstrainedError") setError("not-found");
        else setError("unknown");
      });

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
      trackRef.current = null;
      setReady(false);
      setTorchOn(false);
    };
  }, [active, unsupportedReason, videoRef]);

  function toggleTorch() {
    const track = trackRef.current;
    if (!track) return;
    const next = !torchOn;
    track
      .applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] })
      .then(() => setTorchOn(next))
      .catch(() => setTorchSupported(false));
  }

  return { error, ready, torchSupported, torchOn, toggleTorch };
}
