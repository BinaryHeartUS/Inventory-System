import type {
  PartChangelogResponse,
  ToolChangelogResponse,
  DeviceChangelogResponse,
} from "./inventory";

/** Fields shared by every changelog entry type — used by the generic ModificationLog component. */
export interface BaseChangelogEntry {
  assetId: number;
  changeType?: string;
  modifiedAt?: string | null;
  modifiedBy?: string;
}

/**
 * A single before/after field pair rendered by the generic ModificationModal.
 * Entity-specific builders (see utils/changelogFields.ts) map a raw changelog
 * entry into an ordered list of these.
 */
export interface ChangelogFieldDef {
  label: string;
  old: string | null;
  new: string | null;
}

/** PartChangelogResponse from the API with `partID` remapped to `assetId`. */
export type PartChangelogEntry = PartChangelogResponse & { assetId: number };

/** ToolChangelogResponse from the API with `toolID` remapped to `assetId`. */
export type ToolChangelogEntry = ToolChangelogResponse & { assetId: number };

/** DeviceChangelogResponse with `deviceID` remapped to `assetId`. */
export type DeviceChangelogEntry = DeviceChangelogResponse & { assetId: number };
