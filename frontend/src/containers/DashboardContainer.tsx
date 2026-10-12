import { useState } from "react";
import { useNavigate } from "react-router";
import { useVisibleChapters } from "../context/ChapterContext";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useDashboardData } from "../hooks/useDashboardData";
import DashboardView from "../components/dashboard/DashboardView";
import {
  saveDeviceFilterPreset,
  type DeviceFilters,
} from "../components/devices/deviceFilterStorage";

export default function DashboardContainer() {
  const [selectedChapter, setSelectedChapter] = useState<number | "All">("All");
  const navigate = useNavigate();
  const visibleChapters = useVisibleChapters();

  // Derive the chapter IDs for the currently selected chapter filter
  const selectedChapterIds: number[] =
    selectedChapter === "All" ? visibleChapters.map((c) => c.id) : [selectedChapter];

  // On phones the time-series charts get cramped, so show a shorter range.
  const isMobile = useMediaQuery("(max-width: 639px)");
  const chartMonths = isMobile ? 6 : 12;

  const data = useDashboardData(selectedChapterIds, chartMonths);

  function navigateToDevices(filters: Partial<DeviceFilters>) {
    saveDeviceFilterPreset({ chapter: selectedChapter, ...filters });
    navigate("/devices");
  }

  return (
    <DashboardView
      selectedChapter={selectedChapter}
      onChapterChange={setSelectedChapter}
      chartMonths={chartMonths}
      data={data}
      onStatusSelect={(status) => navigateToDevices({ statuses: [status] })}
      onTypeSelect={(type) => navigateToDevices({ types: [type] })}
      onStuckSelect={() => navigateToDevices({ stuckOnly: true })}
    />
  );
}
