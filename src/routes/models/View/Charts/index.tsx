// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useState, Fragment, useEffect, useContext } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import GetAppIcon from '@material-ui/icons/GetApp';
import ChartsService from 'services/ChartService';
import {
  GetDatasetColumnsResponseResults,
  IdValue,
  InteractiveChart,
  InteractiveChartDataInfoType,
} from 'services/map.typings';
import ModelDetailsHeader from 'routes/models/ModelDetailsHeader';
import moment from 'moment';
import ErrorDisplay from 'components/ErrorDisplay';
import { ProjectContext } from 'context/ProjectsContext';
import DisplayChart from './displayChart';
import {
  ChartParams,
  ChartShowParams,
  ChartTypes,
  ChartypeParams,
  CheckParcelApi,
  DependentVariable,
  Formulas,
  IndependentVariable,
} from './paramReaders/chart-utils';
import ChartService from 'services/ChartService';
import agGridService from 'services/AgGridService';
import ParamSetReader from './paramSetReaderForChart';
import Loading from 'components/Loading';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { AxiosLoader } from 'services/AxiosLoader';
import { OverlayDisplay } from '../Regression/elements';
const InteractiveCharts = (): JSX.Element => {
  const {
    id,
    datasetId,
    chartId,
  }: { id: string; datasetId: string; chartId: string } = useParams();

  const [isParamsValid, setIsParamsValid] = useState(true);

  // // const appContext = useContext(AppContext);
  const projectContext = useContext(ProjectContext);
  const modelDetails = projectContext.modelDetails;
  const userDetails = projectContext.userDetails;
  const [errorMessage, setErrorMessage] = useState('');

  const formatDate = (): string => {
    const date = chartInfo
      ? new Date(chartInfo?.lastModifiedTimestamp.toString())
      : new Date();
    return moment(date).format('L LT');
  };

  const [chartInfo, setChartInfo] = useState<InteractiveChart | null>(null);
  const [
    chartInfoResult,
    setChartInfoResult,
  ] = useState<InteractiveChartDataInfoType | null>(null);

  const [plotData, setPlotData] = useState<InteractiveChartDataInfoType | null>(
    null
  );

  const [
    datasetColumns,
    setDatasetColumns,
  ] = useState<GetDatasetColumnsResponseResults | null>(null);

  const msgTotalCounts = `Count Here RowsLast updated ${formatDate()}, by ${
    userDetails?.find((u) => u.id === chartInfo?.lastModifiedBy)?.fullName ??
    chartInfo?.lastModifiedBy
  }`;

  useEffect(() => {
    //
    const fetchData = async (): Promise<void> => {
      const datasetColumns = await agGridService.getDatasetColumns(
        datasetId,
        false,
        0,
        true
      );
      if (datasetColumns) {
        datasetColumns.datasetColumns = datasetColumns.datasetColumns.sort(
          (a, b) => (a.columnName > b.columnName ? 1 : -1)
        );
        setDatasetColumns(datasetColumns);
      }
    };
    if (datasetId) fetchData();
  }, [datasetId]);

  const [dataErrorMessage, setDataErrorMessage] = useState('');

  useEffect(() => {
    const tryGetData = async (): Promise<InteractiveChartDataInfoType | null> => {
      try {
        return await ChartsService.getInteractiveChartDataByNumber(
          chartId,
          false
        );
      } catch (error) {
        setDataErrorMessage(`${error}`);
        return null;
      }
    };
    const fetchData = async (): Promise<void> => {
      try {
        // const chartResult = await ChartService.getInteractiveChartInfo(chartId);

        // const infoChartResult = await ChartsService.getInteractiveChartDataByNumber(
        //   chartId
        // );

        const [chartResult, infoChartResult] = await Promise.all([
          ChartService.getInteractiveChartInfo(chartId),
          tryGetData(),
        ]);
        const expressions = chartResult?.chartExpressions || [];
        const isTemplate =
          chartResult?.chartExtensions?.generator === 'template';
        const independentVariables = expressions
          .filter((itm) => itm.expressionRole === 'IndependentVariable')
          .map(
            (itm): IndependentVariable => {
              const [group] = expressions.filter(
                (expression) =>
                  expression.expressionGroup === itm.expressionGroup &&
                  expression.expressionRole === 'GroupByVariable'
              );
              const name = group?.columnName?.split('_')[0] || 'not-set';
              const [variableX] = isTemplate
                ? [itm.script]
                : itm.script.split(' ');
              const bins = itm.expressionExtensions?.AutoBins
                ? 'auto'
                : 'number';
              const discrete = !!itm.expressionExtensions?.UseDiscreteBins;
              const numBins = itm.expressionExtensions?.NumBins ?? 0;
              const result = {
                Bins: bins,
                Break: name,
                GroupBy: name,
                VariableX: variableX,
                ColumnName: itm.columnName,
                GroupByScript: group?.script ?? '',
                Discrete: discrete,
                Num: numBins || undefined,
              };
              return result;
            }
          );
        const dependentVariables = expressions
          .filter(
            (itm) =>
              itm.expressionRole === 'DependentVariable' &&
              itm.expressionExtensions?.Style !== 'Plotted'
          )
          .map(
            (itm): DependentVariable => {
              let Formula = 'None';
              let customFormula = '';
              let variableY = itm.columnName;
              if (isTemplate || itm.script !== itm.columnName) {
                const [thisFormula] = itm.script.split('(');
                if (
                  !isTemplate &&
                  Formulas.find((itm) => itm === thisFormula)
                ) {
                  Formula = thisFormula;
                  customFormula = '';
                  variableY = itm.expressionGroup;
                } else {
                  Formula = 'Custom';
                  customFormula = itm.script;
                  variableY = '';
                }
              }
              // const parts = itm.columnName.split('_');
              return {
                CustomFormula: customFormula,
                LegendPosition:
                  itm.expressionExtensions?.LegendPosition ?? 'left',
                Formula: Formula,
                Style: itm.expressionExtensions?.Style ?? '',
                VariableY: variableY,
              };
            }
          );

        const [plotted] = expressions
          .filter((exp) => exp.expressionExtensions?.Style === 'Plotted')
          .map(
            (itm): DependentVariable => {
              return {
                VariableY: itm.columnName,
                Style: 'Plotted',
              };
            }
          );
        setWorkingParams({
          DependentVariables: dependentVariables,
          IndependentVariables: independentVariables,
          PlottedVariable: plotted || {},
        });
        if (chartResult?.chartType === 'ScatterPlot') {
          const plotData = await ChartsService.getInteractiveChartDataByNumber(
            chartId,
            true
          );
          setPlotData(plotData);
        }
        setChartInfo(chartResult);
        setChartInfoResult(infoChartResult);
      } catch (error) {
        setErrorMessage(`${error}`);
        console.log(error);
      }
    };
    fetchData();
  }, [datasetId, chartId]);

  const [workingParams, setWorkingParams] = useState<ChartParams | null>();
  const [message, setMessage] = useState('');

  const setChartParams = (chartParams: ChartParams, isValid: boolean): void => {
    setIsParamsValid(isValid);
    setWorkingParams(chartParams);
  };
  const [showCust, setShowCust] = useState(false);

  const saveChart = async (): Promise<void> => {
    if (!workingParams || !chartInfo) return;
    const columnNames: { [id: string]: number } = {};
    const getColumnName = (columnName: string | undefined): string => {
      if (!columnName) return 'NA';
      if (!columnNames[columnName]) {
        columnNames[columnName] = 1;
        return columnName;
      }
      columnNames[columnName] += 1;
      return `${columnName}_${columnNames[columnName]}`;
    };
    const cparams: ChartShowParams = (ChartypeParams as {
      [id: string]: ChartShowParams;
    })[chartInfo.chartType];
    // todo: factorize
    const tier1 = workingParams.IndependentVariables.reduce(
      (prev: IdValue[], iv) => {
        const isTemplate = !!iv.ColumnName;
        const hasGroup = cparams.HasGroupBy && iv.GroupBy !== 'not-set';
        const hasBreak = cparams.HasBreak && iv.Break !== 'not-set';
        const groupName = getColumnName(`${iv.ColumnName ?? iv.VariableX}_eg`);
        const hasBin = cparams.HasBins && iv.Bins !== 'not-set';
        const isAutoBin = iv.Bins === 'auto';
        prev.push({
          ExpressionType: 'TSQL',
          ExpressionRole: 'IndependentVariable',
          Script: isTemplate || hasBin ? iv.VariableX : `${iv.VariableX} ASC`,
          ColumnName: iv.ColumnName ?? getColumnName(iv.VariableX),
          ExpressionGroup: hasGroup || hasBreak ? groupName : '',
          ExpressionExtensions: hasBin
            ? {
                AutoBins: isAutoBin,
                NumBins: isAutoBin ? undefined : iv.Num,
                UseDiscreteBins: !!iv.Discrete,
              }
            : null,
        });
        if (hasGroup) {
          const groupVariable = {
            ExpressionType: 'TSQL',
            ExpressionRole: 'GroupByVariable',
            Script: isTemplate
              ? iv.GroupByScript
              : hasBin
              ? iv.ColumnName
              : `${iv.GroupBy} ASC`,
            ColumnName:
              isTemplate || hasBin
                ? `${iv.GroupBy}`
                : `${iv.GroupBy}_${getColumnName(iv.VariableX)}_group`,
            ExpressionGroup: groupName,
          };
          prev.push(groupVariable);
        }
        if (hasBreak) {
          const breakExpr = {
            ExpressionType: 'TSQL',
            ExpressionRole: 'GroupByVariable',
            Script: hasBin ? iv.Break : `${iv.Break} ASC`,
            ColumnName: getColumnName(iv.Break),
            ExpressionGroup: groupName,
          };
          prev.push(breakExpr);
        }
        return prev;
      },
      []
    );
    const toPlot: DependentVariable = {
      ...workingParams.PlottedVariable,
      Formula: '',
      LegendPosition: 'left',
    };
    const dependentVars: DependentVariable[] = cparams.HasPlottedDependant
      ? [toPlot, ...workingParams.DependentVariables]
      : [...workingParams.DependentVariables];

    const t2 = dependentVars.reduce(
      (prev: IdValue[], iv: DependentVariable, index: number) => {
        const hasFormula =
          cparams.HasFormula && iv.Formula && iv.Formula !== 'None';
        const formula = hasFormula
          ? iv.Formula === 'Custom'
            ? iv.CustomFormula
            : iv.Formula + '(' + iv.VariableY + ')'
          : '';
        prev.push({
          ExpressionType: 'TSQL',
          ExpressionRole: 'DependentVariable',
          Script: hasFormula ? formula : iv.VariableY,
          ColumnName: hasFormula
            ? iv.Formula === 'Custom'
              ? formula?.replace(' ', '_')
              : `${iv.Formula}_of_${getColumnName(iv.VariableY)}_calculated`
            : iv.VariableY,
          ExpressionGroup: iv.VariableY,
          ExpressionExtensions: {
            Style: iv.Style,
            LegendPosition: iv.LegendPosition,
          },
        });
        return prev;
      },
      tier1
    );
    const loader = new AxiosLoader<{ id: string }, IdValue>();
    setMessage('Saving Chart');
    const payload = {
      DatasetId: chartInfo.datasetId,
      ChartType: chartInfo.chartType,
      ChartTitle: chartInfo.chartTitle,
      ChartExpressions: t2,
      chartExtensions: chartInfo.chartExtensions,
    };
    try {
      // if ('1' === `1`) return;
      const result = (await loader.PutInfo(
        'CustomSearches/ImportInteractiveChart',
        payload,
        {}
      )) || { id: -1 };
      setMessage('Loading Chart...');
      setTimeout(() => {
        window.location.href = `/models/view-chart/${id}/${
          chartInfo.datasetId
        }/${chartInfo.interactiveChartId}?rnd=${Math.random()}${result?.id}`;
      }, 1000);
    } catch (e) {
      setMessage(`${e}`);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  };

  const history = useHistory();

  if (!(workingParams && datasetColumns)) {
    return <Loading />;
  }

  return (
    <Fragment>
      <OverlayDisplay message={message} />
      <ModelDetailsHeader
        userDetails={userDetails}
        modelDetails={modelDetails}
        icons={[
          {
            icon: <AssessmentIcon />,
            text: 'Save Chart',
            disabled: !isParamsValid || !showCust,
            onClick: saveChart,
          },
          {
            icon: <AssessmentIcon />,
            text: showCust ? 'Cancel Customization' : 'Customize',
            onClick: (): void => setShowCust(!showCust),
            disabled: false,
          },
          {
            icon: <GetAppIcon />,
            text: 'Export',
          },
        ]}
        detailTop={msgTotalCounts}
        links={[<span>{chartInfo?.chartTitle}</span>]}
      />
      <h2>
        {chartInfo?.chartTitle} <small>({chartInfo?.chartType})</small>
      </h2>
      <ErrorDisplay message={errorMessage} />
      <ErrorDisplay message={dataErrorMessage} />
      {workingParams && datasetColumns && showCust && (
        <Fragment>
          <ParamSetReader
            chartType={chartInfo?.chartType || 'Bar'}
            datasetId={datasetId}
            datasetColumns={datasetColumns}
            chartParams={workingParams}
            onSetChartParams={setChartParams}
            generator={chartInfo?.chartExtensions?.generator || 'custom'}
          />
        </Fragment>
      )}
      {!showCust &&
        chartInfoResult?.results?.map((r, i) => {
          const data = plotData?.results ? plotData.results[i] : null;
          return (
            <DisplayChart
              key={i}
              chartType={(chartInfo?.chartType || 'Bar') as ChartTypes}
              chartData={r}
              plotData={data}
              checkParcel={async (parcel: string): Promise<void> => {
                try {
                  await CheckParcelApi(chartInfo?.datasetId || '', parcel);
                  history.push(
                    `/models/results/chart/${id}/${datasetId}/${chartId}/${chartInfo?.chartTitle}`
                  );
                } catch (error) {
                  setErrorMessage(`${error}`);
                }
              }}
              chartExpressions={chartInfo?.chartExpressions}
            />
          );
        })}
    </Fragment>
  );
};

export default InteractiveCharts;
