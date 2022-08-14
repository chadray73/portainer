import { EnvironmentId } from '@/portainer/environments/types';
import PortainerError from '@/portainer/error';

import { NestedDatatable } from '@@/datatables/NestedDatatable';
import { createNestedDatatableStoreHook } from '@@/datatables/nested-table-store';

import { useAMTDevices } from './useAMTDevices';
import { columns } from './columns';

export interface AMTDevicesTableProps {
  environmentId: EnvironmentId;
}

const useStore = createNestedDatatableStoreHook('hostname');

export function AMTDevicesDatatable({ environmentId }: AMTDevicesTableProps) {
  const store = useStore();

  const devicesQuery = useAMTDevices(environmentId);

  return (
    <NestedDatatable
      columns={columns}
      dataset={devicesQuery.devices}
      isLoading={devicesQuery.isLoading}
      settingsStore={store}
      emptyContentLabel={userMessage(devicesQuery.error)}
    />
  );
}

function userMessage(error?: PortainerError) {
  if (error) {
    return error.message;
  }

  return 'No devices found';
}
