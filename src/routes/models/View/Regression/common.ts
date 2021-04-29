import {
  IdOnly,
  RegressionType,
  RScriptModelItem,
} from './../../../../services/map.typings';

// common.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import {
  Expression,
  RegressionVar,
  GetOneProjectResult,
  Project,
  PostProcess,
  ExpressionsResult,
  GenericGridRowData,
  RScriptModelType,
  ParamExpression,
  SearchParameters,
} from 'services/map.typings';
import { VariableValue, FormValues } from 'components/FormBuilder/FormBuilder';
import { AxiosLoader } from 'services/AxiosLoader';

import moment from 'moment';

//eslint-disable-next-line
export const LoadProject = async (
  id: string,
  all = false
  // eslint-disable-next-line
): Promise<Project | any | null> => {
  const data = await LoadItem<GetOneProjectResult>(
    `CustomSearches/GetUserProject/${id}`,
    {
      includeDependencies: true,
    }
  );
  if (all) {
    return data || null;
  }
  return data?.project || null;
};

export const LoadPostProcess = async (
  regressionId: string
): Promise<PostProcess | null> => {
  const data = await LoadItem<{ postProcess: PostProcess }>(
    `CustomSearches/GetDatasetPostProcess/${regressionId}`,
    {
      includeDependencies: true,
    }
  );
  return data?.postProcess || null;
};

const LoadItem = async <T1>(
  url: string,
  callParams: { [index: string]: unknown }
): Promise<T1 | null> => {
  const loader = new AxiosLoader<T1, {}>();
  const data = await loader.GetInfo(url, callParams);
  return data || null;
};

export const getRScriptExpressions = async (
  id: number
): Promise<Expression[]> => {
  const item = await LoadItem<ExpressionsResult>(
    `CustomSearches/GetRScriptModelDefaultExpressions/${id}`,
    {}
  );
  const expressions = item?.expressions ?? [];
  return expressions;
};

export const getRScriptModels = async (): Promise<RScriptModelItem[]> => {
  //eslint-disable-next-line
  const item = await LoadItem<RScriptModelType>(
    `CustomSearches/GetRScriptModels/`,
    {}
  );
  const rscriptModels = item?.rscriptModels ?? [];
  return rscriptModels;
};

//eslint-disable-next-line
export const getRScriptModel = async (id: number): Promise<any> => {
  //eslint-disable-next-line
  const item = await LoadItem<any>(`CustomSearches/GetRScriptModel/${id}`, {});
  const rscriptModel = item?.rscriptModel ?? {};
  return rscriptModel;
};

export const getExpressions = (
  expressions: Expression[],
  role: string
): VariableValue[] =>
  expressions
    .filter((exp) => exp.expressionRole === role)
    .map(
      (exp): RegressionVar => ({
        transformation: exp.script ?? '',
        name: exp.columnName,
        category: exp.category ?? '',
        note: exp.note ?? '',
      })
    )
    .map((itm: {}) => ({ ...itm } as VariableValue));

export const getVars = (
  newFormData: FormValues,
  varNames: string
): RegressionVar[] =>
  (newFormData[varNames] as VariableValue[]).map(
    (itm) =>
      ({
        ...{ name: '', transformation: '', category: '', note: '' },
        ...itm,
      } as RegressionVar)
  );

export const GetPriorVars = (newFormData: FormValues): Expression[] =>
  getVars(newFormData, 'priorvars').map((pv) => ({
    expressionType: 'TSQL',
    expressionRole:
      'CalculatedColumnPreCommit' +
      (pv.name === 'AVRatio'
        ? '_Dependent'
        : pv.name === 'SaleDay'
        ? '_Independent'
        : ''),
    script: pv.transformation,
    columnName: pv.name,
    note: pv.note,
    category: pv.category,
  }));

export const GetPostVars = (newFormData: FormValues): Expression[] => [
  ...getVars(newFormData, 'postvars').map((pv) => ({
    expressionType: 'TSQL',
    expressionRole: 'CalculatedColumnPostCommit',
    script: pv.transformation,
    columnName: pv.name,
    note: pv.note,
    category: pv.category,
  })),
  {
    expressionType: 'RScript',
    expressionRole: 'RScriptParameter',
    script: 'SaleDay',
    columnName: 'IndependentVariable',
  },
  {
    expressionType: 'RScript',
    expressionRole: 'RScriptParameter',
    script: 'AVRatio',
    columnName: 'DependentVariable',
  },
];

export const getDependentVars = (
  rowData: GenericGridRowData[]
): Expression[] => {
  return rowData
    .filter((rd: GenericGridRowData) => rd.type === 'Dependent')
    .map<Expression>((rd: GenericGridRowData) => {
      return {
        expressionType: 'TSQL',
        expressionRole: `CalculatedColumnPreCommit`,
        script: `${rd?.transformation}`,
        columnName: rd?.name,
        note: rd?.note,
        category: rd?.category,
      };
    });
};

export const getIndependentVars = (
  rowData: GenericGridRowData[]
): Expression[] => {
  return rowData
    .filter((rd: GenericGridRowData) => rd.type === 'Independent')
    .map<Expression>((rd: GenericGridRowData) => {
      return {
        expressionType: 'TSQL',
        expressionRole: 'CalculatedColumnPreCommit',
        script: `${rd?.transformation}`,
        columnName: rd?.name,
        note: rd?.note,
        category: rd?.category,
      };
    });
};

export const getCalculatedVars = (
  rowData: GenericGridRowData[]
): Expression[] => {
  return rowData
    .filter((rd: GenericGridRowData) => rd.type === 'Calculated')
    .map<Expression>((rd: GenericGridRowData) => {
      return {
        expressionType: 'TSQL',
        expressionRole: `${rd?.expressionRole || 'CalculatedColumnPostCommit'}`,
        script: `${rd?.transformation}`,
        columnName: rd?.name,
        note: rd?.note,
        category: rd?.category,
      };
    });
};

export const getHidenVars = (
  dependent: Expression[],
  independent: Expression[]
): Expression[] => {
  const dependentVars: unknown[] = dependent.map((rd, index) => {
    return {
      expressionType: 'RScript',
      expressionRole: 'CalculatedColumnPreCommit_Dependent',
      script: `${rd?.columnName}`,
      columnName: `DependentVariable${index === 0 ? '' : index}`,
      note: null,
      category: null,
    };
  });

  const independentVars: unknown[] = independent.map((rd, index) => {
    return {
      expressionType: 'RScript',
      expressionRole: 'CalculatedColumnPreCommit_Independent',
      script: `${rd?.columnName}`,
      columnName: `IndependentVariable${index === 0 ? '' : index}`,
      note: null,
      category: null,
    };
  });

  return [...dependentVars, ...independentVars] as Expression[];
};

export const getExpressionVars = (
  rowData: GenericGridRowData[]
): Expression[] => {
  return rowData
    .filter((rd: GenericGridRowData) => rd.type === 'Expression')
    .map<Expression>((rd: GenericGridRowData) => {
      return {
        expressionType: rd?.expressionType || '',
        expressionRole: rd?.expressionRole || '',
        script: rd?.transformation || '',
        columnName: rd?.name,
        note: rd?.note,
        category: rd?.category,
      };
    });
};

export const reformatDate = (v: Date | string | undefined): string => {
  if (!v) return 'NA';
  return moment(v).format('MM-DD-YYYY');
};

interface MultipleExpressionsType {
  rowData?: GenericGridRowData[];
  expressionPayload?: GenericGridRowData[];
}

export const getMultipleCustomExpressions = (
  expressions: Expression[]
): MultipleExpressionsType => {
  const dependent = expressions.filter(
    (e) => e.expressionRole === 'CalculatedColumnPreCommit_Dependent'
  );
  const independent = expressions.filter(
    (e) => e.expressionRole === 'CalculatedColumnPreCommit_Independent'
  );
  const calculated = expressions.filter(
    (e) => e.expressionRole === 'CalculatedColumn'
  );
  const rowData = expressions
    .filter(
      (e) =>
        ![
          'CalculatedColumnPreCommit_Dependent',
          'CalculatedColumnPreCommit_Independent',
          'CalculatedColumn',
          'DynamicEvaluator',
        ].includes(e.expressionRole)
    )
    .map<GenericGridRowData>((e) => {
      return {
        type: getType(e, independent, dependent),
        expressionRole: e.expressionRole,
        expressionType: e.expressionType,
        name: e.columnName,
        transformation: e.script,
        category: e.category,
        note: e.note,
        isNewRow: false,
      };
    });

  const expressionPayload = [
    ...dependent,
    ...independent,
    ...calculated,
  ].map<GenericGridRowData>((e) => {
    return {
      type: 'Expression',
      expressionRole: e.expressionRole,
      expressionType: e.expressionType,
      name: e.columnName,
      transformation: e.script,
      category: e.category,
      note: e.note,
      // isNewRow: false,
    };
  });
  return { rowData, expressionPayload };
};

const getType = (
  e: Expression,
  independent: Expression[],
  dependent: Expression[]
): string => {
  if (
    independent.some(
      (d) =>
        d.script === e.columnName &&
        e.expressionRole === 'CalculatedColumnPreCommit'
    )
  ) {
    return 'Independent';
  }

  if (
    dependent.some(
      (d) =>
        d.script === e.columnName &&
        e.expressionRole === 'CalculatedColumnPreCommit'
    )
  ) {
    return 'Dependent';
  }
  if (e.expressionRole === 'CalculatedColumnPostCommit') {
    return 'Calculated';
  }
  return 'Calculated';
};

export const fetchMultipleRegressionsType = async (): Promise<RegressionType | null> => {
  const regressionTypes = await getRScriptModels();
  if (regressionTypes?.length) {
    return regressionTypes
      .filter(
        (e: RScriptModelItem) => e.rscriptModelRole === 'MultipleRegression'
      )
      .map<RegressionType>((e: RScriptModelItem) => {
        return {
          value: e.rscriptModelId,
          label: e.rscriptModelName,
          resultDefinitions: e.resultsDefinitions,
        };
      })[0];
  }
  return null;
};

interface MultipleRegressionDataType {
  data: MultipleExpressionsType | null;
  regression?: number;
}

export const fetchMultipleRegressionExpressions = async (): Promise<
  MultipleRegressionDataType | undefined
> => {
  const type = await fetchMultipleRegressionsType();
  if (type?.value) {
    const expressions = await getRScriptExpressions(type?.value);
    let data = null;
    if (expressions?.length) {
      data = getMultipleCustomExpressions(expressions);
    }
    return { data: data, regression: type.value };
  }
  return undefined;
};

export const runImportRScript = (payload: {}): Promise<IdOnly | null> => {
  const al1 = new AxiosLoader<IdOnly, {}>();
  return al1.PutInfo('CustomSearches/ImportRScriptPostProcess', payload, {});
};

export const getTimeTrendCustomSearchExpressions = (
  gridData: GenericGridRowData[],
  params: SearchParameters[] | undefined,
  expressionPayload: GenericGridRowData[]
): ParamExpression[] => {
  const priorVars = getDependentVars(gridData);
  const postVars = getIndependentVars(gridData);
  const calculatedVars = getCalculatedVars(gridData);
  // const expressionVars = getHidenVars(priorVars, postVars);
  const expressionVars = getExpressionVars(expressionPayload);

  let parameters: ParamExpression[] = [];
  if (params) {
    //eslint-disable-next-line
    parameters = params?.map<ParamExpression>((param: any) => {
      return {
        expressionType: 'RScript',
        expressionRole: 'RScriptParameter',
        script: param.value,
        columnName: param.name,
      };
    });
  }

  const customSearchExpressions = [
    ...priorVars,
    ...postVars,
    ...calculatedVars,
    ...expressionVars,
    ...parameters,
  ];

  return customSearchExpressions;
};
