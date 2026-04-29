/**
 * useLookups — loads all dropdown option lists from the lookup service in one call.
 *
 * Use this hook in any component that renders select/combo fields for editing.
 * All arrays start empty and are populated on mount; since the mock service
 * resolves synchronously, there is no visible loading flash in development.
 * With real API calls the arrays will arrive slightly later — components should
 * handle this gracefully (selects with no options initially are fine).
 *
 * Example:
 *   const lookups = useLookups()
 *   <EditCombo options={lookups.manufacturers} ... />
 */

import { useEffect, useState } from 'react'
import type { ChargerStatus, DeviceStatus, WorkingBattery } from '../types/inventory'
import { getAllLookups } from '../services/lookupService'
import { useVisibleChapters } from '../context/ChapterContext'

export interface LookupData {
  chapters: string[]
  manufacturers: string[]
  ramGenerations: string[]
  storageTypes: string[]
  partTypes: string[]
  toolTypes: string[]
  deviceStatuses: DeviceStatus[]
  chargerStatuses: ChargerStatus[]
  workingBatteryOpts: WorkingBattery[]
  wifiOpts: ['Yes', 'No', 'Unknown']
}

const WIFI_OPTS: LookupData['wifiOpts'] = ['Yes', 'No', 'Unknown']

export function useLookups(): LookupData {
  const chapterList = useVisibleChapters()
  const [rest, setRest] = useState({
    manufacturers: [] as string[],
    ramGenerations: [] as string[],
    storageTypes: [] as string[],
    partTypes: [] as string[],
    toolTypes: [] as string[],
    deviceStatuses: [] as DeviceStatus[],
    chargerStatuses: [] as ChargerStatus[],
    workingBatteryOpts: [] as WorkingBattery[],
  })

  useEffect(() => {
    getAllLookups()
      .then(data => setRest(data))
      .catch(() => {
        // Lookup endpoint not yet available; leave arrays empty so the rest of the UI still renders
      })
  }, [])

  return { ...rest, chapters: chapterList.map(c => c.name), wifiOpts: WIFI_OPTS }
}
