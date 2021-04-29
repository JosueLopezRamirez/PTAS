// typings.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { TreeViewRow } from "@ptas/react-ui-library";
import { UserInfo } from "services/map.typings";

export interface CustomSearchParameters {
  customSearchParameters: CustomSearchParameter[];
}

interface CustomSearchParameter {
  id: number;
  name: string;
  description: string;
  type: string;
  typeLength: number;
  defaultValue: string;
  parameterRangeType: string;
  displayName: string | null;
  hasEditLookupExpression: boolean;
  forceEditLookupExpression: boolean;
  isRequired: string;
  parameterGroupName: string;
  lookupValues: string | null;
  expression: string | null;
  allowMultipleSelection: boolean;
}

interface ParameterValue {
  id: number | string;
  value: number | string | Date;
}

export interface AreaData {
  customSearchDefinitionId: number;
  parameterValues: ParameterValue[];
}

interface DataSetArea {
  dataset: AreaData;
  datasetRole: "Population" | "Sales";
}

interface DataSetTree {
  datasetId: string;
  datasetRole: "Population" | "Sales";
}

export interface ModelDataset {
  datasetId?: string;
  dataset?: AreaData;
  datasetRole: "Population" | "Sales";
}

export interface ProjectType {
  projectTypeId: number;
  projectTypeName: string;
  customSearchDefinitionId: number;
  projectTypeCustomSearchDefinitions: SearchDefinition[];
}

interface SearchDefinition {
  projectTypeId: number;
  datasetRole: string;
  customSearchDefinitionId: number;
}

export interface ProjectTypes {
  projectTypes: ProjectType[];
}

export type ProjectDataSets = ModelDataset[];

export interface SaveModel {
  projectName: string;
  comments: string;
  assessmentYear: number;
  assessmentDateFrom: Date;
  assessmentDateTo: Date;
  selectedAreas: number[];
  projectTypeName: string;
  projectDatasets: ProjectDataSets;
  userId: string;
}

export interface Area {
  Value: number;
  Key: string;
}

export interface Areas {
  results: Area[];
}

// For Treeview
interface Dataset extends TreeViewRow {
  datasetId: string;
  customSearchDefinitionId: number;
  userId: string;
  parentFolderId: number;
  folderPath: string;
  datasetName: string;
  parameterValues: ParameterValue[];
  generatedTableName: string;
  totalRows: number;
  generateSchemaElapsedMs: number;
  executeStoreProcedureElapsedMs: number;
  isLocked: boolean;
  createdBy: string;
  lastModifiedBy: string;
  createdTimestamp: Date;
  lastModifiedTimestamp: Date;
  lastExecutionTimestamp?: Date;
  datasetClientState: string;
  comments: string;
  dependencies?: string;
}

export interface TreeData extends TreeViewRow {
  folderPath: string;
  dataSets: number | null;
  name: string;
  usingSearch: string;
  lastModifiedBy: string;
  isLocked: boolean;
  comments: string;
  isEditable?: boolean;
  dataSetId?: string | number;
  linkTo?: string;
}

export interface TreeDataset {
  datasets: Dataset[];
  usersDetails: UserInfo[];
}
