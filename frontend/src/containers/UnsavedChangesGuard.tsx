import { useEffect } from "react";
import { useBlocker } from "react-router-dom";
import DiscardChangesDialog from "../components/DiscardChangesDialog";

export default function UnsavedChangesGuard({ when }: { when: boolean }) {
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname
  );

  // Native prompt for refresh / tab close / external navigation.
  useEffect(() => {
    if (!when) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [when]);

  if (blocker.state !== "blocked") return null;

  return (
    <DiscardChangesDialog
      onKeepEditing={() => blocker.reset?.()}
      onDiscard={() => blocker.proceed?.()}
    />
  );
}
