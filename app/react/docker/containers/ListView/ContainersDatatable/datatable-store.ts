import { createStore as createZustandStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { keyBuilder } from '@/portainer/hooks/useLocalStorage';

import {
  basicSettings,
  refreshableSettings,
  hiddenColumnsSettings,
} from '@@/datatables/types';

import { QuickAction, TableSettings } from './types';

export const TRUNCATE_LENGTH = 32;

export function createStore(storageKey: string) {
  return createZustandStore<TableSettings>()(
    persist(
      (set) => ({
        ...basicSettings(set, 'Name'),
        ...hiddenColumnsSettings(set),
        ...refreshableSettings(set),
        truncateContainerName: TRUNCATE_LENGTH,
        setTruncateContainerName(truncateContainerName: number) {
          set({
            truncateContainerName,
          });
        },

        hiddenQuickActions: [] as QuickAction[],
        setHiddenQuickActions: (hiddenQuickActions: QuickAction[]) =>
          set({ hiddenQuickActions }),
      }),
      {
        name: keyBuilder(storageKey),
      }
    )
  );
}
