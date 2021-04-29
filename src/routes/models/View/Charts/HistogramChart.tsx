// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import ZoomContents from 'components/ZoomContents';
import React from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import { SizeMe } from 'react-sizeme';
import {
  ChartExpression,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import { defaultLayout, HistogramBinValue } from './paramReaders/chart-utils';

const HistogramChart = ({
  chartData,
  chartExpressions,
}: {
  chartData: InteractiveChartResponseItemType;
  chartExpressions: ChartExpression[];
}): JSX.Element => {
  const t1 = chartData.values.reduce((prev, curr) => {
    const { binCategory, ...rest } = curr;
    prev[curr.binCategory as string] = [
      ...((prev[curr.binCategory as string] as unknown[]) || []),
      rest,
    ];
    return prev;
  }, {});
  const charts = Object.entries(t1)
    .map(function ([field, values]: [string, unknown]) {
      return {
        field,
        values: values as HistogramBinValue[],
      };
    })
    .map((t) => ({
      x: t.values.map(
        (v, i) => `${v.binRangeStart.toFixed(2)} to ${v.binRangeEnd.toFixed(2)}`
      ),
      y: t.values.map((v) => v.binObservations),
      title: t.field,
      type: 'bar',
      name: t.field,
    }));

  const groupExpression = chartExpressions.find(
    (ce) => ce.expressionRole === 'GroupByVariable'
  )?.script;

  const colCount = Math.min(3, charts.length);

  return (
    <div className={`bar-frame bf-${colCount}`}>
      {charts.map((chart, i) => {
        const layout = {
          ...defaultLayout,
          yaxis: {
            automargin: true,
            autorange: true,
            showgrid: true,
            zeroline: true,
            showline: true,
          },
          xaxis: {
            automargin: true,
            title: `${groupExpression}: ${chart.title}`,
            autorange: true,
            showgrid: true,
            zeroline: true,
            showline: true,
          },
        };
        return (
          <ZoomContents key={i}>
            <SizeMe>
              {(): JSX.Element => (
                <PlotlyChart key={i} data={[chart]} layout={layout} />
              )}
            </SizeMe>
          </ZoomContents>
        );
      })}
    </div>
  );
};

export default HistogramChart;
