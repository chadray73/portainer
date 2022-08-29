import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  usePagination,
  Column,
  TableInstance,
  TableState,
  useExpanded,
  Row,
} from 'react-table';
import { Fragment, ReactNode } from 'react';
import { useRowSelectColumn } from '@lineup-lite/hooks';
import { StoreApi, useStore } from 'zustand';

import { PaginationControls } from '@@/PaginationControls';
import { IconProps } from '@@/Icon';

import { PaginationTableSettings, SortableTableSettings } from './types';
import { Table } from './Table';
import { multiple } from './filter-types';
import { SearchBar, useSearchBarState } from './SearchBar';
import { SelectedRowsCount } from './SelectedRowsCount';
import { TableSettingsProvider } from './useTableSettings';
import { useRowSelect } from './useRowSelect';

interface DefaultTableSettings
  extends SortableTableSettings,
    PaginationTableSettings {}

interface TitleOptionsVisible {
  title: string;
  icon?: IconProps['icon'];
  featherIcon?: IconProps['featherIcon'];
  hide?: never;
}

type TitleOptions = TitleOptionsVisible | { hide: true };

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
  isRowSelectable?(row: D): boolean;
  emptyContentLabel?: string;
  titleOptions: TitleOptions;
  initialTableState?: Partial<TableState<D>>;
  isLoading?: boolean;
  totalCount?: number;
  renderSubRow(row: Row<D>): ReactNode;
  pageCount?: number;
  onSortChange?(colId: string, desc: boolean): void;
  onPageChange?(page: number): void;
  onPageSizeChange?(pageSize: number): void;
  onSearchChange?(search: string): void;
}

export function ExpandableDatatable<
  D extends Record<string, unknown>,
  TSettings extends DefaultTableSettings
>({
  columns,
  dataset,
  storageKey,
  renderTableSettings,
  renderTableActions,
  renderSubRow,
  settingsStore,
  disableSelect,
  getRowId = defaultGetRowId,
  isRowSelectable = () => true,
  titleOptions,
  emptyContentLabel,
  initialTableState = {},
  isLoading,
  totalCount = dataset.length,
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

  const {
    selectedFlatRows,
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    gotoPage,
    setPageSize,
    setGlobalFilter,
    state,
  } = tableInstance;

  const tableProps = getTableProps();
  const tbodyProps = getTableBodyProps();

  const selectedItems = selectedFlatRows.map((row) => row.original);

  return (
    <div className="row">
      <div className="col-sm-12">
        <TableSettingsProvider settings={settingsStore}>
          <Table.Container>
            {isTitleVisible(titleOptions) && (
              <Table.Title label={titleOptions.title} icon={titleOptions.icon}>
                <SearchBar
                  value={searchBarValue}
                  onChange={handleSearchBarChange}
                />
                {renderTableActions && (
                  <Table.Actions>
                    {renderTableActions(selectedItems)}
                  </Table.Actions>
                )}
                <Table.TitleActions>
                  {!!renderTableSettings && renderTableSettings(tableInstance)}
                </Table.TitleActions>
              </Table.Title>
            )}
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
                      onSortChange={handleSortChange}
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
                  rows={page}
                  isLoading={isLoading}
                  prepareRow={prepareRow}
                  emptyContent={emptyContentLabel}
                  renderRow={(row, { key, className, role, style }) => (
                    <Fragment key={key}>
                      <Table.Row<D>
                        key={key}
                        cells={row.cells}
                        className={className}
                        role={role}
                        style={style}
                      />
                      {row.isExpanded && (
                        <tr>
                          {!disableSelect && <td />}
                          <td
                            colSpan={
                              disableSelect
                                ? row.cells.length
                                : row.cells.length - 1
                            }
                          >
                            {renderSubRow(row)}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )}
                />
              </tbody>
            </Table>
            <Table.Footer>
              <SelectedRowsCount value={selectedFlatRows.length} />
              <PaginationControls
                showAll
                pageLimit={state.pageSize}
                page={state.pageIndex + 1}
                onPageChange={handlePageChange}
                totalCount={totalCount}
                onPageLimitChange={handlePageSizeChange}
              />
            </Table.Footer>
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
    gotoPage(page - 1);
    onPageChange(page);
  }

  function handlePageSizeChange(pageSize: number) {
    setPageSize(pageSize);
    settings.setPageSize(pageSize);
    onPageSizeChange(pageSize);
  }
}

function isTitleVisible(
  titleSettings: TitleOptions
): titleSettings is TitleOptionsVisible {
  return !titleSettings.hide;
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
