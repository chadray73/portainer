import { TableSettingsMenuAutoRefresh } from '@@/datatables/TableSettingsMenuAutoRefresh';
import { useTableSettings } from '@@/datatables/useTableSettings';

import { TableSettings } from './types';

export function EdgeDevicesDatatableSettings() {
  const settings = useTableSettings<TableSettings>();

  return (
    <TableSettingsMenuAutoRefresh
      value={settings.autoRefreshRate}
      onChange={handleRefreshRateChange}
    />
  );

  function handleRefreshRateChange(autoRefreshRate: number) {
    settings.setAutoRefreshRate(autoRefreshRate);
  }
}
