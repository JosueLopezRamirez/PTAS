// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { PlotMouseEvent } from 'plotly.js';
import React from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import {
  ChartExpression,
  IdValue,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import { defaultLayout } from './paramReaders/chart-utils';

interface VariableSummary {
  dependent?: string;
  independent?: string;
  groupBy?: string;
}

const BoxPlot = ({
  chartType,
  chartData,
  chartExpressions,
  checkParcel,
}: {
  chartType: string;
  chartData: InteractiveChartResponseItemType;
  chartExpressions: ChartExpression[];
  checkParcel: (parcel: string) => Promise<void>;
}): JSX.Element => {
  const guat = chartExpressions.reduce((prev: VariableSummary, curr) => {
    switch (curr.expressionRole) {
      case 'IndependentVariable':
        return { ...prev, independent: curr.columnName };
      case 'DependentVariable':
        return { ...prev, dependent: curr.columnName };
      case 'GroupByVariable':
        return { ...prev, groupBy: curr.columnName };
      default:
        return prev;
    }
  }, {});

  const abc = chartData.values.reduce((prev, curr) => {
    const groupingValue = curr[guat.groupBy || 'NA'] as string;
    prev[groupingValue] = [...((prev[groupingValue] || []) as IdValue[]), curr];
    return prev;
  }, {});

  const data = Object.keys(abc).map((key) => {
    const values = abc[key] as IdValue[];
    const ys = values.map((itm) => itm[guat.dependent || 'NA']);
    const xs = values.map((itm) => itm[guat.independent || 'NA']);
    const text = values.map((itm) => itm.Major + '-' + itm.Minor);
    return {
      x: xs,
      y: ys,
      text,
      name: `${guat.groupBy} ${key}`,
      type: 'box',
      title: guat.dependent,
      boxpoints: 'all',
    };
  });

  const layout = {
    ...defaultLayout,
    yaxis: {
      title: guat.dependent,
    },
  };

  const pointClick = (data: PlotMouseEvent): void => {
    const [firstPoint] = (data.points as unknown) as {
      text: string;
    }[];
    if (!firstPoint?.text) return;
    checkParcel(firstPoint.text);
  };

  return (
    <div>
      <PlotlyChart
        onClick={pointClick}
        layout={layout}
        data={data}
        config={{ responsive: true }}
      />
    </div>
  );
};
export default BoxPlot;
