import type { PartChangelogResponse } from './inventory'

/** Fields shared by every changelog entry type — used by the generic ModificationLog component. */
export interface BaseChangelogEntry {
  assetId: number
  changeType?: string
  modifiedAt?: string | null
  modifiedBy?: string
}

/** PartChangelogResponse from the API with `partID` remapped to `assetId`. */
export type PartChangelogEntry = PartChangelogResponse & { assetId: number }
