import { createStore } from 'zustand';
import { persist } from 'zustand/middleware';

import { keyBuilder } from '@/portainer/hooks/useLocalStorage';

export interface PaginationTableSettings {
  pageSize: number;
  setPageSize: (pageSize: number) => void;
}

type Set<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined
) => void;

export function paginationSettings(
  set: Set<PaginationTableSettings>
): PaginationTableSettings {
  return {
    pageSize: 10,
    setPageSize: (pageSize: number) => set({ pageSize }),
  };
}

export interface SortableTableSettings {
  sortBy: { id: string; desc: boolean };
  setSortBy: (id: string, desc: boolean) => void;
}

export function sortableSettings(
  set: Set<SortableTableSettings>,
  initialSortBy = 'name'
): SortableTableSettings {
  return {
    sortBy: { id: initialSortBy, desc: false },
    setSortBy: (id: string, desc: boolean) => set({ sortBy: { id, desc } }),
  };
}

export interface SettableColumnsTableSettings {
  hiddenColumns: string[];
  setHiddenColumns: (hiddenColumns: string[]) => void;
}

export function hiddenColumnsSettings(
  set: Set<SettableColumnsTableSettings>
): SettableColumnsTableSettings {
  return {
    hiddenColumns: [],
    setHiddenColumns: (hiddenColumns: string[]) => set({ hiddenColumns }),
  };
}

export interface RefreshableTableSettings {
  autoRefreshRate: number;
  setAutoRefreshRate: (autoRefreshRate: number) => void;
}

export function refreshableSettings(
  set: Set<RefreshableTableSettings>
): RefreshableTableSettings {
  return {
    autoRefreshRate: 0,
    setAutoRefreshRate: (autoRefreshRate: number) => set({ autoRefreshRate }),
  };
}

export interface BasicTableSettings
  extends SortableTableSettings,
    PaginationTableSettings {}

export function basicSettings(
  set: Set<BasicTableSettings>,
  initialSortBy?: string
): BasicTableSettings {
  return {
    ...sortableSettings(set, initialSortBy),
    ...paginationSettings(set),
  };
}

export function createPersistedStore<T extends BasicTableSettings>(
  storageKey: string,
  initialSortBy?: string,
  create: (set: Set<T>) => Omit<T, keyof BasicTableSettings> = () => ({} as T)
) {
  return createStore<T>()(
    persist(
      (set) =>
        ({
          ...basicSettings(set as Set<BasicTableSettings>, initialSortBy),
          ...create(set),
        } as T),
      {
        name: keyBuilder(storageKey),
      }
    )
  );
}
