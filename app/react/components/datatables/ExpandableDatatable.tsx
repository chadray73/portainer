import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination,
  Column,
  Row,
  TableInstance,
  TableState,
  useExpanded,
} from 'react-table';
import { ReactNode } from 'react';
import { useRowSelectColumn } from '@lineup-lite/hooks';
import { StoreApi, useStore } from 'zustand';

import { Table } from './Table';
import { multiple } from './filter-types';
import { useSearchBarState } from './SearchBar';
import { TableSettingsProvider } from './useTableSettings';
import { useRowSelect } from './useRowSelect';
import { PaginationTableSettings, SortableTableSettings } from './types';
import { DatatableHeader, TitleOptions } from './DatatableHeader';
import { DatatableFooter } from './DatatableFooter';
import { DatatableContent } from './DatatableContent';
import { defaultGetRowId } from './defaultGetRowId';
import { emptyPlugin } from './emptyReactTablePlugin';
import { ExpandableDatatableTableRow } from './ExpandableDatatableRow';

interface DefaultTableSettings
  extends SortableTableSettings,
    PaginationTableSettings {}

interface Props<
  D extends Record<string, unknown>,
  TSettings extends DefaultTableSettings
> {
  dataset: D[];
  storageKey: string;
  columns: readonly Column<D>[];
  renderTableSettings?(instance: TableInstance<D>): ReactNode;
  renderTableActions?(selectedRows: D[]): ReactNode;
  settingsStore: StoreApi<TSettings>;
  disableSelect?: boolean;
  getRowId?(row: D): string;
  isRowSelectable?(row: Row<D>): boolean;
  emptyContentLabel?: string;
  titleOptions: TitleOptions;
  initialTableState?: Partial<TableState<D>>;
  isLoading?: boolean;
  totalCount?: number;
  pageCount?: number;
  onSortChange?(colId: string, desc: boolean): void;
  onPageChange?(page: number): void;
  onPageSizeChange?(pageSize: number): void;
  onSearchChange?(search: string): void;
  renderSubRow(row: Row<D>): ReactNode;
}

export function ExpandableDatatable<
  D extends Record<string, unknown>,
  TSettings extends DefaultTableSettings
>({
  columns,
  dataset,
  storageKey,
  renderTableSettings = () => null,
  renderTableActions = () => null,
  settingsStore,
  disableSelect,
  getRowId = defaultGetRowId,
  isRowSelectable = () => true,
  titleOptions,
  emptyContentLabel,
  initialTableState = {},
  isLoading,
  totalCount = dataset.length,
  renderSubRow,
  pageCount,

  onSortChange = () => {},
  onPageChange = () => {},
  onPageSizeChange = () => {},
  onSearchChange = () => {},
}: Props<D, TSettings>) {
  const [searchBarValue, setSearchBarValue] = useSearchBarState(storageKey);

  const settings = useStore(settingsStore);

  const tableInstance = useTable<D>(
    {
      defaultCanFilter: false,
      columns,
      data: dataset,
      filterTypes: { multiple },
      initialState: {
        pageSize: settings.pageSize || 10,
        sortBy: [settings.sortBy],
        globalFilter: searchBarValue,
        ...initialTableState,
      },
      isRowSelectable,
      manualPagination: typeof pageCount !== 'undefined',
      pageCount,
      autoResetExpanded: false,
      autoResetSelectedRows: false,
      getRowId,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useExpanded,
    usePagination,
    useRowSelect,
    !disableSelect ? useRowSelectColumn : emptyPlugin
  );

  const { selectedFlatRows, gotoPage, setPageSize, setGlobalFilter, state } =
    tableInstance;

  const selectedItems = selectedFlatRows.map((row) => row.original);

  return (
    <div className="row">
      <div className="col-sm-12">
        <TableSettingsProvider settings={settingsStore}>
          <Table.Container>
            <DatatableHeader
              onSearchChange={handleSearchBarChange}
              searchValue={searchBarValue}
              titleOptions={titleOptions}
              renderTableActions={() => renderTableActions(selectedItems)}
              renderTableSettings={() => renderTableSettings(tableInstance)}
            />
            <DatatableContent<D>
              tableInstance={tableInstance}
              renderRow={(row, { key, className, role, style }) => (
                <ExpandableDatatableTableRow<D>
                  key={key}
                  row={row}
                  className={className}
                  role={role}
                  style={style}
                  renderSubRow={renderSubRow}
                />
              )}
              emptyContentLabel={emptyContentLabel}
              isLoading={isLoading}
              onSortChange={handleSortChange}
            />

            <DatatableFooter
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              page={state.pageIndex}
              pageSize={state.pageSize}
              totalCount={totalCount}
              totalSelected={selectedItems.length}
            />
          </Table.Container>
        </TableSettingsProvider>
      </div>
    </div>
  );

  function handleSearchBarChange(value: string) {
    setSearchBarValue(value);
    setGlobalFilter(value);
    onSearchChange(value);
  }

  function handleSortChange(colId: string, desc: boolean) {
    settings.setSortBy(colId, desc);
    onSortChange(colId, desc);
  }

  function handlePageChange(page: number) {
    gotoPage(page);
    onPageChange(page);
  }

  function handlePageSizeChange(pageSize: number) {
    setPageSize(pageSize);
    settings.setPageSize(pageSize);
    onPageSizeChange(pageSize);
  }
}
