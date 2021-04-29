import {
  Areas,
  CustomSearchParameters,
} from 'routes/models/View/NewTimeTrend/typings';

// common.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { AxiosLoader } from './AxiosLoader';
import {
  AssingData,
  CreateDatasetFolderProps,
  ExcelSheetJson,
  ExcelToJson,
  ExecuteDatasetPostProcessRequest,
  Folders,
  FolderToRename,
  GetDatasetColumnsResponseResults,
  GetExportPostProcessResponse,
  GetOneProjectResult,
  GetProjectsResult,
  ImportRScriptPostProcessRequest,
  ImportRScriptPostProcessResponse,
  MetadataStoreItems,
  RenameData,
} from './map.typings';

export const getDatasetFoldersForUser = async (
  user: string
): Promise<Folders | null> => {
  const loader = new AxiosLoader<Folders, {}>();
  return await loader.GetInfo(
    `CustomSearches/GetDatasetFoldersForUser/${user}`,
    {}
  );
};

export const getDatasetColumns = async (
  datasetId: string
): Promise<GetDatasetColumnsResponseResults | null> => {
  const loader = new AxiosLoader<GetDatasetColumnsResponseResults, {}>();
  return await loader.GetInfo(
    `CustomSearches/GetDatasetColumns/${datasetId}?usePostProcess=true`,
    {}
  );
};

export const createDatasetFolder = async (
  data: CreateDatasetFolderProps
): Promise<void> => {
  const loader = new AxiosLoader<{}, CreateDatasetFolderProps>(

  );
  await loader.PutInfo(`CustomSearches/CreateDatasetFolder`, data, {});
};

export const renameFolder = async (
  folderToRename: FolderToRename
): Promise<void> => {
  const loader = new AxiosLoader<{}, FolderToRename>(

  );
  await loader.PutInfo(`CustomSearches/RenameFolder`, folderToRename, {});
};

export const renameDataset = async (
  datasetId: React.ReactText,
  data: RenameData
): Promise<void> => {
  const loader = new AxiosLoader<{}, RenameData>(

  );
  await loader.PutInfo(
    `CustomSearches/UpdateDatasetAttributes/${datasetId}`,
    data,
    {}
  );
};

export const deleteUserProject = async (
  projectId: React.ReactText
): Promise<void> => {
  const loader = new AxiosLoader<{}, {}>(

  );
  await loader.PutInfo(`CustomSearches/DeleteUserProject/${projectId}`, {}, {});
};

export const deleteProjectVersion = async (
  projectId: React.ReactText
): Promise<void> => {
  const loader = new AxiosLoader<{}, {}>(

  );
  await loader.PutInfo(
    `CustomSearches/DeleteProjectVersion/${projectId}`,
    {},
    {}
  );
};

export const deleteDataset = async (
  datasetId: React.ReactText
): Promise<void> => {
  const loader = new AxiosLoader<{}, {}>(

  );
  await loader.PutInfo(`CustomSearches/DeleteDataset/${datasetId}`, {}, {});
};

export const deleteDatasetPostProcess = async (
  datasetPostProcessId: React.ReactText
): Promise<void> => {
  const loader = new AxiosLoader<{}, {}>(

  );
  await loader.PutInfo(
    `CustomSearches/DeleteDatasetPostProcess/${datasetPostProcessId}`,
    {},
    {}
  );
};

// // export const deleteDatasetFolder = async (
// //   folderPath: string
// // ): Promise<void> => {
// //   const loader = new AxiosLoader<{}, { folderPath: string }>(
// //
// //   );
// //   await loader.PutInfo(
// //     `CustomSearches/DeleteDatasetFolder/`,
// //     { folderPath: folderPath },
// //     {}
// //   );
// // };

export const assignFolderToDataset = async (
  path: string,
  datasetId: string
): Promise<void> => {
  const loader = new AxiosLoader<{}, AssingData>(

  );
  await loader.PutInfo(
    `CustomSearches/AssignFolderToDataset/${datasetId}`,
    { folderPath: path },
    {}
  );
};

// // export const setProjectLockLevel = async (
// //   projectId: string,
// //   isLocked: boolean
// // ): Promise<void> => {
// //   const loader = new AxiosLoader<{}, {}>(
// //
// //   );
// //   await loader.PutInfo(
// //     `CustomSearches/SetProjectLockLevel/${projectId}/${isLocked}`,
// //     {},
// //     {}
// //   );
// // };

export const setDatasetLockLevel = async (
  datasetId: React.ReactText,
  isLocked: boolean
): Promise<void> => {
  const loader = new AxiosLoader<{}, {}>(

  );
  await loader.PutInfo(
    `CustomSearches/SetDatasetLockLevel/${datasetId}/${isLocked}`,
    {},
    {}
  );
};

export const getCustomSearchParameters = async (
  definitionId: number
): Promise<CustomSearchParameters | null> => {
  const loader = new AxiosLoader<CustomSearchParameters, {}>(

  );
  return await loader.GetInfo(
    `CustomSearches/GetCustomSearchParameters/${definitionId}`,
    {}
  );
};

export const getCustomSearchParameterLookupValues = async (
  id: number,
  name: string
): Promise<Areas | null> => {
  const loader = new AxiosLoader<Areas, {}>(

  );
  return await loader.GetInfo(
    `CustomSearches/GetCustomSearchParameterLookupValues/${id}/${name}`,
    {}
  );
};

export const createNewProjectVersion = async (
  projectId: React.ReactText
): Promise<void> => {
  const loader = new AxiosLoader<{}, {}>(

  );
  await loader.PutInfo(
    `CustomSearches/CreateNewProjectVersion/${projectId}`,
    {},
    {}
  );
};

export const getUserProjects = async (
  userId: string
): Promise<GetProjectsResult | null> => {
  const loader = new AxiosLoader<GetProjectsResult, {}>(

  );
  return await loader.GetInfo(`CustomSearches/GetUserProjects/${userId}`, {});
};

export const getUserProject = async (
  projectId: React.ReactText
): Promise<GetOneProjectResult | null> => {
  const loader = new AxiosLoader<GetOneProjectResult, {}>(
  );
  return await loader.GetInfo(`CustomSearches/GetUserProject/${projectId}`, {
    includeDependencies: true,
  });
};

// // export const getUserInfo = async (userId: string): Promise<UserInfo | null> => {
// //   const loader = new AxiosLoader<UserInfo, {}>(
// //
// //   );
// //   return await loader.GetInfo(`CustomSearches/GetUserInfo/${userId}`, {});
// // };

export const importRScriptPostProcess = async (
  requestBody: ImportRScriptPostProcessRequest
): Promise<ImportRScriptPostProcessResponse | null> => {
  const loader = new AxiosLoader<
    ImportRScriptPostProcessResponse,
    ImportRScriptPostProcessRequest
  >();
  return await loader.PutInfo(
    `CustomSearches/ImportRScriptPostProcess`,
    requestBody,
    {}
  );
};

export const executeDatasetPostProcess = async (
  datasetId: string,
  datasetPostProcessId: string,
  requestBody: ExecuteDatasetPostProcessRequest[]
): Promise<void> => {
  const loader = new AxiosLoader<{}, ExecuteDatasetPostProcessRequest[]>(

  );
  await loader.PutInfo(
    `CustomSearches/ExecuteDatasetPostProcess/${datasetId}/${datasetPostProcessId}`,
    requestBody,
    {}
  );
};

export const getDatasetPostProcess = async (
  datasetPostProcessId: string
): Promise<GetExportPostProcessResponse | null> => {
  const loader = new AxiosLoader<GetExportPostProcessResponse, {}>(

  );
  return await loader.GetInfo(
    `CustomSearches/GetDatasetPostProcess/${datasetPostProcessId}`,
    {}
  );
};

export const convertFromExcelToJson = async (
  file: File
): Promise<ExcelToJson | null> => {
  const loader = new AxiosLoader<ExcelToJson, File>(

  );

  return await loader.PutInfo(
    `Shared/ConvertFromExcelToJson/`,
    file,
    { hasHeader: true },
    { 'Content-Type': 'multipart/form-data' }
  );
};

export const convertFromJsonToExcel = async (
  json: ExcelSheetJson
): Promise<File | null> => {
  const loader = new AxiosLoader<File, ExcelSheetJson>(

  );

  return await loader.PutInfo(
    `Shared/ConvertFromJsonToExcel/`,
    json,
    {},
    {},
    { responseType: 'blob' }
  );
};

export const getMetadataStoreItem = async (
  storeType: string,
  item: string
): Promise<MetadataStoreItems | null> => {
  const loader = new AxiosLoader<MetadataStoreItems, {}>(

  );
  return await loader.GetInfo(
    `Shared/GetMetadataStoreItem/${storeType}/${item}`,
    {}
  );
};

export const importMetadataStoreItems = async (
  storeItems: MetadataStoreItems
): Promise<void> => {
  const loader = new AxiosLoader<{}, MetadataStoreItems>(

  );

  await loader.PutInfo(`Shared/ImportMetadataStoreItems`, storeItems, {});
};
