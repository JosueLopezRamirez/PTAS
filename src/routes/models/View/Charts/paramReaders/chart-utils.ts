// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { DropDownItem } from '@ptas/react-ui-library';
import agGridService from '../../../../../services/AgGridService';
import {
  ChartExpression,
  IdValue,
  InteractiveChartResponseItemType,
} from 'services/map.typings';
import { AxiosLoader } from 'services/AxiosLoader';


export interface ChartTemplate {
  chartTemplateId: number;
  chartType: string;
  chartTitle: string;
  createdBy: string;
  lastModifiedBy: string;
  createdTimestamp: Date;
  lastModifiedTimestamp: Date;
  chartExpressions?: unknown;
  customSearches?: unknown;
}

interface CountLimits {
  maxItems: number;
  minItems: number;
}
export interface ChartShowParams {
  HasGroupBy?: boolean;
  HasBreak?: boolean;
  HasBins?: boolean;
  HasFormula?: boolean;
  HasLegendPosition?: boolean;
  HasLimits?: boolean;
  HasStyle?: boolean;
  NoAggregates?: boolean;
  DependentLimits: CountLimits;
  IndependentLimits: CountLimits;
  HasPlottedDependant?: boolean;
}
export interface IndependentVariable {
  VariableX?: string;
  GroupBy?: string;
  ColumnName?: string;
  GroupByScript?: string;
  Break?: string;
  Bins?: string;
  Num?: number;
  Min?: number;
  Max?: number;
  Discrete?: boolean;
}

export interface DependentVariable {
  VariableY?: string;
  Formula?: string;
  LegendPosition?: string;
  Style?: string;
  CustomFormula?: string;
}

export interface ChartParams {
  IndependentVariables: IndependentVariable[];
  DependentVariables: DependentVariable[];
  PlottedVariable: DependentVariable;
}

interface FormulaMapping {
  label: string;
  formula: string;
}

export type ChartTypes =
  | 'Bar'
  | 'BoxPlot'
  | 'ScatterPlot'
  | 'ScatterPlotMatrix'
  | 'Histogram'
  | 'StackBar'
  | 'Line'
  | 'Pie'
  | 'Combo'
  | 'Donut';

type formulaTypes = 'Sum' | 'Count' | 'Avg' | 'Max' | 'Min' | 'Custom';
export const Formulas: formulaTypes[] = [
  'Sum',
  'Count',
  'Avg',
  'Max',
  'Min',
  'Custom',
];

export const ChartypeParams: { [id in ChartTypes]: ChartShowParams } = {
  Bar: {
    HasGroupBy: true,
    HasFormula: true,
    DependentLimits: { maxItems: 3, minItems: 1 },
    IndependentLimits: { maxItems: 3, minItems: 1 },
  },
  BoxPlot: {
    HasBreak: true,
    HasFormula: false,
    DependentLimits: { maxItems: 1, minItems: 1 },
    IndependentLimits: { maxItems: 1, minItems: 1 },
  },
  Combo: {
    HasFormula: true,
    HasLegendPosition: true,
    HasStyle: true,
    DependentLimits: { maxItems: 3, minItems: 2 },
    IndependentLimits: { maxItems: 3, minItems: 1 },
  },
  Histogram: {
    HasBreak: true,
    HasBins: true,
    HasLimits: false,
    HasFormula: true,
    DependentLimits: { maxItems: 0, minItems: 1 },
    IndependentLimits: { maxItems: 1, minItems: 1 },
  },
  Line: {
    HasGroupBy: true,
    HasFormula: true,
    DependentLimits: { maxItems: 3, minItems: 1 },
    IndependentLimits: { maxItems: 3, minItems: 1 },
  },
  Donut: {
    HasFormula: true,
    DependentLimits: { maxItems: 3, minItems: 1 },
    IndependentLimits: { maxItems: 3, minItems: 1 },
  },
  ScatterPlot: {
    HasGroupBy: true,
    HasFormula: true,
    HasStyle: true,
    HasPlottedDependant: true,
    DependentLimits: { maxItems: 2, minItems: 0 },
    IndependentLimits: { maxItems: 3, minItems: 1 },
  },
  ScatterPlotMatrix: {
    HasBreak: true,
    HasFormula: true,
    NoAggregates: true,
    DependentLimits: { maxItems: 3, minItems: 1 },
    IndependentLimits: { maxItems: 3, minItems: 1 },
  },
  StackBar: {
    HasGroupBy: true,
    HasFormula: true,
    DependentLimits: { maxItems: 3, minItems: 1 },
    IndependentLimits: { maxItems: 3, minItems: 1 },
  },
  Pie: {
    HasFormula: true,
    DependentLimits: {
      maxItems: 3,
      minItems: 1,
    },
    IndependentLimits: {
      maxItems: 3,
      minItems: 1,
    },
  },
};

export const ChartTypes: DropDownItem[] = [
  { value: 'BoxPlot', label: 'Box Plot' },
  { value: 'ScatterPlot', label: 'Scatter Plot' },
  { value: 'Histogram', label: 'Histogram' },
  { value: 'Bar', label: 'Bar chart' },
  { value: 'StackBar', label: 'Stacked bar/column chart' },
  { value: 'Line', label: 'Line graph' },
  { value: 'Pie', label: 'Pie Chart' },
  { value: 'Combo', label: 'Combo Chart' },
];

export const BinTypes: DropDownItem[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'number', label: 'Number' },
];

export const CreateIndependent = (): IndependentVariable => ({
  Bins: 'auto',
  Break: 'not-set',
  GroupBy: 'not-set',
  Num: 0,
  Max: 0,
  Min: 0,
});

interface ChartInput {
  data: {
    x: unknown[];
    y: unknown[];
    type: string;
    name: string;
  };
  xName: string;
  yName: string;
}

export function GroupData(
  chartData: InteractiveChartResponseItemType,
  chartExpressions: ChartExpression[],
  chartType: string
): { independentVarName: string; perChartData: ChartInput[][] } {
  console.log({ chartExpressions });
  const independentVarName = chartData.independentVariable;
  const [firstItem] = chartData.values;
  const fields = Object.keys(firstItem).filter((k) => k !== independentVarName);

  const groups = chartExpressions.filter(me => me.expressionRole === 'GroupByVariable');


  const groupField = fields.find((field) => groups.findIndex(g => g.columnName) > -1);
  const calcFields = fields.filter((field) => {
    const found = groups.findIndex(g => g.columnName === field);
    return found === -1;
  });
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
  const groupArray = Object.keys(grouped).map((key) => ({
    group: key,
    items: grouped[key],
  }));
  const perChartData = calcFields.map((fieldName: string) =>
    groupArray.map((ga) => ({
      data: {
        x: ga.items.map((cv) => cv[independentVarName]),
        y: ga.items.map((cv) => cv[fieldName]),
        type: chartType === 'Line' ? 'line' : 'bar',
        name: `${groupField?.replace('_group', '') || fieldName} ${ga.group}`,
      },
      xName: independentVarName,
      yName: fieldName.replaceAll('_', ' ').replace(' calculated', ''),
    }))
  );
  return { independentVarName, perChartData };
}

/* types for splom */

// // export interface SplomData {
// //   AllData: IndependentData[];
// // }

export interface IndependentData {
  independent: string;
  groupBy: string;
  groups: GroupData[][];
}
export interface GroupData {
  group: string;
  label: string;
  dependent: string;
  independent: string;
  values: SplomValue[];
}
export interface SplomValue {
  y: number;
  x: string;
  label: string;
}

export const removeEmpty = (obj: {} | {}[]): {} => {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([_, v]) => v != null)
  );
}

export const removeNamedFields = (obj: {}, fields: string[]): {} =>
  Object.fromEntries(
    Object.entries(obj)
      .filter(([n, _]) => !fields.includes(n))
  )

export const defaultLayout = {
  autosize: true,
  margin: { l: 0, t: 0, r: 0, b: 0 },

  yaxis: {
    automargin: true
  },
  xaxis: {
    automargin: true
  },
  'plot_bgcolor': '#eee',
  'paper_bgcolor': 'white',
  legend: { orientation: 'v', x: 30, y: 0 },
  showlegend: true,
  style: { width: "100%", height: "100%", backgroundColor: 'yellow' }
}

export const CheckParcelApi = async (
  datasetId: string,
  parcel: string,
): Promise<IdValue> => {
  const [Major, Minor] = parcel.split("-");
  const x = await agGridService.saveUpdateDatasetData(datasetId, [{ Selection: true, Major, Minor }]);
  const [result] = x;
  return result;
}

export interface HistogramBinValue {
  binRangeStart: number;
  binRangeEnd: number;
  binObservations: number;
}

export async function LoadChartTypes(): Promise<{ label: string; value: string }[]> {
  const ldr = new AxiosLoader<{ interactiveChartTypes: string[] }, never>();
  const result = await ldr.GetInfo(
    'CustomSearches/GetInteractiveChartTypes',
    {}
  );
  const chartTypes =
    result?.interactiveChartTypes.map((s: string) => ({
      label: s,
      value: s,
    })) || [];
  return chartTypes;
}

export async function GetChartTemplates(
  customSearchId: number | string
): Promise<ChartTemplate[]> {
  const ldr = new AxiosLoader<{ chartTemplates: ChartTemplate[] }, never>();
  return (
    (
      await ldr.GetInfo(
        `CustomSearches/GetChartTemplates/${customSearchId}`,
        {}
      )
    )?.chartTemplates ?? []
  );
}

