import { createStore } from 'zustand';

import { basicSettings, BasicTableSettings } from '@@/datatables/types';

export function createNestedDatatableStoreHook(initialSortBy?: string) {
  return createStore<BasicTableSettings>()((set) =>
    basicSettings(set, initialSortBy)
  );
}
