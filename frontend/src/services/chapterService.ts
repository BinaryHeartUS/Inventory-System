import { apiGet } from "./api";
import type { ChapterSummary } from "../types/inventory";

export async function getChapters(): Promise<ChapterSummary[]> {
  return apiGet<ChapterSummary[]>("/chapters");
}
