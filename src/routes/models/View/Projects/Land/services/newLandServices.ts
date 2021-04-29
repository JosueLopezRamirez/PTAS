import { ImportErrorMessageType } from './../../../../../../components/ErrorMessage/ErrorMessage';
import { ExpressionGridData } from './../ExpressionsGrid';
// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ColDef } from 'ag-grid-community';
import { LoadPostProcess } from './../../../Regression/common';
import { PostProcess, Project, LandGridData, LandVariableGridRowData } from 'services/map.typings';
import {
  buildNonWaterFrontGridData,
  buildPositiveAdjustment,
  buildWaterFrontGridData,
  buildNonWaterFrontExpressionGridData,
} from './methods';
import { AxiosLoader } from './../../../../../../services/AxiosLoader';
import { v4 as uuidv4 } from 'uuid';

interface PostProcessLandValues {
  mainPostProcess: PostProcess;
  regressionViewKey: string;
  nonWaterFront: PostProcess;
  adjustmentPostProcess: PostProcess;
  waterFront: PostProcess;
  disableApplyButton: boolean;
  
}

interface SetStatesTypes {
  setNonWaterfrontGridData: (data: LandGridData[]) => void;
  setNonWaterColDefs: (col: ColDef[]) => void;
  setWaterfrontGridData: (data: LandGridData[]) => void;
  setWaterColDefs: (col: ColDef[]) => void;
  setPositiveGridData: (data: LandVariableGridRowData[]) => void;
  setNonWaterFrontExpressionData: (data: ExpressionGridData[]) => void;
  setWaterFrontExpressionData: (data: ExpressionGridData[]) => void;
  setWaterFrontExpressionPostProcessId: (value: number) => void;
  setNonWaterFrontExpressionPostProcessId: (value: number) => void;
}

export interface UserInfo {
  email: string;
  fullName: string;
  id: string;
  roles: unknown;
  teams: unknown;
}

export interface ErrorMessageType {
  message: ImportErrorMessageType | undefined;
  section: string;
}

export const getBottom = (userInfo: UserInfo[] | undefined,project: Project): string => {
  if (!userInfo) return '';
  if (!project) return '';

  const oldestProjectDataset = project.projectDatasets.reduce((r, o) =>
    o.dataset.lastExecutionTimestamp &&
    r.dataset.lastExecutionTimestamp &&
    new Date(o.dataset.lastExecutionTimestamp) <
      new Date(r.dataset.lastExecutionTimestamp)
      ? o
      : r
  );

  const oldestDsDate = new Date(
    oldestProjectDataset.dataset.lastExecutionTimestamp + "Z" ||
      new Date().toLocaleString()
  ).toLocaleString();

  return `Last sync on ${oldestDsDate}, by ${
    userInfo.find((u) => u.id === project.userId)?.fullName ?? 'John Doe'
  }`;
};

export const runExecutePostProcess = (
  datasetId: string,
  postProcessId: number
): Promise<unknown> => {
  const ad2 = new AxiosLoader<unknown, unknown>();
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

export const getPostProcess = async (
  project: Project,
  {
    setNonWaterfrontGridData,
    setNonWaterColDefs,
    setWaterfrontGridData,
    setWaterColDefs,
    setPositiveGridData,
    setNonWaterFrontExpressionData,
    setWaterFrontExpressionData,
    setWaterFrontExpressionPostProcessId,
    setNonWaterFrontExpressionPostProcessId
  }: SetStatesTypes
): Promise<PostProcessLandValues> => {
  //eslint-disable-next-line
  let data: any = {};
  if (project) {
    const dataset = project?.projectDatasets?.find(
      (dataset) => dataset.datasetRole.toLowerCase() === 'sales'
    );
    const postProcesses = dataset?.dataset.dependencies.postProcesses?.filter(
      (pp) => pp.postProcessRole === 'LandSchedule'
    );
    const mainPostProcess = dataset?.dataset.dependencies.postProcesses?.find(
      (pp) => pp.priority === 2000
    );
    if (mainPostProcess) {
      data = { ...data, mainPostProcess, regressionViewKey: uuidv4() };
    }
    const postProcessesSchedule = dataset?.dataset.dependencies.postProcesses?.find(
      (pp) => pp.postProcessRole === 'WaterfrontSchedule'
    );
    const nonWaterFromPostProcess = postProcesses?.find(
      (pp) => pp.postProcessDefinition === 'Nonwaterfront schedule'
    );

    const adjustmentPostProcess = dataset?.dataset.dependencies.postProcesses?.find(
      (pp) => pp.postProcessRole === 'LandAdjustment'
    );

    const nonWaterExpressionsPostProcess = dataset?.dataset.dependencies.postProcesses?.find(
      (pp) => pp.postProcessRole === 'NonWaterfrontExpressions'
    );

    const waterExpressionsPostProcess = dataset?.dataset.dependencies.postProcesses?.find(
      (pp) => pp.postProcessRole === 'WaterfrontExpressions'
    );

    const waterFromPostProcessId = postProcessesSchedule?.datasetPostProcessId;

    let postProcessNonWaterfront = null;

    let landAdjustment = null;

    if (postProcesses) {
      data = { ...data, nonWaterFront: nonWaterFromPostProcess };
    }
    if (adjustmentPostProcess) {
      data = { ...data, adjustmentPostProcess };
    }
    if (adjustmentPostProcess) {
      landAdjustment = await LoadPostProcess(
        adjustmentPostProcess.datasetPostProcessId.toString()
      );
    }
    if (nonWaterFromPostProcess) {
      postProcessNonWaterfront = await LoadPostProcess(
        nonWaterFromPostProcess.datasetPostProcessId?.toString()
      );
    }
    if (postProcessesSchedule) {
      data = { ...data, waterFront: postProcessesSchedule };
    }
    let postProcessWaterfront = null;
    if (waterFromPostProcessId) {
      postProcessWaterfront = await LoadPostProcess(
        waterFromPostProcessId?.toString()
      );
    }
    let postProcessNonWaterExpressions = null;
    if(nonWaterExpressionsPostProcess){
        postProcessNonWaterExpressions = await LoadPostProcess(
          nonWaterExpressionsPostProcess.datasetPostProcessId?.toString()
        ); 
    }

    if(waterExpressionsPostProcess){
      const waterExpressions = await LoadPostProcess(
        waterExpressionsPostProcess.datasetPostProcessId?.toString()
      );
      if(Array.isArray(waterExpressions?.exceptionPostProcessRules)){
        buildNonWaterFrontExpressionGridData(waterExpressions?.exceptionPostProcessRules || [], setWaterFrontExpressionData)
        if(postProcessNonWaterExpressions?.datasetPostProcessId) setWaterFrontExpressionPostProcessId(postProcessNonWaterExpressions?.datasetPostProcessId);
      }
    }

    if (mainPostProcess) {
      data = { ...data, disableApplyButton: false };
    }

    if(Array.isArray(postProcessNonWaterExpressions?.exceptionPostProcessRules)){
      buildNonWaterFrontExpressionGridData(postProcessNonWaterExpressions?.exceptionPostProcessRules || [], setNonWaterFrontExpressionData)
      if(postProcessNonWaterExpressions?.datasetPostProcessId) setNonWaterFrontExpressionPostProcessId(postProcessNonWaterExpressions?.datasetPostProcessId);
    }

    if (Array.isArray(postProcessNonWaterfront?.exceptionPostProcessRules)) {
      buildNonWaterFrontGridData(
        postProcessNonWaterfront?.exceptionPostProcessRules || [],
        setNonWaterfrontGridData,
        setNonWaterColDefs
      );
    }

    if (Array.isArray(postProcessWaterfront?.exceptionPostProcessRules)) {
      buildWaterFrontGridData(
        postProcessWaterfront?.exceptionPostProcessRules || [],
        setWaterfrontGridData,
        setWaterColDefs
      );
    }
    if (Array.isArray(landAdjustment?.exceptionPostProcessRules)) {
      buildPositiveAdjustment(
        landAdjustment?.exceptionPostProcessRules || [],
        setPositiveGridData
      );
    }
  }
  return data as PostProcessLandValues;
};
