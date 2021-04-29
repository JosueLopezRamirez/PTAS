/* eslint-disable @typescript-eslint/no-unused-vars */
// ViewDataset.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AgGrid from 'components/Grid';
const ViewDataset = (): JSX.Element => {
  const { id }: { id: string } = useParams();

  const [, setCountTotalRecords] = useState<number>(0);
  const [, setCountTotalSelection] = useState<number>(0);

  const onAddTotalRecords = (x: number): void => {
    setCountTotalRecords(x);
  };
  const onAddTotalSelection = (x: number): void => {
    setCountTotalSelection(x);
  };
  
  return (
    <div>
      Graph here with ID: {id}..
      <AgGrid
        id={id}
        getTotalRecords={onAddTotalRecords}
        getTotalSelection={onAddTotalSelection}
      ></AgGrid>
    </div>
  );
};

export default ViewDataset;
