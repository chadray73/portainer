import { createStore } from 'zustand';

import {
  paginationSettings,
  PaginationTableSettings,
  sortableSettings,
  SortableTableSettings,
} from '@@/datatables/types';

interface TableSettings
  extends SortableTableSettings,
    PaginationTableSettings {}

export function createNestedDatatableStoreHook(initialSortBy?: string) {
  return createStore<TableSettings>()((set) => ({
    ...sortableSettings(set, initialSortBy),
    ...paginationSettings(set),
  }));
}
