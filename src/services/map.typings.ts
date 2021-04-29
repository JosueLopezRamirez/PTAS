// map.typings.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { AxiosRequestConfig } from 'axios';

export interface IdOnly {
  id: string;
}

export interface ParamExpression {
  expressionType: string;
  expressionRole: string;
  script?: string;
  columnName: string;
}

export interface ImportUserProjectResponse {
  projectId: number;
  queuedDatasets: string[];
}

interface DataMethods {
  refreshClicked?: () => Promise<void>;
  saveToFileClicked?: () => Promise<void>;
  commitClicked?: () => Promise<void>;
  uploadFile?: () => void;
}

export interface GridDataMethods {
  methods: DataMethods;
}

export interface IdDescription extends IdOnly {
  description: string;
}
export interface IdNameDescription extends IdDescription {
  name: string;
}

export type CustomSearchCategory = IdNameDescription;

export interface SearchParameters {
  id: number;
  name: string;
  value: unknown;
}

export interface RScriptModelType {
  rscriptModels: RScriptModelItem[];
}
export interface RScriptModelItem {
  datasetPostProcesses: unknown;
  description: string;
  expressions: unknown;
  parameters: unknown;
  resultsDefinitions: ResultDefinitionType[];
  rscript: unknown;
  rscriptFileName: string;
  rscriptFolderName: string;
  rscriptModelId: number;
  rscriptModelName: string;
  rscriptModelRole: string;
  rscriptModelTemplate: unknown;
}

export interface SearchParam {
  parameters: SearchParameters[];
  folderPath: string | null;
  datasetName: string | null;
  comments: string;
}

export interface SearchResults {
  datasetId: string;
}

export interface CustomSearchCategoryResults {
  customSearchCategories: CustomSearchCategory[];
}

export type CustomSearch = IdNameDescription;

export interface CustomSearchResults {
  customSearches: CustomSearch[];
}

export interface GenericGetter<T> {
  (
    relativeAddress: string,
    callParams: { [index: string]: unknown },
    requestParams?: { [index: string]: unknown }
  ): Promise<T | null>;
}

export interface GenericFileSaver {
  (relativeAddress: string, file: File): Promise<IdOnly>;
}

export interface GenericPutter<Returned, Payload> {
  (
    relativeAddress: string,
    payload: Payload,
    callParams: { [index: string]: unknown },
    customHeaders?: { [index: string]: unknown },
    options?: AxiosRequestConfig
  ): Promise<Returned | null>;
}

interface ExpressionExtensions {
  Style: string | null;
  LegendPosition: string | null;
  AutoBins: boolean | null;
  UseDiscreteBins: boolean | null;
  NumBins: number | null;
}

export interface ChartExpression {
  expressionRole: string;
  script: string;
  columnName: string;
  expressionGroup: string;
  exceptionPostProcessRuleId?: string;
  expressionExtensions: ExpressionExtensions;
}

export interface InteractiveChart {
  interactiveChartId: number;
  datasetId: string;
  chartType: string;
  chartTitle: string;
  createdBy: string;
  lastModifiedBy: string;
  createdTimestamp: Date;
  lastModifiedTimestamp: Date;
  chartExpressions: ChartExpression[];
  chartExtensions: { [id: string]: string } | null;
}

interface DatasetDependencies {
  postProcesses: PostProcess[];
  interactiveCharts: InteractiveChart[];
}

export interface CustomSearchParameter {
  id: number;
  name: string;
  description: string;
  type: string;
  typeLength: number;
  defaultValue: string;
  isRequired: boolean;
  parameterRangeType: string;
  parameterGroupName: string;
  hasEditLookupExpression: boolean;
  forceEditLookupExpression: boolean;
  lookupValues?: { Value: string; Key: string }[];
  expressions?: Expression[];
}

// // export interface ParameterType {
// //   id: number;
// //   name: string;
// //   value: string;
// // }

// // export interface RootObject {
// //   customSearchParameters: CustomSearchParameter[];
// // }

export interface Dataset {
  datasetId: string;
  customSearchDefinitionId: number;
  userId: string;
  parentFolderId: number;
  folderPath: string;
  datasetName: string;
  parameterValues: SearchParameters[];
  generatedTableName: string;
  totalRows: number;
  generateSchemaElapsedMs: number;
  executeStoreProcedureElapsedMs: number;
  isLocked: boolean;
  createdBy: string;
  lastModifiedBy: string;
  createdTimestamp: Date;
  lastModifiedTimestamp: Date;
  lastExecutionTimestamp?: string;
  datasetClientState?: string;
  datasetState: string;
  datasetPostProcessState: string;
  dependencies: DatasetDependencies;
  datasetRole: string;
  comments: string;
}

interface DependenciesType {
  interactiveCharts: unknown;
  postProcesses: PostProcess[];
}

export interface ProjectDataset {
  userProjectId: number;
  datasetId: string;
  dataset: Dataset;
  ownsDataset: boolean;
  datasetRole: string;
  datasetPostProcessState?: string;
  dependencies?: DependenciesType;
}

export interface Project {
  userProjectId: number;
  versionNumber: number;
  projectName: string;
  comments: string;
  isLocked: boolean;
  assessmentYear: number | null;
  assessmentDateFrom: Date;
  assessmentDateTo: Date;
  selectedAreas: string[];
  rootVersionUserProjectId?: string | number;
  userId: string;
  projectType: string | null;
  projectTypeName?: string;
  customSearchDefinitionId: number;
  createdBy: string;
  lastModifiedBy: string;
  createdTimestamp: Date;
  lastModifiedTimestamp: Date;
  projectDatasets: ProjectDataset[];
  linkTo?: string;
}

export interface GetProjectsResult {
  projects: Project[];
  usersDetails: UserDetailsType[];
}

export interface UserDetailsType {
  email: string;
  fullName: string;
  id: string;
  roles: Role[];
  teams: Team[];
}

export interface GetOneProjectResult {
  project: Project | null;
  usersDetails: UserDetailsType[];
}

export enum RegressionRoleType {
  TimeTrendRegression = 'TimeTrendRegression',
  MultipleRegression = 'MultipleRegression',
  AppraiserRatiosReport = 'AppraiserRatiosReport',
  LandRegression = 'LandRegression',
}

export enum ExpressionType {
  LinearRegression = 'Linear Regression',
  Spline3 = 'Spline 3-Segments Regression',
}

export interface Expression {
  customSearchExpressionId?: number;
  datasetId?: string;
  customSearchColumnDefinitionId?: string;
  customSearchParameterId?: string;
  datasetPostProcessId?: string;
  datasetChartId?: string;
  projectTypeId?: string;
  rScriptModelId?: number;
  ownerType?: string;
  expressionType: string;
  expressionRole: string;
  script: string;
  columnName: string;
  category?: string;
  note?: string;
  exceptionPostProcessRuleId?: string;
}

export interface PostProcess {
  datasetPostProcessId: number;
  datasetId: string;
  priority: number;
  isDirty: boolean;
  postProcessType: string;
  postProcessSubType: string;
  rscriptModelId?: string;
  postProcessDefinition: string;
  postProcessName?: string;
  resultPayload: string;
  createdBy: string;
  lastModifiedBy: string;
  createdTimestamp: Date;
  lastModifiedTimestamp: Date;
  lastExecutionTimestamp?: string;
  customSearchExpressions: Expression[];
  exceptionPostProcessRules?: string;
  postProcessRole?: string;
}

// // export interface PostProcessResult {
// //   postProcesses: PostProcess[];
// // }

export interface GetExportPostProcessResponse {
  postProcess: PostProcess;
  UsersDetails: UserInfo[];
}

interface RegressionInfo {
  name: string;
  Intercept: number;
  Coefficient: number;
}

export interface FileResult {
  Title?: string;
  Type: string;
  FileName: string;
  Description: string;
  regressionDetails?: RegressionDetails;
}

export interface RegressionDetails {
  Status: string;
  Result: RegressionInfo;
  FileResults: FileResult[];
  PostProcess: PostProcess;
  Reason?: string;
}

export interface RegressionResults {
  name: string;
  Coefficient: number;
  Intercept: number;
}

export interface RegressionGoodnessOfFit {
  name: string;
  AdjustedRSquared: number;
  RSquared: number;
}

interface FileResultType {
  Title: string;
  Type: string;
  FileName: string;
  Description: string;
}

export interface ResultPayload {
  Exception?: string;
  Reason?: string;
  Status?: string;
  Results?: [RegressionResults, RegressionGoodnessOfFit];
  FileResults?: FileResultType[];
}

export interface InteractiveChartResponseItemType {
  independentVariable: string;
  dependentVariable: string | null;
  values: IdValue[];
}

export interface InteractiveChartDataInfoType {
  chartTitle: string | null;
  chartType: string | null;
  continuationToken: string | null;
  chartExtensions: { [id: string]: string } | null;
  results?: InteractiveChartResponseItemType[];
}

// // export interface InteractiveChartResponseType {
// //   data: InteractiveChartDataInfoType;
// // }

// // export interface InteractiveChartDataType {
// //   independentVariableName: string;
// //   independentValue: string | number;
// //   dependentVariableName: string | number;
// //   dependentValue: string | number;
// //   dependentVariableValueX?: string | number;
// //   dependentVariableValueY?: string | number;
// // }

// // export interface InteractiveChartDataScatterType {
// //   independentVariableName: string | number;
// //   dependentVariableNameX: string | number;
// //   dependentVariableNameY: string | number;
// //   dependentVariableValueX: string | number;
// //   dependentVariableValueY: string | number;
// // }

interface LegendType {
  orientation: string;
  x: number;
  y: number;
}

// // export interface LayoutType {
// //   autosize: boolean;
// //   height: number;
// //   legend: LegendType;
// //   showlegend: boolean;
// //   title: { text: string };
// //   xaxis?: {
// //     title?: string | number;
// //     range?: [number, number];
// //     autorange?: boolean;
// //     showgrid?: boolean;
// //     zeroline?: boolean;
// //     showline?: boolean;
// //   };
// //   yaxis?: {
// //     title?: string | number;
// //     range?: [number, number];
// //     autorange?: boolean;
// //     showgrid?: boolean;
// //     zeroline?: boolean;
// //     showline?: boolean;
// //   };
// //   barmode?: string;
// // }

// // export interface DataChartType {
// //   x?: (string | number)[];
// //   y?: (string | number)[];
// //   mode?: string;
// //   type?: string;
// //   name?: string;
// //   text?: string[];
// //   marker?: { size: number };
// //   values?: (string | number)[];
// //   labels?: (string | number)[];
// // }

// // export interface SimpleGridType {
// //   width: string;
// //   height: string;
// //   rowData: unknown[];
// //   columnsDef: AgGridColumnProps[];
// // }

interface SignalRParameterType {
  Id: number;
  Name: string;
  Value: string;
}

interface SignalRPayload {
  ApplyRowFilterFromSourceDataset: boolean;
  ApplyUserSelectionFromSourceDataset: boolean;
  CustomSearchDefinitionId: number;
  DatasetId: string;
  ExecutionMode: number;
  Parameters: SignalRParameterType[];
  SourceDatasetId: string;
}

export interface SignalRResponseType {
  jobType: string;
  jobId: number;
  jobStatus: string;
  payload: SignalRPayload;
}

export interface ViewChartServiceMethodsType {
  getInteractiveChartDataByNumber: (
    chartNumber: string,
    isPlot: boolean
  ) => Promise<InteractiveChartDataInfoType | null>;
  getInteractiveChartDataByNumberNext: (
    chartNumber: string,
    continuationToken: string | null,
    isPlot: boolean
  ) => Promise<InteractiveChartDataInfoType | null>;
  getInteractiveChartInfo: (
    chartId: string
  ) => Promise<InteractiveChart | null>;
}

export interface ViewChartServiceLinkType {
  getInteractiveChartDataByNumber: string;
  getInteractiveChartDataByNumberNext: string;
}

export interface SaveCalculatedColumnType {
  columnName: string;
  script: string;
}

// // export interface ChildRefRegressionType {
// //   runRegression: () => void;
// // }

export interface ResultDefinitionType {
  defaultValue: string;
  description: string;
  expressions: unknown;
  forceEditLookupExpression: boolean;
  hasEditLookupExpression: boolean;
  id: number;
  isRequired: boolean;
  lookupValues: unknown;
  name: string;
  parameterGroupName: unknown;
  parameterRangeType: unknown;
  type: string;
  typeLength: number;
}

export interface GenericDropdownType {
  label: string;
  value: string;
}

export interface RegressionType {
  value: number;
  label: string;
  resultDefinitions?: ResultDefinitionType[];
}
export interface GenericGridRowData {
  expressionType?: string;
  type?: string;
  name: string;
  transformation?: string;
  category?: string;
  note?: string;
  isNewRow?: boolean;
  expressionRole?: string;
}

export interface LandGridData {
  from: string;
  to: string;
  default?: string;
  isNewRow?: boolean;
}

export interface GrossLandType {
  runGrossLand: () => void;
}

interface LandExpressionExtensionType {
  scheduleMin?: number;
  scheduleMax?: number;
  traceMessage?: string;
  StepValue?: number;
  Method?: string;
  addToNonWaterfrontValue?: boolean;
  AdjustmentType?: string;
  AdjustmentMethod?: string;
  IsPositiveAdjustment?: boolean;
  AdjustmentValue?: string;
  Value?: string;
  Note?: string;
}

export interface LandCustomSearchExpressions {
  expressionType: string;
  expressionRole: string;
  script: string;
  columnName: string;
  expressionExtensions?: LandExpressionExtensionType;
}

export interface LandExceptionRuleType {
  description: string;
  customSearchExpressions: LandCustomSearchExpressions[];
}

export interface LandExceptionTypes {
  datasetId: string;
  postProcessName: string;
  postProcessRole: string;
  priority: number;
  postProcessDefinition: string;
  PostProcessSubType: string;
  exceptionPostProcessRules: (LandExceptionRuleType | undefined)[];
}

export interface WaterFrontType {
  from: string | undefined;
  to: string | undefined;
  step: string | undefined;
}

export interface GetModalDataType {
  nonWaterFront: WaterFrontType;
  waterFront: WaterFrontType;
}

export interface LandVariableGridRowData {
  characteristicType: string;
  description: string;
  value: string;
  sqft: string;
  linearft: string;
  minadjmoney: string;
  maxadjmoney: string;
  minadjpercentaje: string;
  maxadjpercentaje: string;
}
export interface GrossLandGridRowData {
  method?: string;
  filter: string;
  expression?: string;
  note?: string;
  isNewRow?: boolean;
}

export interface GrossLandGridParam {
  rules: GrossLandGridRowData[];
  datasetId: string;
}

export interface AdjustmentParam {
  rules: LandVariableGridRowData[];
  datasetId: string;
}

export type IdValue = {
  [id: string]: unknown;
};

export interface JobStateType {
  jobId: number;
  from?: string;
}

export interface ReturnFromRevert {
  totalRows: number;
  totalUpdatedRows: number;
  totalExportedRows: number;
  updatedColumns?: unknown;
  results: IdValue[];
}

interface JobResultType {
  Status: string;
  Reason: string;
  Exception: string;
  AdditionalInfo?: unknown;
}

export interface GetJobStatusResponseResults {
  jobResult: JobResultType;
  jobStatus: string;
}

export interface DuplicateDatasetType {
  datasetId: string;
  jobId: number;
}

export interface AgGridServiceMethodsType {
  getDataSetUserState: (
    dataSetId: string
  ) => Promise<GetDataSetUserStateResponseResults | null>;
  getDataSetColumnEditLookupValues: (
    dataSetId: string,
    columnName: string
  ) => Promise<GetDataSetColumnEditLookupValuesResponseResults | null>;
  getDataSetData: (
    dataSetId: string,
    requestHeader: JSON,
    usePostProcess?: boolean,
    postProcessId?: string
  ) => Promise<GetDataSetDataResponseResults | null>;
  getDataSetStatus: (
    dataSetId: string,
    postProcessId: number
  ) => Promise<GetDataSetStatusResponseResults | null>;
  getJobStatus: (
    postProcessId: number
  ) => Promise<GetJobStatusResponseResults | null>;
  getDatasetColumns: (
    dataSetId: string,
    usePostProcess: boolean,
    postProcessId: number,
    includeDependencies?: boolean
  ) => Promise<GetDatasetColumnsResponseResults | null>;
  saveDataSetUserState: (
    dataSetId: string,
    requestHeader: SaveDataSetUserStateParamType
  ) => Promise<void>;
  saveUpdateDatasetData: (
    dataSetId: string,
    requestHeader: unknown[]
  ) => Promise<IdValue[]>;
  addCalculatedColumn: (
    dataSetId: string,
    ColumnName: string,
    Script: string
  ) => Promise<void>;
  deleteCalculatedColumn: (
    dataSetId: string,
    ColumnName: string
  ) => Promise<void>;
  saveCalculatedColumnsChanges: (
    dataSetId: string,
    columnData: SaveCalculatedColumnType[]
  ) => Promise<void>;
  revertAllChanges: (dataSetId: string) => Promise<void>;
  revertRows: (
    dataSetId: string,
    rowIds: number[]
  ) => Promise<ReturnFromRevert | null>;
  duplicateDataset: (
    dataSetId: string,
    userSelection?: boolean
  ) => Promise<DuplicateDatasetType | null>;
  deleteRows: (dataSetId: string) => Promise<IdOnly | null>;
}

export interface AgGridServiceLinkType {
  getDataSetUserState: string;
  getDataSetColumnEditLookupValues: string;
  getDatasetData: string;
  getDatasetColumns: string;
  saveDataSetUserState: string;
  saveUpdateDatasetData: string;
  getDatasetStatus: string;
  getJobStatus: string;
  revertRow: string;
  addCalculatedColumn: string;
  deleteCalculatedColumn: string;
  importCalculatedColumns: string;
  duplicateDataset: string;
  deleteRows: string;
}
interface PriorPostListType {
  priorList: string[];
  postList: string[];
}
export interface AgGridProps {
  id: string;
  width?: string;
  height?: string;
  postProcessId?: string;
  priorPostList?: PriorPostListType;
  getTotalRecords?: (x: number) => void;
  getTotalSelection?: (x: number) => void;
  dataSet?: Dataset | null | undefined;
  reloadGrid?: () => void;
  setEnabledRevert?: (value?: boolean) => void;
  gridVariableData?: GenericGridRowData[];
  getLoading?: (value: boolean) => void;
  showSpinner?: boolean;
  externalUse?: boolean;
}

export interface GenericPutter<Returned, Payload> {
  (
    relativeAddress: string,
    payload: Payload,
    callParams: { [index: string]: unknown }
  ): Promise<Returned | null>;
}

export interface CalculatedColExpression {
  script: string;
  note: string | null;
  expressionType: string;
}

export interface GetDatasetColumnsResponseResultsItem {
  customSearchDefinitionId: number;
  columnName: string;
  columnType: string;
  columnTypeLength: number;
  canBeUsedAsLookup: boolean;
  columnCategory: string;
  isEditable: boolean;
  forceEditLookupExpression: boolean;
  hasEditLookupExpression?: boolean;
  isIndexed: boolean;
  isCalculatedColumn: boolean;
  expressions: string | CalculatedColExpression[] | null;
}

export interface GetDatasetColumnsResponseResults {
  datasetColumns: GetDatasetColumnsResponseResultsItem[];
}

export interface GetDataSetColumnEditLookupValuesResponseResults {
  results: { Value: string | number; Key?: string }[];
}

export interface UpdatedColumnType {
  customSearchResultId: number;
  updatedColumns: string[];
}

export interface UpdatedColumnManualType {
  customSearchResultId: number;
  updatedColumn: string;
}

export interface GetDataSetDataResponseResults {
  results: JSON[];
  totalRows: number;
  updatedColumns: UpdatedColumnType[] | undefined;
  totalUpdatedRows?: number;
  totalExportedRows?: number;
}

export interface GetDataSetStatusResponseResults {
  datasetState: string;
  datasetPostProcessState: string;
}

interface ValueFormatterParams {
  value: unknown;
}

export interface GetDataUserStateResponseResultsItem {
  headerName?: string;
  field?: string;
  columnId: string;
  columnName?: string;
  isFilterAllowed?: boolean;
  isFilterActive?: boolean;
  getSort?: string;
  isRowGroupActive?: boolean;
  index: number;
  isVisible: boolean;
  pinned: string;
  filter?: string | JSON | boolean;
  sortModel?: JSON | null;
  groupModel?: JSON | null | undefined;
  sortable?: boolean;
  editable?: boolean;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  cellEditor?: JSON;
  cellRenderer?: JSON;
  cellEditorParams?: JSON;
  valueFormatter?: ((params: ValueFormatterParams) => string) | string;
}

export interface GetDataSetUserStateResponseResults {
  datasetUserState: GetDataUserStateResponseResultsItem[] | null | JSON;
}

export interface LookupItemsListType {
  [key: string]: { Value: string | number }[];
}

interface ParamsCustomTypeItem {
  isHighLight: boolean;
}

// // export interface ParamsCustomType {
// //   data: ParamsCustomTypeItem;
// // }

// // export interface ParamNumericKeyType {
// //   charPress: string;
// //   value: number | string | boolean;
// //   data: {
// //     RowNum: number;
// //     isHighLight: boolean;
// //   };
// //   node: {
// //     selected: string;
// //   };
// // }

export interface ExpressionsResult {
  expressions: Expression[];
}

export interface RegressionVar {
  transformation: string;
  name: string;
  category: string;
  note: string;
}

export interface AgGridChildType {
  saveConfigurationMethod: () => void;
  refreshMethod: () => void;
  saveDataMethod: () => void;
  purgeServerSideCache?: () => void;
  rebuildGrid: () => void;
  saveCalculatedCols: () => void;
  revertChanges: () => void;
}

// // export interface SortModelType {
// //   colId: string;
// //   sort: string;
// // }

export interface ColDefDatasetConfig {
  columnId: string;
  columnName: string;
  isFilterAllowed: boolean;
  isFilterActive: boolean;
  getSort: string;
  width: number;
  isRowGroupActive: boolean;
  index: number;
  isVisible: boolean;
  pinned: boolean;
  filter: object | null;
  sortModel: { colId: string; sort: string }[] | undefined;
  groupModel: object;
}

export interface SaveDataSetUserStateParamType {
  dataSourceConfig: {};
  aggridColumnsConfig: ColDefDatasetConfig[];
}

// // export interface SaveDataUpdateDataType {
// //   columnKey: string;
// //   rowKey: string | number;
// //   data: JSON;
// // }

// // export interface ChartsParamsType {
// //   width: string;
// //   height: string;
// //   chartTypeId: number;
// //   chartTypeSelected: number;
// //   onAddCountChart2: (x: number) => void;
// //   onAddCountChart9: (x: number) => void;
// // }

// // export interface ChartChildType {
// //   getChartCount: () => number;
// //   getChartCountScatter: () => number;
// // }

interface JobResult {
  Status: string;
}

export interface JobItem {
  jobStatus: string;
  jobResult: JobResult;
}

export interface DataSetInfo {
  dataset: Dataset;
  usersDetails: UserInfo[];
}

export interface SheetType {
  headers: string[];
  //eslint-disable-next-line
  rows: any[];
}
export interface ExcelToJson {
  Sheet1: SheetType;
}

export interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  roles: Role[];
  teams: Team[];
}

interface Role {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
}

export interface CreateDatasetFolderProps {
  folderPath: string;
  userId: string | undefined;
}

export interface Folder {
  folderId: number;
  parentFolderId: number | string | null;
  folderName: string;
  children: Folder[];
}

export interface Folders {
  folders: Folder[];
}

export interface FolderToRename {
  folderPath: string;
  newName: string;
}

export interface AssingData {
  folderPath: string;
}

export interface RenameData {
  newName: string;
  newComments: string;
}

export interface ImportRScriptPostProcessRequest {
  datasetId: string;
  postProcessName: string;
  postProcessRole: string;
  priority: number;
  rScriptModelId: number;
  postProcessDefinition: string;
  customSearchExpressions: CustomSearchExpressions[];
}

export interface CustomSearchExpressions {
  expressionType: string;
  expressionRole: string;
  script: string;
  columnName: string;
  note: string | null;
  category: string | null;
}

export interface ImportRScriptPostProcessResponse {
  id: string;
}

export interface ExecuteDatasetPostProcessRequest {
  id: number;
  name: string;
  value: string;
}

export interface ExcelSheetJson {
  [sheetName: string]: {
    headers?: string[];
    rows: string[][];
  };
}

export interface MetadataStoreItems {
  metadataStoreItems: MetadataStoreItem[];
}

interface MetadataStoreItem {
  metadataStoreItemId?: number;
  version: number;
  storeType: string;
  itemName: string;
  value: unknown;
}

export interface CommonValue {
  data: string[];
}

export interface GlobalVariablesData {
  data: GlobalVariables[];
}

export interface GlobalVariables {
  name: string;
  transformation: string;
  category: string;
  type: string;
  note: string;
}

export interface MetadataStoreItems {
  metadataStoreItems: MetadataStoreItem[];
}
