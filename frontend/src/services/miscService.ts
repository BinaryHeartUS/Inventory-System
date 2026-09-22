import { apiDelete, apiGet, apiGetOrNull, apiPost, apiPutVoid, buildQuery } from "./api";
import type {
  IdResponse,
  InsertMiscRequest,
  Misc,
  MiscChangelogResponse,
} from "../types/inventory";
import type { MiscChangelogEntry } from "../types/changelog";

export async function getMiscByDonor(params: {
  donorId: number;
  pageKey: number;
  pageSize: number;
}): Promise<Misc[]> {
  return apiGet<Misc[]>(`/misc${buildQuery(params)}`);
}

export async function getMisc(id: number): Promise<Misc | null> {
  return apiGetOrNull<Misc>(`/misc/${id}`);
}

export async function createMisc(asset: Misc): Promise<Misc> {
  const body: InsertMiscRequest = {
    assetId: asset.id > 0 ? asset.id : undefined,
    description: asset.description,
    acquisitionDate: asset.acquisitionDate ?? undefined,
    value: asset.value,
    donorId: asset.donorId,
  };
  const newId = (await apiPost<IdResponse>("/misc", body)).id;
  return apiGet<Misc>(`/misc/${newId}`);
}

export async function updateMisc(id: number, asset: Misc): Promise<Misc> {
  const body: InsertMiscRequest = {
    assetId: id,
    description: asset.description,
    acquisitionDate: asset.acquisitionDate ?? undefined,
    value: asset.value,
    donorId: asset.donorId,
  };
  await apiPutVoid(`/misc/${id}`, body);
  return apiGet<Misc>(`/misc/${id}`);
}

export async function deleteMisc(id: number): Promise<void> {
  return apiDelete(`/misc/${id}`);
}

export async function getMiscChangelog(id: number): Promise<MiscChangelogEntry[]> {
  const raw = await apiGet<MiscChangelogResponse[]>(`/misc/${id}/changelog`);
  return raw.map((entry) => ({ ...entry, assetId: entry.miscId ?? 0 }));
}
