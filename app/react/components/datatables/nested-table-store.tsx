import { createStore } from 'zustand';

import {
  BasicTableSettings,
  paginationSettings,
  sortableSettings,
} from '@@/datatables/types';

export function createNestedDatatableStoreHook(initialSortBy?: string) {
  return createStore<BasicTableSettings>()((set) => ({
    ...sortableSettings(set, initialSortBy),
    ...paginationSettings(set),
  }));
}
