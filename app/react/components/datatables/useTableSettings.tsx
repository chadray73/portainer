import { Context, createContext, ReactNode, useContext } from 'react';

const TableSettingsContext = createContext<Record<string, unknown> | null>(
  null
);

export function useTableSettings<T>() {
  const Context = getContextType<T>();

  const context = useContext(Context);

  if (context === null) {
    throw new Error('must be nested under TableSettingsProvider');
  }

  return context;
}

interface ProviderProps<T> {
  children: ReactNode;
  settings: T;
}

export function TableSettingsProvider<T>({
  children,
  settings,
}: ProviderProps<T>) {
  const Context = getContextType<T>();

  return <Context.Provider value={settings}>{children}</Context.Provider>;
}

function getContextType<T>() {
  return TableSettingsContext as unknown as Context<T>;
}
