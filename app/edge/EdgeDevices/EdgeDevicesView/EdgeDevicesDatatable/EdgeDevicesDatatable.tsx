import _ from 'lodash';
import { Box } from 'react-feather';

import { EdgeTypes, Environment } from '@/portainer/environments/types';
import { EnvironmentGroup } from '@/portainer/environment-groups/types';
import { useEnvironmentList } from '@/portainer/environments/queries/useEnvironmentList';

import { ExpandableDatatable } from '@@/datatables/ExpandableDatatable';
import { TableSettingsMenu } from '@@/datatables';
import { ColumnVisibilityMenu } from '@@/datatables/ColumnVisibilityMenu';
import { InformationPanel } from '@@/InformationPanel';
import { TextTip } from '@@/Tip/TextTip';

import { AMTDevicesDatatable } from '../AMTDevicesDatatable/AMTDevicesDatatable';

import { columns } from './columns';
import { EdgeDevicesDatatableActions } from './EdgeDevicesDatatableActions';
import { EdgeDevicesDatatableSettings } from './EdgeDevicesDatatableSettings';
import { RowProvider } from './columns/RowContext';
import styles from './EdgeDevicesDatatable.module.css';
import { createStore } from './datatable-store';

export interface EdgeDevicesTableProps {
  storageKey: string;
  isFdoEnabled: boolean;
  isOpenAmtEnabled: boolean;
  showWaitingRoomLink: boolean;
  mpsServer: string;
  groups: EnvironmentGroup[];
}
const storageKey = 'edgeDevices';

const useStore = createStore(storageKey);

export function EdgeDevicesDatatable({
  isFdoEnabled,
  isOpenAmtEnabled,
  showWaitingRoomLink,
  mpsServer,
  groups,
}: EdgeDevicesTableProps) {
  // const [pagination, setPagination] = useState({
  //   pageLimit: settings.pageSize,
  //   page: 1,
  // });

  // const [search, setSearch] = useSearchBarState(storageKey);
  // const debouncedSearchValue = useDebounce(search);

  const settings = useStore();
  const hidableColumns = _.compact(
    columns.filter((col) => col.canHide).map((col) => col.id)
  );
  const { environments, isLoading, totalCount } = useEnvironmentList(
    {
      edgeDevice: true,
      search: '',
      types: EdgeTypes,
      // ...pagination,
    },
    settings.autoRefreshRate * 1000
  );

  const someDeviceHasAMTActivated = environments.some(
    (environment) =>
      environment.AMTDeviceGUID && environment.AMTDeviceGUID !== ''
  );

  return (
    <>
      {isOpenAmtEnabled && someDeviceHasAMTActivated && (
        <InformationPanel>
          <div className={styles.kvmTip}>
            <TextTip color="blue">
              For the KVM function to work you need to have the MPS server added
              to your trusted site list, browse to this
              <a
                href={`https://${mpsServer}`}
                target="_blank"
                rel="noreferrer"
                className="mx-px"
              >
                site
              </a>
              and add to your trusted site list
            </TextTip>
          </div>
        </InformationPanel>
      )}
      <RowProvider context={{ isOpenAmtEnabled, groups }}>
        <ExpandableDatatable
          dataset={environments}
          columns={columns}
          isLoading={isLoading}
          totalCount={totalCount}
          titleOptions={{
            title: 'Edge Devices',
            icon: Box,
          }}
          settingsStore={settings}
          storageKey={storageKey}
          renderSubRow={(row) => (
            <tr>
              <td />
              <td colSpan={row.cells.length - 1}>
                <AMTDevicesDatatable environmentId={row.original.Id} />
              </td>
            </tr>
          )}
          renderTableActions={(selectedRows) => (
            <EdgeDevicesDatatableActions
              selectedItems={selectedRows}
              isFDOEnabled={isFdoEnabled}
              isOpenAMTEnabled={isOpenAmtEnabled}
              showWaitingRoomLink={showWaitingRoomLink}
            />
          )}
          renderTableSettings={(tableInstance) => {
            const columnsToHide = tableInstance.allColumns.filter(
              (colInstance) => hidableColumns?.includes(colInstance.id)
            );
            return (
              <>
                <ColumnVisibilityMenu<Environment>
                  columns={columnsToHide}
                  onChange={(hiddenColumns) => {
                    settings.setHiddenColumns(hiddenColumns);
                    tableInstance.setHiddenColumns(hiddenColumns);
                  }}
                  value={settings.hiddenColumns}
                />
                <TableSettingsMenu>
                  <EdgeDevicesDatatableSettings />
                </TableSettingsMenu>
              </>
            );
          }}
        />
      </RowProvider>
    </>
  );

  // const { settings, setTableSettings } =
  //   useOldTableSettings<EdgeDeviceTableSettings>();

  // const {
  //   getTableProps,
  //   getTableBodyProps,
  //   headerGroups,
  //   rows,
  //   prepareRow,
  //   selectedFlatRows,
  //   allColumns,
  //   setHiddenColumns,
  // } = useTable<Environment>(
  //   {
  //     defaultCanFilter: false,
  //     columns,
  //     data: dataset,
  //     filterTypes: { multiple },
  //     initialState: {
  //       hiddenColumns: settings.hiddenColumns,
  //       sortBy: [settings.sortBy],
  //     },
  //     isRowSelectable() {
  //       return true;
  //     },
  //     autoResetExpanded: false,
  //     autoResetSelectedRows: false,
  //     getRowId(originalRow: Environment) {
  //       return originalRow.Id.toString();
  //     },
  //     selectColumnWidth: 5,
  //   },
  //   useFilters,
  //   useSortBy,
  //   useExpanded,
  //   useRowSelect,
  //   useRowSelectColumn
  // );

  // const columnsToHide = allColumns.filter((colInstance) => {
  //   const columnDef = columns.find((c) => c.id === colInstance.id);
  //   return columnDef?.canHide;
  // });

  // const tableProps = getTableProps();
  // const tbodyProps = getTableBodyProps();

  // const groupsById = _.groupBy(groups, 'Id');

  // return (
  //   <div className="row">
  //     <div className="col-sm-12">
  //       <TableContainer>
  //         <TableTitle icon="box" featherIcon label="Edge&nbsp;Devices">
  //           <SearchBar value={search} onChange={handleSearchBarChange} />
  //           <TableActions>

  //           </TableActions>
  //           <TableTitleActions>

  //           </TableTitleActions>
  //         </TableTitle>
  //         {isOpenAmtEnabled && someDeviceHasAMTActivated && (
  //           <div className={styles.kvmTip}>
  //             <TextTip color="blue">
  //               For the KVM function to work you need to have the MPS server
  //               added to your trusted site list, browse to this{' '}
  //               <a
  //                 href={`https://${mpsServer}`}
  //                 target="_blank"
  //                 rel="noreferrer"
  //                 className="space-right"
  //               >
  //                 site
  //               </a>
  //               and add to your trusted site list
  //             </TextTip>
  //           </div>
  //         )}

  // function gotoPage(pageIndex: number) {
  //   onChangePagination({ page: pageIndex });
  // }

  // function setPageSize(pageSize: number) {
  //   onChangePagination({ pageLimit: pageSize });
  // }

  // function handlePageSizeChange(pageSize: number) {
  //   setPageSize(pageSize);
  //   setTableSettings((settings) => ({ ...settings, pageSize }));
  // }

  // function handleChangeColumnsVisibility(hiddenColumns: string[]) {
  //   setHiddenColumns(hiddenColumns);
  //   setTableSettings((settings) => ({ ...settings, hiddenColumns }));
  // }

  // function handleSearchBarChange(value: string) {
  //   onChangeSearch(value);
  // }

  // function handleSortChange(id: string, desc: boolean) {
  //   setTableSettings((settings) => ({
  //     ...settings,
  //     sortBy: { id, desc },
  //   }));
  // }
}
