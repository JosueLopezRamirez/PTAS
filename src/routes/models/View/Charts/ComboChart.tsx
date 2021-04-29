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
  IdValue,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import { defaultLayout } from './paramReaders/chart-utils';

const ComboChart = ({
  chartType,
  chartData,
  chartExpressions,
}: {
  chartType: string;
  chartData: InteractiveChartResponseItemType;
  chartExpressions: ChartExpression[] | undefined;
}): JSX.Element => {
  if (!chartData.values) return <MessageDisplay message="No Info" />;

  const ind = chartData.independentVariable;
  const [firstItem] = chartData.values;
  const fields = Object.keys(firstItem).filter((k) => k !== ind);

  const groupField = fields.find((field) => field.endsWith('_group'));
  const calcFields = fields.filter((field) => !field.endsWith('_group'));
  let grouped: { [id: string]: IdValue[] } = {};
  if (groupField) {
    grouped = chartData.values.reduce(
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
    grouped = { def: chartData.values };
  }

  const getChartType = (fieldName: string): ChartExpression | undefined => {
    const r = chartExpressions?.find((ch) => ch.columnName === fieldName);
    return r;
  };

  const groupArray = Object.keys(grouped).map((t) => ({
    group: t,
    items: grouped[t],
  }));
  const perChartData = calcFields.map((fieldName: string, idx) =>
    groupArray.map((ga) => {
      const ct = getChartType(fieldName);
      return {
        data: {
          x: ga.items.map((cv) => cv[ind]),
          y: ga.items.map((cv) => cv[fieldName]),
          yaxis: idx === 0 ? undefined : `y${idx + 1}`,
          // yaxisside: ct?.expressionExtensions.LegendPosition.toLowerCase(),
          type: ct?.expressionExtensions.Style ?? 'bar',
          name: fieldName.replaceAll('_', ' ').replace(' calculated', ''),
        },
        xName: ind,
        yName: fieldName.replaceAll('_', ' ').replace(' calculated', ''),
      };
    })
  );

  const layout = {
    ...defaultLayout,
    xaxis: {
      automargin: true,
      title: ind,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
    },
  };

  const data = perChartData.reduce((prev: {}[], curr): {}[] => {
    return [...prev, ...curr.map((c) => c.data)];
  }, []);

  const yAxises = data.reduce((prev: IdValue, curr: IdValue, index) => {
    const idx = index > 0 ? `yaxis${index + 1}` : 'yaxis';
    prev[idx] = {
      title: curr.name,
      side: index === 0 ? 'left' : 'right',
      overlaying: index === 0 ? undefined : 'y',
      automargin: true,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
    };
    return prev;
  }, {});
  const newLayout = { ...layout, ...yAxises };

  return (
    <div>
      <PlotlyChart
        data={data}
        layout={newLayout}
        config={{ responsive: true }}
      />
    </div>
  );
};

export default ComboChart;
