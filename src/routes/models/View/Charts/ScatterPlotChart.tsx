// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import Loading from 'components/Loading';
import MessageDisplay from 'components/MessageDisplay';
import { PlotMouseEvent } from 'plotly.js';
import React from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import {
  ChartExpression,
  IdValue,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import { defaultLayout, GroupData } from './paramReaders/chart-utils';

const ScatterPlotChart = ({
  chartData,
  plotData,
  chartExpressions,
  checkParcel,
}: {
  chartData: InteractiveChartResponseItemType;
  plotData: InteractiveChartResponseItemType | null;
  chartExpressions: ChartExpression[];
  checkParcel: (parcel: string) => Promise<void>;
}): JSX.Element => {
  if (chartData && !plotData) return <h2>No plot data for chart.</h2>;
  if (!(plotData && chartData)) return <Loading />;

  if (!chartData.values) return <MessageDisplay message="No Info" />;

  const [firstItem] = plotData.values;

  const fields = Object.keys(firstItem);

  const groupField = fields.find((field) => field.endsWith('_group'));

  const calcFields = fields.filter(
    (field) =>
      !field.endsWith('_group') && field !== 'Major' && field !== 'Minor'
  );

  let grouped: { [id: string]: IdValue[] } = {};
  if (groupField) {
    grouped = plotData.values.reduce(
      (prev: { [id: string]: IdValue[] }, curr) => {
        const val = `${curr[groupField]}`;
        const newCurr = { ...curr };
        delete newCurr[groupField];
        prev[val] = [...(prev[val] || []), newCurr];
        return prev;
      },
      {} as { [id: string]: IdValue[] }
    );
  } else {
    grouped = { def: plotData.values };
  }

  const groupArray = Object.keys(grouped).map((t) => ({
    group: t,
    items: grouped[t],
  }));

  const [xfield, yfield] = calcFields;

  const perChartData = groupArray.map((ga) => ({
    data: {
      x: ga.items.map((cv) => cv[xfield]),
      y: ga.items.map((cv) => cv[yfield]),
      text: ga.items.map((cv) => `Parcel: ${cv.Major}-${cv.Minor}`),
      type: 'scatter',
      mode: 'markers',
      name: `${groupField?.replace('_group', '') || yfield} ${ga.group}`,
    },
    xName: xfield,
    yName: yfield,
  }));

  const layout = {
    ...defaultLayout,
    hovermode: 'closest',
    margin: { l: 0, t: 40, r: 10, b: 0 },
    yaxis: {
      automargin: true,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
      title: yfield,
    },
    xaxis: {
      automargin: true,
      title: xfield,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
    },

    autosize: true,
    // legend: { orientation: 'v', x: 0, y: -0.1 },
    showlegend: true,
  };

  const pointClick = (data: PlotMouseEvent): void => {
    console.log(data.points);
    const [firstPoint] = (data.points as unknown) as {
      text: string;
    }[];
    if (!firstPoint?.text) return;
    checkParcel(firstPoint.text);
  };
  const { perChartData: pcd } = GroupData(chartData, chartExpressions, 'Line');
  const d1 = perChartData.map((i) => i.data);
  const dataForChart = [
    ...d1,
    ...pcd.flatMap((itm) => itm.map((x) => x.data)),
  ].map((itm) => {
    const [p1] = itm.name.split('_');
    const [, p2] = itm.name.split(' ');
    return { ...itm, name: `${p1}: ${p2}` };
  });
  // TODO do we flatmap or do we create an array of charts?
  return (
    <div>
      <PlotlyChart
        data={dataForChart}
        layout={layout}
        onClick={pointClick}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default ScatterPlotChart;
