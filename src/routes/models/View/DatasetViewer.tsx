// DatasetViewer.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { CustomTabs } from '@ptas/react-ui-library';
import { IdDescription, RegressionVar } from 'services/map.typings';
import AgGrid from 'components/Grid';

const useStyles = makeStyles((theme) => ({
  customTabsSelected: {
    color: theme.ptas.colors.theme.black,
  },
}));

const DatasetViewer = ({
  datasets,
  priorVars,
  postVars,
}: {
  datasets: IdDescription[];
  priorVars: RegressionVar[];
  postVars: RegressionVar[];
}): JSX.Element => {
  datasets = [...datasets.sort((a, b) => (a.description === 'Sales' ? -1 : 0))];

  const [, setCountTotalRecords] = useState<number>(0);
  const [, setCountTotalSelection] = useState<number>(0);
  const onAddTotalRecords = (x: number): void => {
    setCountTotalRecords(x)
  }
  const onAddTotalSelection = (x: number): void => {
    setCountTotalSelection(x)
  }

  const [switchState, setSwitchState] = useState(0);
  const classes = useStyles();
  const postList = postVars.map((pv) => pv.name);
  const priorList = priorVars.map((pv) => pv.name);
  const priorPostList = {
    postList: postList,
    priorList: priorList,
  };
  return (
    <div className="data-sets">
      <CustomTabs
        items={datasets.map((ds) => ds.description)}
        defaultSelection={switchState}
        onSelected={(e): void => {
          setSwitchState(e);
        }}
        classes={{ selectedItem: classes.customTabsSelected }}
        switchVariant
      />
      {datasets.map((ds, index) => (
        <div
          key={index}
          style={{
            height: '40em',
            display: index === switchState ? 'block' : 'none',
          }}
        >
          <AgGrid
            id={ds.id}
            priorPostList={priorPostList}
            getTotalRecords={onAddTotalRecords}
            getTotalSelection={onAddTotalSelection}
          />
        </div>
      ))}
    </div>
  );
};
export default DatasetViewer;
