import { useCallback, useRef } from "react";
import { useCameraScanner } from "../hooks/useCameraScanner";
import { useAssetScan } from "../hooks/useAssetScan";
import ScannerView from "../components/scanner/ScannerView";

/**
 * ScannerContainer — owns the camera scanner lifecycle and asset-scan routing.
 * Creates the video ref (forwarded to the view), debounces repeated decodes, and
 * dispatches both scanned and manually-entered IDs through useAssetScan.
 */
export default function ScannerContainer() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const busyRef = useRef(false);

  const handleScan = useAssetScan();

  const onDecode = useCallback(
    (text: string) => {
      // Act on the first valid code, then briefly ignore repeats so a code held
      // in frame doesn't fire repeatedly.
      if (busyRef.current) return;
      busyRef.current = true;
      void handleScan(text).finally(() => {
        window.setTimeout(() => {
          busyRef.current = false;
        }, 1500);
      });
    },
    [handleScan]
  );

  const { error, ready, torchSupported, torchOn, toggleTorch } = useCameraScanner({
    videoRef,
    onDecode,
  });

  const handleManualSubmit = useCallback(
    (value: string) => {
      void handleScan(value);
    },
    [handleScan]
  );

  return (
    <ScannerView
      videoRef={videoRef}
      error={error}
      ready={ready}
      torchSupported={torchSupported}
      torchOn={torchOn}
      onToggleTorch={toggleTorch}
      onManualSubmit={handleManualSubmit}
    />
  );
}
