import { createStore as createZustandStore } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  paginationSettings,
  sortableSettings,
} from '@/react/components/datatables/types';
import { keyBuilder } from '@/portainer/hooks/useLocalStorage';

import { TableSettings } from './types';

export function createStore(storageKey: string) {
  return createZustandStore<TableSettings>()(
    persist(
      (set) => ({
        ...sortableSettings(set),
        ...paginationSettings(set),
      }),
      {
        name: keyBuilder(storageKey),
      }
    )
  );
}
