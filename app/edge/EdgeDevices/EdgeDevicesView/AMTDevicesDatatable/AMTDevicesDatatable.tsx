import { usePagination, useTable } from 'react-table';

import { Device } from '@/portainer/hostmanagement/open-amt/model';
import { useAMTDevices } from '@/edge/EdgeDevices/EdgeDevicesView/AMTDevicesDatatable/useAMTDevices';
import { RowProvider } from '@/edge/EdgeDevices/EdgeDevicesView/AMTDevicesDatatable/columns/RowContext';
import { EnvironmentId } from '@/portainer/environments/types';
import PortainerError from '@/portainer/error';

import { NestedTable } from '@@/datatables/NestedTable';
import { Table, TableContainer, TableHeaderRow, TableRow } from '@@/datatables';

import { useColumns } from './columns';

export interface AMTDevicesTableProps {
  environmentId: EnvironmentId;
}

export function AMTDevicesDatatable({ environmentId }: AMTDevicesTableProps) {
  const columns = useColumns();

  const { isLoading, devices, error } = useAMTDevices(environmentId);

  const { getTableProps, getTableBodyProps, headerGroups, page, prepareRow } =
    useTable<Device>(
      {
        columns,
        data: devices,
      },
      usePagination
    );

  const tableProps = getTableProps();
  const tbodyProps = getTableBodyProps();

  return (
    <NestedTable>
      <TableContainer>
        <Table
          className={tableProps.className}
          role={tableProps.role}
          style={tableProps.style}
        >
          <thead>
            {headerGroups.map((headerGroup) => {
              const { key, className, role, style } =
                headerGroup.getHeaderGroupProps();
              return (
                <TableHeaderRow<Device>
                  key={key}
                  className={className}
                  role={role}
                  style={style}
                  headers={headerGroup.headers}
                />
              );
            })}
          </thead>
          <tbody
            className={tbodyProps.className}
            role={tbodyProps.role}
            style={tbodyProps.style}
          >
            {!isLoading && devices && devices.length > 0 ? (
              page.map((row) => {
                prepareRow(row);
                const { key, className, role, style } = row.getRowProps();

                return (
                  <RowProvider key={key} environmentId={environmentId}>
                    <TableRow<Device>
                      cells={row.cells}
                      key={key}
                      className={className}
                      role={role}
                      style={style}
                    />
                  </RowProvider>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-muted">
                  {userMessage(isLoading, error)}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </TableContainer>
    </NestedTable>
  );
}

function userMessage(isLoading: boolean, error?: PortainerError) {
  if (isLoading) {
    return 'Loading...';
  }

  if (error) {
    return error.message;
  }

  return 'No devices found';
}
