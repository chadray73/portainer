import {
  PaginationTableSettings,
  RefreshableTableSettings,
  SettableColumnsTableSettings,
  SortableTableSettings,
} from '@@/datatables/types';

export interface Pagination {
  pageLimit: number;
  page: number;
}

export interface TableSettings
  extends SortableTableSettings,
    PaginationTableSettings,
    SettableColumnsTableSettings,
    RefreshableTableSettings {}
