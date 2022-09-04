import { createStore as createZustandStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { keyBuilder } from '@/portainer/hooks/useLocalStorage';

import { basicSettings } from '@@/datatables/types';

import { TableSettings } from './types';

export function createStoreHook(storageKey: string) {
  return createZustandStore<TableSettings>()(
    persist((set) => basicSettings(set, 'name'), {
      name: keyBuilder(storageKey),
    })
  );
}
