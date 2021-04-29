// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import ShowInfo from 'components/showInfo';
import React, { Fragment, memo } from 'react';
import {
  ChartExpression,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import BarChart from './BarChart';
import BoxPlot from './BoxPlotChart';
import CircularChart from './CircularChart';
import ComboChart from './ComboChart';
import HistogramChart from './HistogramChart';
// import ComboChart from './ComboChart';
import { ChartTypes } from './paramReaders/chart-utils';
import ScatterMatrixChart from './ScatterMatrixChart';
import ScatterPlotChart from './ScatterPlotChart';

const DisplayChart = ({
  chartData,
  chartType,
  chartExpressions,
  plotData,
  checkParcel,
}: {
  chartData: InteractiveChartResponseItemType;
  plotData: InteractiveChartResponseItemType | null;
  chartType: ChartTypes;
  chartExpressions: ChartExpression[] | undefined;
  checkParcel: (parcel: string) => Promise<void>;
}): JSX.Element => {
  const ChartDisplay = memo(
    ({
      chartData,
      chartType,
      chartExpressions,
    }: {
      chartData: InteractiveChartResponseItemType;
      chartType: ChartTypes;
      chartExpressions: ChartExpression[] | undefined;
    }) => {
      switch (chartType) {
        case 'Bar':
        case 'Line':
        case 'StackBar':
          return (
            <BarChart
              chartExpressions={chartExpressions || []}
              chartData={chartData}
              chartType={chartType}
            />
          );
        case 'Pie':
        case 'Donut':
          return (
            <CircularChart
              chartExpressions={chartExpressions || []}
              chartData={chartData}
              chartType={chartType}
            />
          );
        case 'BoxPlot':
          return (
            <BoxPlot
              chartData={chartData}
              chartType={chartType}
              checkParcel={checkParcel}
              chartExpressions={chartExpressions || []}
            />
          );
        case 'Combo':
          return (
            <ComboChart
              chartData={chartData}
              chartType={chartType}
              chartExpressions={chartExpressions}
            />
          );
        case 'ScatterPlot':
          return (
            <ScatterPlotChart
              chartExpressions={chartExpressions || []}
              chartData={chartData}
              plotData={plotData}
              checkParcel={checkParcel}
            />
          );
        case 'ScatterPlotMatrix':
          return (
            <ScatterMatrixChart
              checkParcel={checkParcel}
              chartExpressions={chartExpressions || []}
              chartData={chartData}
            />
          );
        case 'Histogram':
          return (
            <HistogramChart
              chartExpressions={chartExpressions || []}
              chartData={chartData}
            />
          );
        default:
          return (
            <ShowInfo toDisplay={{ chartType, chartExpressions, chartData }} />
          );
      }
    }
  );
  return (
    <Fragment>
      {chartExpressions && chartData && (
        <ChartDisplay
          chartData={chartData}
          chartType={chartType}
          chartExpressions={chartExpressions}
        />
      )}
    </Fragment>
  );
};
export default DisplayChart;
