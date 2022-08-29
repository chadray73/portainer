import { Environment } from '@/portainer/environments/types';
import { notifySuccess } from '@/portainer/services/notifications';
import { Datatable as GenericDatatable } from '@/react/components/datatables';

import { Button } from '@@/buttons';
import { TextTip } from '@@/Tip/TextTip';

import { useAssociateDeviceMutation, useLicenseOverused } from '../queries';

import { columns } from './columns';
import { createStore } from './store';

const storageKey = 'edge-devices-waiting-room';

const settingsStore = createStore(storageKey);

interface Props {
  devices: Environment[];
  isLoading: boolean;
  totalCount: number;
}

export function Datatable({ devices, isLoading, totalCount }: Props) {
  const associateMutation = useAssociateDeviceMutation();
  const licenseOverused = useLicenseOverused();

  return (
    <GenericDatatable
      columns={columns}
      dataset={devices}
      storageKey={storageKey}
      titleOptions={{ title: 'Edge Devices Waiting Room' }}
      settingsStore={settingsStore}
      emptyContentLabel="No Edge Devices found"
      renderTableActions={(selectedRows) => (
        <>
          <Button
            onClick={() => handleAssociateDevice(selectedRows)}
            disabled={selectedRows.length === 0}
          >
            Associate Device
          </Button>

          {licenseOverused ? (
            <div className="ml-2 mt-2">
              <TextTip color="orange">
                Associating devices is disabled as your node count exceeds your
                license limit
              </TextTip>
            </div>
          ) : null}
        </>
      )}
      isLoading={isLoading}
      totalCount={totalCount}
    />
  );

  function handleAssociateDevice(devices: Environment[]) {
    associateMutation.mutate(
      devices.map((d) => d.Id),
      {
        onSuccess() {
          notifySuccess('Success', 'Edge devices associated successfully');
        },
      }
    );
  }
}
