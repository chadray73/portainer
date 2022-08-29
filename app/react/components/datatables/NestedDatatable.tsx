import {
  useTable,
  useFilters,
  useSortBy,
  Column,
  TableState,
} from 'react-table';
import { StoreApi, useStore } from 'zustand';

import { PaginationTableSettings, SortableTableSettings } from './types';
import { Table } from './Table';
import { multiple } from './filter-types';
import { TableSettingsProvider } from './useTableSettings';
import { NestedTable } from './NestedTable';

interface DefaultTableSettings
  extends SortableTableSettings,
    PaginationTableSettings {}

interface Props<
  D extends Record<string, unknown>,
  TSettings extends StoreApi<DefaultTableSettings>
> {
  dataset: D[];
  columns: readonly Column<D>[];

  settingsStore: TSettings;
  getRowId?(row: D): string;
  emptyContentLabel?: string;
  initialTableState?: Partial<TableState<D>>;
  isLoading?: boolean;
}

export function NestedDatatable<
  D extends Record<string, unknown>,
  TSettings extends StoreApi<DefaultTableSettings>
>({
  columns,
  dataset,
  settingsStore,
  getRowId = defaultGetRowId,
  emptyContentLabel,
  initialTableState = {},
  isLoading,
}: Props<D, TSettings>) {
  const settings = useStore(settingsStore);

  const tableInstance = useTable<D>(
    {
      defaultCanFilter: false,
      columns,
      data: dataset,
      filterTypes: { multiple },
      initialState: {
        sortBy: [settings.sortBy],
        ...initialTableState,
      },
      autoResetSelectedRows: false,
      getRowId,
      // todo, move to callbacks
      stateReducer: (newState, action) => {
        switch (action.type) {
          case 'toggleSortBy':
            settings.setSortBy(action.columnId, action.desc);
            break;

          default:
            break;
        }
        return newState;
      },
    },
    useFilters,
    useSortBy
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const tableProps = getTableProps();
  const tbodyProps = getTableBodyProps();

  return (
    <NestedTable>
      <TableSettingsProvider settings={settingsStore}>
        <Table.Container>
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
                  <Table.HeaderRow<D>
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
              <Table.Content<D>
                rows={rows}
                isLoading={isLoading}
                prepareRow={prepareRow}
                emptyContent={emptyContentLabel}
                renderRow={(row, { key, className, role, style }) => (
                  <Table.Row<D>
                    cells={row.cells}
                    key={key}
                    className={className}
                    role={role}
                    style={style}
                  />
                )}
              />
            </tbody>
          </Table>
        </Table.Container>
      </TableSettingsProvider>
    </NestedTable>
  );
}

function defaultGetRowId<D extends Record<string, unknown>>(row: D): string {
  if (row.id && (typeof row.id === 'string' || typeof row.id === 'number')) {
    return row.id.toString();
  }

  if (row.Id && (typeof row.Id === 'string' || typeof row.Id === 'number')) {
    return row.Id.toString();
  }

  if (row.ID && (typeof row.ID === 'string' || typeof row.ID === 'number')) {
    return row.ID.toString();
  }

  return '';
}

function emptyPlugin() {}

emptyPlugin.pluginName = 'emptyPlugin';
