// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import ZoomContents from 'components/ZoomContents';
import { PlotMouseEvent } from 'plotly.js';
import React, { Fragment } from 'react';
import PlotlyChart from 'react-plotlyjs-ts';
import { SizeMe } from 'react-sizeme';
import { GroupData, IndependentData } from './Charts/paramReaders/chart-utils';

const ScatterPlotPlot = ({
  data,
  checkParcel,
}: {
  data: GroupData[];
  checkParcel: (parcel: string) => Promise<void>;
}): JSX.Element => {
  const xAxisTitle = data[0].independent;
  const yAxisTitle = data[0].dependent;
  const pointClick = (data: PlotMouseEvent): void => {
    const [firstPoint] = (data.points as unknown) as {
      text: string;
    }[];
    if (!firstPoint?.text) return;
    checkParcel(firstPoint.text);
  };

  const values = data.map((d) => ({
    x: d.values.map((v) => v.x),
    y: d.values.map((v) => v.y),
    text: d.values.map((v) => v.label),
    mode: 'markers',
    type: 'scatter',
    name: d.label.replace('undefined', ''),
  }));
  const layout = {
    hovermode: 'closest',
    margin: { l: 0, t: 40, r: 10, b: 0 },
    title: yAxisTitle + '/' + xAxisTitle,
    yaxis: {
      automargin: true,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
      title: yAxisTitle,
    },
    xaxis: {
      automargin: true,
      title: xAxisTitle,
      autorange: true,
      showgrid: true,
      zeroline: true,
      showline: true,
    },

    autosize: true,
    // legend: { orientation: 'v', x: 0, y: -0.1 },
    showlegend: true,
  };
  return (
    <Fragment>
      <ZoomContents>
        <SizeMe>
          {(): JSX.Element => (
            <PlotlyChart
              data={values}
              layout={layout}
              config={{ responsive: true }}
              onClick={pointClick}
            />
          )}
        </SizeMe>
      </ZoomContents>
    </Fragment>
  );
};

const ScatterMatrixIndependent = ({
  independent,
  checkParcel,
}: {
  independent: IndependentData;
  checkParcel: (parcel: string) => Promise<void>;
}): JSX.Element => {
  return (
    <div className={`bar-frame bf-${independent.groups.length}`}>
      {independent.groups.map((g, index) => {
        return (
          <div key={index}>
            <ScatterPlotPlot checkParcel={checkParcel} data={g} />
          </div>
        );
      })}
    </div>
  );
};

export default ScatterMatrixIndependent;
