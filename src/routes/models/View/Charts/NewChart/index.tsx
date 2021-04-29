/* eslint-disable no-unused-vars */
// NewChart.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import { makeStyles, Box, Divider } from '@material-ui/core';
import CustomHeader from 'components/common/CustomHeader';
import { Link, useHistory, useParams } from 'react-router-dom';
import AssessmentIcon from '@material-ui/icons/Assessment';
import { CustomTextField, DropDownItem } from '@ptas/react-ui-library';
import { ProjectContext } from 'context/ProjectsContext';
import { SimpleDropDown } from '@ptas/react-ui-library';
import { AxiosLoader } from 'services/AxiosLoader';
import {
  ChartExpression,
  GetDatasetColumnsResponseResults,
  IdValue,
  InteractiveChart,
} from 'services/map.typings';
import ParamSetReader from '../paramSetReaderForChart';
import {
  ChartParams,
  ChartShowParams,
  ChartTemplate,
  ChartTypes,
  ChartypeParams,
  DependentVariable,
  GetChartTemplates,
  IndependentVariable,
  LoadChartTypes,
  removeEmpty,
  removeNamedFields,
} from '../paramReaders/chart-utils';
import agGridService from 'services/AgGridService';
import { OverlayDisplay } from '../../Regression/elements';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(4),
  },
  chartInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    marginBottom: theme.spacing(4),
  },
  chartName: { marginRight: theme.spacing(4), flexShrink: 0, width: 320 },
  chartType: { width: 230, flexShrink: 0 },
  populationInfo: {
    display: 'flex',
    flexWrap: 'wrap',
    marginTop: theme.spacing(4),
  },
}));

/**
 * NewChart
 *
 * @returns A JSX element
 */
function NewChart(): JSX.Element {
  const classes = useStyles();
  const notSet = 'not-set';

  const [
    datasetColumns,
    setDatasetColumns,
  ] = useState<GetDatasetColumnsResponseResults | null>(null);

  const context = useContext(ProjectContext);
  const [datasets, setDatasets] = useState<DropDownItem[]>([]);
  const [chartTypes, setChartTypes] = useState<DropDownItem[]>([]);

  const [selectedChartType, setSelectedChartType] = useState('');

  const [selectedDataset, setSelectedDataset] = useState('');
  const [definition, setDefinition] = useState('custom');
  const [message, setMessage] = useState('');
  const history = useHistory();

  const { id }: { id: string } = useParams();

  const getCharts = (): InteractiveChart[] =>
    context.modelDetails?.projectDatasets
      .map((ds) => ds?.dataset?.dependencies.interactiveCharts)
      .flatMap((ds) => ds) ?? [];

  const getChartNames = (): string[] =>
    getCharts().map((c) => c?.chartTitle?.toLowerCase() ?? 'NA');

  const chartNameExists = (chartName: string): boolean =>
    getChartNames().includes(chartName.toLowerCase());

  const nextChartNumber = (): number => {
    const x = /\w+ ?(?<lastNum>[0-9]+)$/;
    const chartNums = getChartNames()
      .map((itm) => itm.match(x)?.groups?.lastNum)
      .filter((f) => f)
      .map((f) => +(f ?? 0));
    const t = chartNums.length ? Math.max(...chartNums) : 0;
    return t + 1;
  };

  const [chartName, setChartName] = useState(`Chart`);
  const [isParamsValid, setIsParamsValid] = useState(false);
  const getNewChartParams = (chartType: ChartTypes): ChartParams => {
    const x: ChartShowParams = ChartypeParams[chartType];
    const dependents =
      x.DependentLimits.maxItems > 0
        ? Array.from(Array(x.DependentLimits.minItems).keys()).map(
            (): DependentVariable => ({})
          )
        : [];
    const independents = Array.from(
      Array(x.IndependentLimits.minItems).keys()
    ).map((): IndependentVariable => ({}));
    const newLocal: ChartParams = {
      IndependentVariables: independents,
      DependentVariables: dependents,
      PlottedVariable: { VariableY: 'Plotted' },
    };
    return newLocal;
  };
  const [workingParams, setWorkingParams] = useState<ChartParams>(
    getNewChartParams('Bar')
  );

  const [chartTemplates, setChartTemplates] = useState<ChartTemplate[]>([]);

  useEffect(() => {
    //
    const fetchData = async (
      customSearchDefinitionId: number
    ): Promise<void> => {
      const datasetColumns = await agGridService.getDatasetColumns(
        selectedDataset,
        false,
        0,
        true
      );

      const templates = await GetChartTemplates(customSearchDefinitionId);
      setChartTemplates(templates);

      if (datasetColumns) {
        datasetColumns.datasetColumns = datasetColumns.datasetColumns.sort(
          (a, b) => (a.columnName > b.columnName ? 1 : -1)
        );
        setDatasetColumns(datasetColumns);
      }
    };
    if (selectedDataset) {
      const foundId =
        context.modelDetails?.projectDatasets.find(
          (t) => t.datasetId === selectedDataset
        )?.dataset.customSearchDefinitionId || 0;

      fetchData(foundId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDataset]);

  useEffect(() => {
    const callIt = async (): Promise<void> => {
      const chartTypes = await LoadChartTypes();
      setChartTypes(chartTypes);
      const [chartType] = chartTypes;
      setSelectedChartType(chartType?.value || '');
    };
    callIt();
  }, [id]);

  const mchange = (): void => {
    const newLocal =
      context.modelDetails?.projectDatasets?.map(
        (pds) =>
          ({
            label: pds.datasetRole,
            value: pds.datasetId,
          } as DropDownItem)
      ) || [];
    setDatasets(newLocal);
    const [dataset] = newLocal;
    setSelectedDataset((dataset?.value as string) || '');
    if (context.modelDetails) setChartName('Chart ' + nextChartNumber());
  };
  useEffect(mchange, [context.modelDetails]);

  useEffect(() => {
    if (selectedChartType) {
      setWorkingParams(getNewChartParams(selectedChartType as ChartTypes));
    }
  }, [selectedChartType]);

  const saveChart = async (): Promise<void> => {
    if (chartNameExists(chartName)) {
      setMessage(`A chart named ${chartName} already exists.`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (definition === 'custom') {
      await createChart();
    } else {
      await createTemplateChart();
    }
  };

  const headerIcons = [
    {
      icon: <AssessmentIcon />,
      text: 'Save Chart',
      disabled: !(chartName && (isParamsValid || definition !== 'custom')),
      onClick: saveChart,
    },
    {
      icon: <AssessmentIcon />,
      text: 'Customize Chart',
      disabled: true,
    },
    {
      icon: <AssessmentIcon />,
      text: 'Export Chart',
      disabled: true,
    },
  ];

  const setChartParams = (chartParams: ChartParams, isValid: boolean): void => {
    setIsParamsValid(isValid);
    setWorkingParams(chartParams);
  };

  return (
    <Fragment>
      <OverlayDisplay message={message} />
      <CustomHeader
        route={[
          <Link key={0} to="/models" style={{ color: 'black' }}>
            All Models
          </Link>,
          <Link key={0} to={`/models/view/${id}`} style={{ color: 'black' }}>
            {context.projectName}
          </Link>,
          <span key={1}>New Chart</span>,
        ]}
        icons={headerIcons}
        detailTop={context.headerDetails?.top}
        detailBottom={context.headerDetails?.bottom}
      />
      {context.modelDetails && (
        <Box className={classes.root}>
          <div className="flex-box">
            <CustomTextField
              label="Name"
              onChange={(e): void => setChartName(e.target.value)}
              value={chartName}
              autoFocus={true}
            />
            <SimpleDropDown
              items={datasets}
              onSelected={(item): void => {
                setSelectedDataset(`${item.value}`);
              }}
              value={selectedDataset}
              label="Dataset"
            />
            <SimpleDropDown
              items={chartTypes}
              onSelected={(item): void => {
                setSelectedChartType(`${item.value}`);
              }}
              label="Type"
              value={selectedChartType}
            />
            <SimpleDropDown
              items={[
                { value: 'custom', label: 'Custom' },
                ...chartTemplates.map((ct) => ({
                  label: ct.chartTitle,
                  value: ct.chartTemplateId,
                })),
              ]}
              onSelected={(item): void => {
                setDefinition(`${item.value}`);
              }}
              value="custom"
              label="Definitions"
            />
          </div>
          <Divider />
          {definition === 'custom' && datasetColumns && (
            <div>
              <ParamSetReader
                chartType={selectedChartType}
                datasetId={selectedDataset}
                datasetColumns={datasetColumns}
                chartParams={workingParams}
                onSetChartParams={setChartParams}
                generator="custom"
              />
            </div>
          )}
        </Box>
      )}
    </Fragment>
  );

  async function createTemplateChart(): Promise<void> {
    const loader = new AxiosLoader<
      {
        chartTemplate: {
          chartType: string;
          chartExpressions: ChartExpression[];
          customSearches: string[];
        };
      },
      IdValue
    >();
    const result = await loader.GetInfo(
      `CustomSearches/GetChartTemplate/${definition}`,
      {}
    );
    if (result) {
      executeChart(
        {
          chartExpressions: result.chartTemplate.chartExpressions
            .map(removeEmpty)
            .map((itm) =>
              removeNamedFields(itm, ['customSearchExpressionId'])
            ) as ChartExpression[],
          chartTitle: chartName,
          datasetId: selectedDataset,
          chartType: result.chartTemplate.chartType,
          customSearches: result.chartTemplate.customSearches,
          chartExtensions: { generator: 'template' },
        },
        true
      );
    }
  }

  async function createChart(): Promise<void> {
    const columnNames: { [id: string]: number } = {};
    const getColumnName = (columnName: string | undefined): string => {
      if (!columnName) return 'NA';
      if (!columnNames[columnName]) {
        columnNames[columnName] = 0;
        return columnName;
      }
      columnNames[columnName] += 1;
      return `${columnName}_${columnNames[columnName]}`;
    };
    const cparams: ChartShowParams = (ChartypeParams as {
      [id: string]: ChartShowParams;
    })[selectedChartType];
    const tier1 = workingParams.IndependentVariables.reduce(
      (prev: IdValue[], iv) => {
        const hasGroup = cparams.HasGroupBy && iv.GroupBy !== notSet;
        const hasBreak = cparams.HasBreak && iv.Break !== notSet;
        const hasBin = cparams.HasBins && iv.Bins !== notSet;
        const groupName = getColumnName(`${iv.ColumnName ?? iv.VariableX}_eg`);
        const isAutoBin = iv.Bins === 'auto';
        prev.push({
          ExpressionType: 'TSQL',
          ExpressionRole: 'IndependentVariable',
          Script: hasBin ? `${iv.VariableX}` : `${iv.VariableX} ASC`,
          ColumnName: getColumnName(iv.VariableX),
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
          prev.push({
            ExpressionType: 'TSQL',
            ExpressionRole: 'GroupByVariable',
            Script: hasBin ? iv.ColumnName : `${iv.GroupBy} ASC`,
            ColumnName: `${iv.GroupBy}_${getColumnName(iv.VariableX)}_group`,
            ExpressionGroup: groupName,
          });
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

    const tier2 = dependentVars.reduce(
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
              ? `custom_formula_${index}_calculated`
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

    const payload = {
      datasetId: selectedDataset,
      chartType: selectedChartType,
      chartTitle: chartName,
      chartExpressions: (tier2 as unknown[]) as ChartExpression[],
      chartExtensions: {
        generator: 'custom',
      },
    };
    await executeChart(payload, false);
  }

  async function executeChart(
    payload: {
      datasetId: string;
      chartType: string;
      chartTitle: string;
      chartExpressions: ChartExpression[];
      chartExtensions: {};
      customSearches?: string[];
    },
    isTemplate: boolean
  ): Promise<void> {
    const loader = new AxiosLoader<{ id: string }, IdValue>();
    setMessage('Saving Chart');
    try {
      const result = (await loader.PutInfo(
        `CustomSearches/ImportInteractiveChart`,
        payload,
        {}
      )) || { id: -1 };
      setMessage('Loading Chart...');
      setTimeout(() => {
        history.push(
          `/models/view-chart/${id}/${selectedDataset}/${result.id}`
        );
      }, 1000);
    } catch (e) {
      setMessage(`${e}`);
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  }
}

export default NewChart;
