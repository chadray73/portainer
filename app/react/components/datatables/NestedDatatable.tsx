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
import { DatatableContent } from './DatatableContent';
import { defaultGetRowId } from './defaultGetRowId';

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
    },
    useFilters,
    useSortBy
  );

  return (
    <NestedTable>
      <TableSettingsProvider settings={settingsStore}>
        <Table.Container>
          <DatatableContent<D>
            tableInstance={tableInstance}
            isLoading={isLoading}
            emptyContentLabel={emptyContentLabel}
            renderRow={(row, { key, className, role, style }) => (
              <Table.Row<D>
                cells={row.cells}
                key={key}
                className={className}
                role={role}
                style={style}
              />
            )}
            onSortChange={handleSortChange}
          />
        </Table.Container>
      </TableSettingsProvider>
    </NestedTable>
  );

  function handleSortChange(colId: string, desc: boolean) {
    settings.setSortBy(colId, desc);
  }
}
