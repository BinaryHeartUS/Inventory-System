/**
 * useLookups — loads all dropdown option lists from the lookup service in one call.
 *
 * Use this hook in any component that renders select/combo fields for editing.
 * The chapter list comes from context and is always available. The remaining
 * option lists are fetched lazily: pass `enabled` (e.g. the page's edit flag) so
 * the network request only fires once the dropdowns are actually needed. When
 * `enabled` is omitted it defaults to `true` for callers that always edit
 * (such as the add-asset modal).
 *
 * Example:
 *   const lookups = useLookups(editing)
 *   <EditCombo options={lookups.manufacturers} ... />
 */

import { useEffect, useRef, useState } from "react";
import type { ChargerStatus, DeviceStatus, WorkingBattery } from "../types/inventory";
import { getAllLookups } from "../services/lookupService";
import { useWritableChapters } from "../context/ChapterContext";

export interface LookupData {
  chapters: string[];
  manufacturers: string[];
  ramGenerations: string[];
  storageTypes: string[];
  partTypes: string[];
  operatingSystems: string[];
  deviceStatuses: DeviceStatus[];
  chargerStatuses: ChargerStatus[];
  workingBatteryOpts: WorkingBattery[];
  wifiOpts: ["Yes", "No", "Unknown"];
}

const WIFI_OPTS: LookupData["wifiOpts"] = ["Yes", "No", "Unknown"];

export function useLookups(enabled: boolean = true): LookupData {
  const chapterList = useWritableChapters();
  const [rest, setRest] = useState({
    manufacturers: [] as string[],
    ramGenerations: [] as string[],
    storageTypes: [] as string[],
    partTypes: [] as string[],
    operatingSystems: [] as string[],
    deviceStatuses: [] as DeviceStatus[],
    chargerStatuses: [] as ChargerStatus[],
    workingBatteryOpts: [] as WorkingBattery[],
  });
  const loadedRef = useRef(false);

  useEffect(() => {
    // Defer the lookup fetch until the options are actually needed (e.g. edit mode).
    if (!enabled || loadedRef.current) return;
    loadedRef.current = true;
    getAllLookups()
      .then((data) => setRest(data))
      .catch(() => {
        // Lookup endpoint not yet available; allow a later retry and leave arrays empty
        loadedRef.current = false;
      });
  }, [enabled]);

  return { ...rest, chapters: chapterList.map((c) => c.name), wifiOpts: WIFI_OPTS };
}
