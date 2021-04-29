/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

interface GridOptionsMenuChildrenType {
  label: string;
  divider?: boolean;
}

interface GridOptionsMenuType {
  label: string;
  childrens?: Array<GridOptionsMenuChildrenType>;
  divider?: boolean;
}

export const gridOptionsMenu: GridOptionsMenuType[] = [
  {
    label: 'Group',
    childrens: [
      {
        label: 'Show/Hide data columns',
      },
      {
        label: 'Show/Hide variables columns',
      },
    ],
  },
  {
    label: 'Grid',
    childrens: [
      {
        label: 'Load grid configuration',
      },
      {
        label: 'Save grid configuration',
      },
      {
        label: 'Reset to default',
      },
    ],
    divider: true,
  },
  {
    label: 'Columns',
    childrens: [
      {
        label: 'Autofit',
      },
      {
        label: 'Show all',
      },
    ],
  },
  {
    label: 'Rows',
    childrens: [
      {
        label: 'Hide selected',
      },
      {
        label: 'Show all',
        divider: true,
      },
      {
        label: 'Select all',
      },
      {
        label: 'Unselect all',
        divider: true,
      },
    ],
  },
  {
    label: 'Selected/Filtered rows',
    childrens: [
      {
        label: 'Remove filtered rows...',
      },
      {
        label: 'Create a new dataset...',
      },
      {
        label: 'Create dataset from filtered rows...',
      },
    ],
    divider: true,
  },
  {
    label: 'Data',
    childrens: [
      {
        label: 'Refresh data...',
      },
      {
        label: 'Commit changes...',
        divider: true,
      },
      {
        label: 'Export to Excel...',
      },
      {
        label: 'Import...',
      },
    ],
    divider: true,
  },
];
