import { Box, Plus, Trash2 } from 'react-feather';

import { ContainerGroup } from '@/react/azure/types';
import { Authorized } from '@/portainer/hooks/useUser';
import { confirmDeletionAsync } from '@/portainer/services/modal.service/confirm';

import { Datatable } from '@@/datatables';
import { Button } from '@@/buttons';
import { Link } from '@@/Link';

import { columns } from './columns';
import { createStoreHook } from './table-store';

const tableKey = 'containergroups';

const useStore = createStoreHook(tableKey);
export interface Props {
  dataset: ContainerGroup[];
  onRemoveClick(containerIds: string[]): void;
}

export function ContainersDatatable({ dataset, onRemoveClick }: Props) {
  const store = useStore();

  return (
    <Datatable
      dataset={dataset}
      columns={columns}
      storageKey={tableKey}
      settingsStore={store}
      titleOptions={{
        title: 'Containers',
        icon: Box,
      }}
      getRowId={(container) => container.id}
      emptyContentLabel="No container available."
      renderTableActions={(selectedRows) => (
        <>
          <Authorized authorizations="AzureContainerGroupDelete">
            <Button
              color="dangerlight"
              disabled={selectedRows.length === 0}
              onClick={() => handleRemoveClick(selectedRows.map((r) => r.id))}
              icon={Trash2}
            >
              Remove
            </Button>
          </Authorized>

          <Authorized authorizations="AzureContainerGroupCreate">
            <Link to="azure.containerinstances.new" className="space-left">
              <Button icon={Plus}>Add container</Button>
            </Link>
          </Authorized>
        </>
      )}
    />
  );

  async function handleRemoveClick(containerIds: string[]) {
    const confirmed = await confirmDeletionAsync(
      'Are you sure you want to delete the selected containers?'
    );
    if (!confirmed) {
      return null;
    }

    return onRemoveClick(containerIds);
  }
}
