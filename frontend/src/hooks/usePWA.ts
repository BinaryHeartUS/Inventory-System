import { useEffect, useState } from "react";

/**
 * Detects whether the app is running as an installed PWA (standalone display
 * mode) and whether the device is touch-capable.
 *
 * `isStandalone` — true when launched from the home screen / installed app,
 * as opposed to a normal browser tab. Reacts to display-mode changes.
 * `isTouch` — true on touch-capable devices (phones/tablets).
 *
 * The camera Scanner tab is shown on any touch-capable device.
 */

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mql = window.matchMedia?.("(display-mode: standalone)");
  // iOS Safari exposes navigator.standalone instead of display-mode.
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return Boolean(mql?.matches || iosStandalone);
}

function detectTouch(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    window.matchMedia?.("(pointer: coarse)").matches
  );
}

export function usePWA(): { isStandalone: boolean; isTouch: boolean } {
  const [isStandalone, setIsStandalone] = useState(detectStandalone);
  const [isTouch] = useState(detectTouch);

  useEffect(() => {
    const mql = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setIsStandalone(detectStandalone());
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return { isStandalone, isTouch };
}
