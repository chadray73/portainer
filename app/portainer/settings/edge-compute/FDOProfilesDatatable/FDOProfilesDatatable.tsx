import { List } from 'react-feather';

import { Datatable } from '@@/datatables';
import { createPersistedStore } from '@@/datatables/types';

import { useColumns } from './columns';
import { FDOProfilesDatatableActions } from './FDOProfilesDatatableActions';
import { useFDOProfiles } from './useFDOProfiles';

const storageKey = 'fdoProfiles';

const settingsStore = createPersistedStore(storageKey, 'name');

export interface FDOProfilesDatatableProps {
  isFDOEnabled: boolean;
}

export function FDOProfilesDatatable({
  isFDOEnabled,
}: FDOProfilesDatatableProps) {
  const columns = useColumns();
  const { isLoading, profiles } = useFDOProfiles();

  return (
    <Datatable
      columns={columns}
      dataset={profiles}
      settingsStore={settingsStore}
      storageKey={storageKey}
      titleOptions={{ title: 'Device Profiles', icon: List }}
      disableSelect={!isFDOEnabled}
      emptyContentLabel="No profiles found"
      getRowId={(row) => row.id.toString()}
      isLoading={isLoading}
      renderTableActions={(selectedItems) => (
        <FDOProfilesDatatableActions
          isFDOEnabled={isFDOEnabled}
          selectedItems={selectedItems}
        />
      )}
    />
  );
}
