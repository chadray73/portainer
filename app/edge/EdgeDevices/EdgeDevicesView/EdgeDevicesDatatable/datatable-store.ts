import { createStore as createZustandStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { keyBuilder } from '@/portainer/hooks/useLocalStorage';
import {
  paginationSettings,
  sortableSettings,
  refreshableSettings,
  hiddenColumnsSettings,
} from '@/react/components/datatables/types';

import { TableSettings } from './types';

export const TRUNCATE_LENGTH = 32;

export function createStore(storageKey: string) {
  return createZustandStore<TableSettings>()(
    persist(
      (set) => ({
        ...sortableSettings(set),
        ...paginationSettings(set),
        ...hiddenColumnsSettings(set),
        ...refreshableSettings(set),
      }),
      {
        name: keyBuilder(storageKey),
      }
    )
  );
}
