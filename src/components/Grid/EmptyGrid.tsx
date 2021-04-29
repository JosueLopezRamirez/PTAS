/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import { makeStyles } from '@material-ui/core';
import { GridReadyEvent } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import React from 'react';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import clsx from 'clsx';

// interface EmptyGridProps {
//   loading: boolean;
// }

const useStyles = makeStyles({
  emptyGrid: {
    height: '450px',
  },
});

export const EmptyGrid = (): JSX.Element => {
  const classes = useStyles();

  const onGridReady = (event: GridReadyEvent): void => {
    event.api.showLoadingOverlay();
  };

  return (
    <div className={clsx('ag-theme-alpine', classes.emptyGrid)}>
      <AgGridReact onGridReady={onGridReady} />
    </div>
  );
};
