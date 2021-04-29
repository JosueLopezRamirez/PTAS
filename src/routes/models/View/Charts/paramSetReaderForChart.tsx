/* eslint-disable no-unused-vars */
// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import React, { Fragment } from 'react';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import {
  ChartParams,
  ChartShowParams,
  ChartypeParams,
  CreateIndependent,
  DependentVariable,
  IndependentVariable,
} from './paramReaders/chart-utils';
import { CustomIconButton } from '@ptas/react-ui-library';
import { Box } from '@material-ui/core';
import Independent from './paramReaders/independent';
import Dependent from './paramReaders/dependent';
import { GetDatasetColumnsResponseResults } from 'services/map.typings';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import ShowInfo from 'components/showInfo';
const ParamSetReader = ({
  chartType,
  datasetId,
  datasetColumns,
  chartParams,
  generator,
  onSetChartParams,
}: {
  chartType: string;
  datasetId: string;
  datasetColumns: GetDatasetColumnsResponseResults;
  chartParams: ChartParams;
  generator: string;
  onSetChartParams: (values: ChartParams, valid: boolean) => void;
}): JSX.Element => {
  const t = ChartypeParams as { [id: string]: ChartShowParams };
  const isTemplate = generator === 'template';
  const chartShowParams: ChartShowParams = t[chartType];

  const setIndependent = (index: number, value: IndependentVariable): void => {
    const ncv = { ...chartParams };
    ncv.IndependentVariables[index] = value;
    setChartParams(ncv);
  };

  const setChartParams = (ncv: ChartParams): void => {
    console.log({ chartType });
    onSetChartParams(
      ncv,
      ncv.IndependentVariables.length > 0 &&
        (ncv.DependentVariables.length > 0 || chartType === 'Histogram')
    );
  };

  const setDependent = (index: number, value: DependentVariable): void => {
    const ncv = { ...chartParams };
    ncv.DependentVariables[index] = value;
    setChartParams(ncv);
  };

  const setPlotted = (value: DependentVariable): void => {
    const ncv = {
      ...chartParams,
      PlottedVariable: value,
      HasPlottedDependant: true,
    };
    setChartParams(ncv);
  };

  const deleteIndependant = (index: number): void => {
    const nv = [...chartParams.IndependentVariables];
    nv.splice(index, 1);
    const ncv: ChartParams = {
      ...chartParams,
      IndependentVariables: nv,
    };
    setChartParams(ncv);
  };
  const deleteDependant = (index: number): void => {
    const nv = [...chartParams.DependentVariables];
    nv.splice(index, 1);
    const ncv: ChartParams = {
      ...chartParams,
      DependentVariables: nv,
    };
    setChartParams(ncv);
  };

  const plottedParams: ChartShowParams = {
    ...chartShowParams,
    HasFormula: false,
  };

  return (
    <Fragment>
      {chartParams.IndependentVariables.map((iv, i) => {
        return (
          <Independent
            isTemplate={isTemplate}
            key={i}
            onDeleteItem={(): void => deleteIndependant(i)}
            canDelete={
              chartParams.IndependentVariables.length >
              chartShowParams.IndependentLimits.minItems
            }
            chartShowParams={chartShowParams}
            datasetColumns={datasetColumns}
            independentParams={iv}
            onSetIndependentParams={(value: IndependentVariable): void =>
              setIndependent(i, value)
            }
          />
        );
      })}

      {chartShowParams.IndependentLimits.maxItems !==
        chartShowParams.IndependentLimits.minItems &&
        chartParams.IndependentVariables.length <
          chartShowParams.DependentLimits.maxItems && (
          <Box className="variable-buttons">
            <CustomIconButton
              text="New Independent Variable"
              icon={<AddCircleOutlineIcon />}
              onClick={(): void => {
                const t: ChartParams = {
                  ...chartParams,
                  IndependentVariables: [
                    ...chartParams.IndependentVariables,
                    CreateIndependent(),
                  ],
                };
                onSetChartParams(t, true);
              }}
            />
          </Box>
        )}
      {chartShowParams.HasPlottedDependant && (
        <Fragment>
          <Dependent
            chartShowParams={plottedParams}
            datasetColumns={datasetColumns}
            dependentParams={chartParams.PlottedVariable}
            canDelete={false}
            defaultPlotStyle={'Plotted'}
            onSetDependentParams={setPlotted}
            isTemplate={false}
            onDeleteItem={(): void => {
              //nothing
            }}
          />
        </Fragment>
      )}
      {chartShowParams.DependentLimits.maxItems > 0 &&
        chartParams.DependentVariables.map((iv, i) => {
          return (
            <Dependent
              key={i}
              chartShowParams={chartShowParams}
              datasetColumns={datasetColumns}
              dependentParams={iv}
              canDelete={
                chartParams.DependentVariables.length >
                chartShowParams.DependentLimits.minItems
              }
              onSetDependentParams={(value: DependentVariable): void =>
                setDependent(i, value)
              }
              onDeleteItem={(): void => deleteDependant(i)}
              isTemplate={isTemplate}
            />
          );
        })}
      {chartShowParams.DependentLimits.maxItems !==
        chartShowParams.DependentLimits.minItems &&
        chartParams.DependentVariables.length <
          chartShowParams.DependentLimits.maxItems && (
          <Box className="variable-buttons">
            <CustomIconButton
              text="New Dependent Variable"
              icon={<AddCircleOutlineIcon />}
              onClick={(): void => {
                const t: ChartParams = {
                  ...chartParams,
                  DependentVariables: [
                    ...chartParams.DependentVariables,
                    {} as DependentVariable,
                  ],
                };
                onSetChartParams(t, true);
              }}
            />
          </Box>
        )}
    </Fragment>
  );
};
export default ParamSetReader;
