import { ExpressionGridData } from './../ExpressionsGrid';
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { AxiosLoader } from './../../../../../../services/AxiosLoader';
import {
  IdOnly,
  // LandExceptionTypes,
  AdjustmentParam,
  SheetType,
  LandVariableGridRowData,
} from 'services/map.typings';
import { deleteDatasetPostProcess } from 'services/common';

interface LandRegressionModalType {
  to: string;
  default: string;
}

interface WaterFrontType {
  datasetId: string;
  rules: LandRegressionModalType[];
  step: number;
}

interface PredictedEcuation {
  predictedEquation: string;
}

export const getPredictedEcuation = (
  postProcessId: number,
  precision = 4
): Promise<PredictedEcuation | null> => {
  const ad2 = new AxiosLoader<PredictedEcuation, {}>();
  return ad2.GetInfo(
    `CustomSearches/GetRScriptPredictedEquation/${postProcessId}?precision=${precision}`,
    {}
  );
};

export const executeDatasetPostProcess = (
  datasetId: string,
  postProcessId: number | string
): Promise<IdOnly | null> => {
  const ad2 = new AxiosLoader<IdOnly, {}>();
  return ad2.PutInfo(
    `CustomSearches/ExecuteDatasetPostProcess/${datasetId}/${postProcessId}`,
    [
      {
        Id: 0,
        Name: '',
        Value: '',
      },
    ],
    {}
  );
};

// payload is of type any since the internal data changes depending on the type of postprocess
// eslint-disable-next-line
const saveExceptionPostProcess = async (payload: any): Promise<IdOnly | null> => {
  const al1 = new AxiosLoader<IdOnly, {}>();
  return al1.PutInfo('CustomSearches/ImportExceptionPostProcess', payload, {});
};

export const applyRegressionToSchedule = async (
  regressionId: number,
  exceptionId: number
): Promise<IdOnly | null> => {
  const al1 = new AxiosLoader<IdOnly, {}>();
  return al1.PutInfo(
    `CustomSearches/ApplyLandRegressionToSchedule/${regressionId}/${exceptionId}`,
    {},
    {}
  );
};

export const nonWaterFrontExpressionService = async (
  expressionData: ExpressionGridData[],
  datasetId: string,
  setPostProcessId: Function,
  postProcessId?: number
): Promise<IdOnly | null> => {
  const value = 'LandValue';
  const expreMessage = 'NonwaterfrontExpressions';
  const rules = expressionData.map((expre) => {
    return {
      description: `Plat Value: ${expre.filter}`,
      customSearchExpressions: [
        {
          expressionType: 'TSQL',
          expressionRole: 'FilterExpression',
          script: expre.filter,
          columnName: value,
          expressionExtensions: {
            Note: expre.note || '',
            traceMessage: `${expreMessage}: ${expre.filter}`,
          },
        },
        {
          expressionType: 'TSQL',
          expressionRole: 'CalculatedColumn',
          script: expre.expression,
          columnName: value,
        },
      ],
    };
  });

  const data = {
    datasetId: datasetId,
    postProcessName: 'Non waterfront expressions',
    postProcessRole: 'NonWaterfrontExpressions',
    priority: 2101,
    postProcessDefinition: 'Non waterfront expressions',
    PostProcessSubType: 'UniqueConditionSelector',
    traceEnabledFields: ['LandValue'],
    exceptionPostProcessRules: rules,
  };

  if (rules.length === 0) {
    if (postProcessId) {
      await deleteDatasetPostProcess(postProcessId);
      setPostProcessId(undefined);
    }
    return null;
  }
  return saveExceptionPostProcess(data);
};

export const waterFrontExpressionService = async (
  expressionData: ExpressionGridData[],
  datasetId: string,
  setPostProcessId: Function,
  postProcessId?: number
): Promise<IdOnly | null> => {
  const value = 'WaterfrontValue';
  const expreMessage = 'WaterfrontExpressions';
  const rules = expressionData.map((expre) => {
    return {
      description: `Plat Value: ${expre.filter}`,
      customSearchExpressions: [
        {
          expressionType: 'TSQL',
          expressionRole: 'FilterExpression',
          script: expre.filter,
          columnName: value,
          expressionExtensions: {
            Note: expre.note || '',
            traceMessage: `${expreMessage}: ${expre.filter}`,
          },
        },
        {
          expressionType: 'TSQL',
          expressionRole: 'CalculatedColumn',
          script: expre.expression,
          columnName: value,
        },
      ],
    };
  });

  const data = {
    datasetId: datasetId,
    postProcessName: 'Waterfront expressions',
    postProcessRole: 'WaterfrontExpressions',
    priority: 2201,
    postProcessDefinition: 'Waterfront expressions',
    PostProcessSubType: 'UniqueConditionSelector',
    traceEnabledFields: ['WaterfrontValue'],
    exceptionPostProcessRules: rules,
  };

  if (rules.length === 0) {
    if (postProcessId) {
      await deleteDatasetPostProcess(postProcessId);
      setPostProcessId(undefined);
    }
    return null;
  }

  return saveExceptionPostProcess(data);
};

export const runWaterFrontFromExcel = async (
  excelData: SheetType | undefined,
  datasetId: string
): Promise<IdOnly | null> => {
  if (!excelData) return null;
  const { rows, headers } = excelData;
  let step = 0;
  //eslint-disable-next-line
  let rules: any[] = [];
  rows.forEach((row, rowIndex) => {
    //eslint-disable-next-line
    const [toHeader, ...restHeaders] = headers;
    const [to, ...rest] = row;
    if (rowIndex === 0) step = parseInt(to);
    rest.forEach((rule: string | undefined, index: number) => {
      if (rule === undefined) return;
      const from = parseInt(to) - step;
      rules = [
        ...rules,
        {
          description: `From ${from} to ${parseInt(to)}`,
          customSearchExpressions: [
            {
              expressionType: 'TSQL',
              expressionRole: 'FilterExpression',
              script: `SqFtLot BETWEEN ${from} AND ${to}`,
              columnName: restHeaders[index],
              expressionExtensions: {
                scheduleMin: from,
                scheduleMax: parseInt(to),
                traceMessage: `Waterfront: from ${from} to ${to} (Add)`,
                StepValue: rule,
                Value: rule,
              },
            },
            {
              expressionType: 'TSQL',
              expressionRole: 'CalculatedColumn',
              script: `((WftFoot - ${from}) * (${to * 1000} - ${
                from * 1000
              }) / (${to} - ${from})) + ${from * 1000}`,
              columnName: restHeaders[index],
            },
          ],
        },
      ];
    });
  });
  const data = {
    datasetId: datasetId,
    postProcessName: 'Waterfront schedule',
    postProcessRole: 'WaterfrontSchedule',
    priority: 2200,
    postProcessDefinition: 'Waterfront schedule No',
    PostProcessSubType: 'UniqueConditionSelector',
    exceptionPostProcessRules: rules,
  };
  return saveExceptionPostProcess(data);
};

type RuleType = string | undefined;

export const runNonWaterFrontFromExcel = async (
  excelData: SheetType | undefined,
  datasetId: string
): Promise<IdOnly | null> => {
  if (!excelData) return null;
  const { rows, headers } = excelData;
  //eslint-disable-next-line
  let rules: any[] = [];
  let step = 0;

  const getScript = (
    colName: string,
    from: number,
    to: string,
    rule: string
  ): string => {
    if (colName.toLowerCase() === 'baseline' || colName === 'LandValue')
      return `((SqFtLot - ${from}) * (${parseInt(to) * 1000} - ${
        from * 1000
      }) / (${to} - ${from})) + ${from * 1000}`;
    return rule;
  };

  const getScriptByColName = (colName: string): string => {
    if (colName.toLowerCase() !== 'baseline' || colName === 'LandValue')
      return '';
    return `AND ${colName}`;
  };

  rows.forEach((row, index) => {
    //eslint-disable-next-line
    const [toHeader, ...restHeaders] = headers;
    const [to, ...rest] = row;
    if (index === 0) step = parseInt(to);
    rest
      .filter((rule: RuleType) => rule)
      .reverse()
      .forEach((rule: string, index: number) => {
        const from = parseInt(to) - step;
        rules = [
          ...rules,
          {
            description: `From ${from} to ${parseInt(to)}`,
            customSearchExpressions: [
              {
                expressionType: 'TSQL',
                expressionRole: 'FilterExpression',
                script: `SqFtLot BETWEEN ${from} AND ${to} ${getScriptByColName(
                  restHeaders[index]
                )}`,
                columnName: restHeaders[index],
                expressionExtensions: {
                  scheduleMin: from,
                  scheduleMax: parseInt(to),
                  traceMessage: `LandSchedule: ${from} AND ${to}`,
                  Value: rule,
                },
              },
              {
                expressionType: 'TSQL',
                expressionRole: 'CalculatedColumn',
                script: getScript(restHeaders[index], from, to, rule),
                columnName: restHeaders[index],
              },
            ],
          },
        ];
      });
  });
  const data = {
    datasetId: datasetId,
    postProcessName: 'Nonwaterfront schedule',
    postProcessRole: 'LandSchedule',
    priority: 2100,
    postProcessDefinition: 'Nonwaterfront schedule',
    PostProcessSubType: 'UniqueConditionSelector',
    traceEnabledFields: ['LandValue'],
    exceptionPostProcessRules: rules,
  };
  return saveExceptionPostProcess(data);
};

export const runNonWaterfront = (
  param: WaterFrontType,
  exceptionId?: number
): Promise<IdOnly | null> => {
  const step = param.step;
  const data = {
    datasetId: param.datasetId,
    postProcessName: 'Nonwaterfront schedule',
    postProcessRole: 'LandSchedule',
    priority: 2100,
    postProcessDefinition: 'Nonwaterfront schedule',
    PostProcessSubType: 'UniqueConditionSelector',
    traceEnabledFields: ['LandValue'],
    exceptionPostProcessRules:
      param.rules.map((rule, index) => {
        const from = index === 0 ? parseInt(rule.to) : parseInt(rule.to) - step;
        const to = index === 0 ? parseInt(rule.to) + step : parseInt(rule.to);
        return {
          description: `From ${from} to ${to}`,
          customSearchExpressions: [
            {
              expressionType: 'TSQL',
              expressionRole: 'FilterExpression',
              script: `SqFtLot BETWEEN ${from} AND ${to}`,
              columnName: 'LandValue',
              expressionExtensions: {
                scheduleMin: from,
                scheduleMax: to,
                traceMessage: `LandSchedule: ${from} AND ${to}`,
              },
            },
            {
              expressionType: 'TSQL',
              expressionRole: 'CalculatedColumn',
              script: `((SqFtLot - ${from}) * (${to * 10} - ${
                from * 10
              }) / (${to} - ${from})) + ${from * 10}`,
              columnName: 'LandValue',
            },
          ],
        };
      }) || [],
  };

  const payload = {
    ...data,
    exceptionPostProcessRules: [...data.exceptionPostProcessRules],
  };

  return saveExceptionPostProcess(payload);
};

//
export const runWaterfront = (
  param: WaterFrontType,
  yes = false,
  id?: number
): Promise<IdOnly | null> => {
  const step = param.step;
  const rules = param.rules.map((rule, index) => {
    const from = index === 0 ? parseInt(rule.to) : parseInt(rule.to) - step;
    const to = index === 0 ? parseInt(rule.to) + step : parseInt(rule.to);
    return {
      description: `From ${from} to ${parseInt(rule.to)}`,
      customSearchExpressions: [
        {
          expressionType: 'TSQL',
          expressionRole: 'FilterExpression',
          script: `SqFtLot BETWEEN ${from} AND ${to}`,
          columnName: 'WaterfrontValue',
          expressionExtensions: {
            scheduleMin: from,
            scheduleMax: to,
            StepValue: step,
            traceMessage: `Waterfront: from ${from} to ${to} (Add)`,
          },
        },
        {
          expressionType: 'TSQL',
          expressionRole: 'CalculatedColumn',
          script: `((WftFoot - ${from}) * (${to * 1000} - ${
            from * 1000
          }) / (${to} - ${from})) + ${from * 1000}`,
          columnName: 'WaterfrontValue',
        },
      ],
    };
  });

  const data = {
    datasetId: param.datasetId,
    postProcessName: 'Waterfront schedule',
    postProcessRole: 'WaterfrontSchedule',
    priority: 2200,
    postProcessDefinition: 'Waterfront schedule No',
    PostProcessSubType: 'UniqueConditionSelector',
    traceEnabledFields: ['WaterfrontValue'],
    exceptionPostProcessRules: rules,
  };

  const payload = {
    ...data,
    exceptionPostProcessRules: [...data.exceptionPostProcessRules],
  };

  return saveExceptionPostProcess(payload);
};

//Postive Adjustment services
export const runAdjustment = async (
  param: AdjustmentParam,
  postProcessId: number | undefined
): Promise<IdOnly | null | void> => {

  const data = {
    datasetId: param.datasetId,
    postProcessName: 'Adjustments',
    postProcessRole: 'LandAdjustment',
    priority: 2400,
    postProcessDefinition: 'Adjustments',
    PostProcessSubType: 'MultipleConditionModifier',
    exceptionPostProcessRules:
      param.rules.map((rule: LandVariableGridRowData) => {
        return {
          description: rule.description,
          customSearchExpressions: [
            {
              expressionType: 'TSQL',
              expressionRole: 'FilterExpression',
              script: '0 = 0',
              columnName: process.env.REACT_APP_NONWATERFRONT_LAND_VALUE || '',
              expressionExtensions: {
                ...rule,
              },
            },
            {
              expressionType: 'TSQL',
              expressionRole: 'CalculatedColumn',
              script: '0',
              columnName: process.env.REACT_APP_NONWATERFRONT_LAND_VALUE || '',
            },
          ],
        };
      }) || [],
  };

  if (data.exceptionPostProcessRules.length) {
    return saveExceptionPostProcess(data);
  }
  if (postProcessId) {
    return deleteDatasetPostProcess(`${postProcessId}`);
  }
  return null;
};
