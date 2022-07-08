import { TableSettingsOldProvider } from '@@/datatables/useOldTableSettings';

import {
  FDOProfilesDatatable,
  FDOProfilesDatatableProps,
} from './FDOProfilesDatatable';

export function FDOProfilesDatatableContainer({
  ...props
}: FDOProfilesDatatableProps) {
  const defaultSettings = {
    pageSize: 10,
    sortBy: { id: 'name', desc: false },
  };

  return (
    <TableSettingsOldProvider
      defaults={defaultSettings}
      storageKey="fdoProfiles"
    >
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <FDOProfilesDatatable {...props} />
    </TableSettingsOldProvider>
  );
}
