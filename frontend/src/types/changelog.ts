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

/** PartChangelogResponse from the API with `partID` remapped to `assetId`. */
export type PartChangelogEntry = PartChangelogResponse & { assetId: number };

/** ToolChangelogResponse from the API with `toolID` remapped to `assetId`. */
export type ToolChangelogEntry = ToolChangelogResponse & { assetId: number };

/** DeviceChangelogResponse with `deviceID` remapped to `assetId`. */
export type DeviceChangelogEntry = DeviceChangelogResponse & { assetId: number };
