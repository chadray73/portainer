import create from 'zustand';

import {
  paginationSettings,
  PaginationTableSettings,
  sortableSettings,
  SortableTableSettings,
} from '@@/datatables/types';

interface TableSettings
  extends SortableTableSettings,
    PaginationTableSettings {}

/**
 * use for default nested table store
 */
export function createNestedDatatableStoreHook(initialSortBy?: string) {
  return create<TableSettings>()((set) => ({
    ...sortableSettings(set, initialSortBy),
    ...paginationSettings(set),
  }));
}
