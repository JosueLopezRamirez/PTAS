/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { GridOptions } from 'ag-grid-community';
import { AppContext } from 'context/AppContext';
import React, { useContext, useEffect, useState } from 'react';
import { useInterval } from 'react-use';

export default function StatusBarComponent(props: GridOptions): JSX.Element {
  const { countTotalRecords } = useContext(AppContext);
  const [totalDisplayedRows, setTotalDisplayedRows] = useState<number | undefined>(0);
  const [interval, setInterval] = useState<number | null>(3000);

  useEffect(() => {
    return (): void => {
      setInterval(null);
    };
  }, []);

  useInterval(() => {
    setTotalDisplayedRows(parseInt(`${props.api?.getDisplayedRowCount()}`) - 1);
  }, interval);

  return (
    <div>
      <span className="status-field">Rows: <span className="status-value">{totalDisplayedRows}</span></span>
      <span className="status-field">Total rows: <span className="status-value">{countTotalRecords}</span></span>
    </div>
  );
}
