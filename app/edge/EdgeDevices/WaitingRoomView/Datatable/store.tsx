import { createStore as createZustandStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { keyBuilder } from '@/portainer/hooks/useLocalStorage';

import { basicSettings } from '@@/datatables/types';

import { TableSettings } from './types';

export function createStore(storageKey: string) {
  return createZustandStore<TableSettings>()(
    persist((set) => basicSettings(set, 'Name'), {
      name: keyBuilder(storageKey),
    })
  );
}
