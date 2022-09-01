import { ReactNode } from 'react';

import { IconProps } from '@@/Icon';

import { SearchBar } from './SearchBar';
import { Table } from './Table';

interface TitleOptionsVisible {
  title: string;
  icon?: IconProps['icon'];
  featherIcon?: IconProps['featherIcon'];

  hide?: never;
}

export type TitleOptions = TitleOptionsVisible | { hide: true };

type Props = {
  titleOptions: TitleOptions;
  searchValue: string;
  onSearchChange(value: string): void;
  renderTableSettings?(): ReactNode;
  renderTableActions?(): ReactNode;
};

export function DatatableHeader({
  onSearchChange,
  renderTableActions,
  renderTableSettings,
  searchValue,
  titleOptions,
}: Props) {
  if (!isTitleVisible(titleOptions)) {
    return null;
  }

  const { title, icon, featherIcon } = titleOptions;

  return (
    <Table.Title label={title} icon={icon} featherIcon={featherIcon}>
      <SearchBar value={searchValue} onChange={onSearchChange} />
      {renderTableActions && (
        <Table.Actions>{renderTableActions()}</Table.Actions>
      )}
      <Table.TitleActions>
        {!!renderTableSettings && renderTableSettings()}
      </Table.TitleActions>
    </Table.Title>
  );
}

function isTitleVisible(
  titleSettings: TitleOptions
): titleSettings is TitleOptionsVisible {
  return !titleSettings.hide;
}
