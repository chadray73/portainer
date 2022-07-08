import { TableSettingsMenuAutoRefresh } from '@@/datatables/TableSettingsMenuAutoRefresh';
import { useOldTableSettings } from '@@/datatables/useOldTableSettings';

import { EdgeDeviceTableSettings } from './types';

export function EdgeDevicesDatatableSettings() {
  const { settings, setTableSettings } =
    useOldTableSettings<EdgeDeviceTableSettings>();

  return (
    <TableSettingsMenuAutoRefresh
      value={settings.autoRefreshRate}
      onChange={handleRefreshRateChange}
    />
  );

  function handleRefreshRateChange(autoRefreshRate: number) {
    setTableSettings({ autoRefreshRate });
  }
}
