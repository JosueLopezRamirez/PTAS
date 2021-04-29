// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import MessageDisplay from 'components/MessageDisplay';
import React from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import {
  ChartExpression,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import { defaultLayout } from './paramReaders/chart-utils';

const CircularChart = ({
  chartType,
  chartData,
  chartExpressions,
}: {
  chartType: string;
  chartData: InteractiveChartResponseItemType;
  chartExpressions: ChartExpression[];
}): JSX.Element => {
  if (!chartData.values) return <MessageDisplay message="No Info" />;

  const ind = chartData.independentVariable;

  const [firstItem] = chartData.values;
  const fields = Object.keys(firstItem).filter((k) => k !== ind);
  console.log({ fields, ind });
  const positions = [[0.5], [0, 1], [0.12, 0.5, 0.88]];
  const isDonut = chartType === 'Donut';
  const pies = fields.map((f, i) => {
    return {
      plotValues: {
        labels: chartData.values.map((v) => `${ind} ${v[ind]}`),
        values: chartData.values.map((v) => v[f]),
        type: 'pie',
        hole: isDonut ? 0.4 : 0,
        name: f,
        domain: {
          row: 0,
          column: i,
        },
      },
      title: f,
    };
  });

  const layout = {
    ...defaultLayout,
    grid: { rows: 1, columns: pies.length },
    title: chartExpressions.find(
      (ce) => ce.columnName === chartData.independentVariable
    )?.script,
    yaxis: {
      automargin: true,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
    },
    xaxis: {
      automargin: false,
      title: ind,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
    },

    autosize: true,
    legend: { orientation: 'v', x: 0, y: -0.1 },
    showlegend: true,
    annotations: pies.map((a, idx) => {
      return {
        text: chartExpressions.find((ce) => ce.columnName === a.title)?.script,
        font: {
          size: 16,
          weight: 'bold',
          color: isDonut ? 'black' : 'white',
        },
        showarrow: false,
        x: positions[pies.length - 1][idx],
        y: 0.5,
      };
    }),
  };

  return (
    <div className="chart-frame">
      {/* <ShowInfo toDisplay={{ chartExpressions }} /> */}
      <PlotlyChart
        data={pies.map((itm) => itm.plotValues)}
        layout={layout}
        config={{ responsive: true }}
      />
    </div>
  );
};
export default CircularChart;
