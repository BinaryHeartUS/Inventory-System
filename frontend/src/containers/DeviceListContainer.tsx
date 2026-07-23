import { useNavigate } from "react-router-dom";
import type { AnyDevice } from "../types/inventory";
import { DeviceList, type SortKey, type SortDir } from "../components/DeviceList";

/**
 * Wraps the presentational {@link DeviceList} and supplies row-click navigation
 * to the device detail page. Pass an explicit `onSelect` to override navigation
 * (e.g. selection in a picker).
 */
export function DeviceListContainer({
  devices,
  exclude,
  onSelect,
  emptyMessage,
  sortKey,
  sortDir,
  onSort,
}: {
  devices: AnyDevice[];
  exclude?: string[];
  onSelect?: (id: number) => void;
  emptyMessage?: React.ReactNode;
  sortKey?: SortKey;
  sortDir?: SortDir;
  onSort?: (key: SortKey, dir: SortDir) => void;
}) {
  const navigate = useNavigate();
  return (
    <DeviceList
      devices={devices}
      exclude={exclude}
      onSelect={onSelect ?? ((id) => navigate(`/devices/${id}`))}
      emptyMessage={emptyMessage}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={onSort}
    />
  );
}
