// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import MessageDisplay from 'components/MessageDisplay';
import ZoomContents from 'components/ZoomContents';
import React from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import { SizeMe } from 'react-sizeme';
import {
  ChartExpression,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import { defaultLayout, GroupData } from './paramReaders/chart-utils';

const BarChart = ({
  chartType,
  chartData,
  chartExpressions,
}: {
  chartType: string;
  chartData: InteractiveChartResponseItemType;
  chartExpressions: ChartExpression[];
}): JSX.Element => {
  if (!chartData.values) return <MessageDisplay message="No Info" />;

  const { independentVarName, perChartData } = GroupData(
    chartData,
    chartExpressions,
    chartType
  );

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
      title: independentVarName,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
    },
    barmode: chartType === 'StackBar' ? 'stack' : 'bar',
  };

  return (
    <div className={`bar-frame bf-${perChartData.length}`}>
      {/* <ShowInfo toDisplay={{ xxx }} /> */}
      {perChartData.map((chart, idx) => {
        const newLayout = {
          ...layout,
          yaxis: { ...layout.yaxis, title: chart[0].yName },
        };
        return (
          <ZoomContents key={idx}>
            <SizeMe>
              {(): JSX.Element => (
                <PlotlyChart
                  data={chart.map((ch) => {
                    let s: string;
                    if (ch.data.name.indexOf('_') > -1) {
                      const [l1] = ch.data.name.split('_');
                      const [, l3] = ch.data.name.split(' ');
                      s = `${l1}: ${l3}`;
                    } else s = ch.data.name;
                    return { ...ch.data, name: s };
                  })}
                  layout={newLayout}
                  config={{ responsive: true, displayModeBar: true }}
                />
              )}
            </SizeMe>
          </ZoomContents>
        );
      })}
    </div>
  );
};

export default BarChart;
