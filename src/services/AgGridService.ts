import {
  GetJobStatusResponseResults,
  IdOnly,
  DuplicateDatasetType,
} from './map.typings';
// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import {
  AgGridServiceMethodsType,
  AgGridServiceLinkType,
  GetDatasetColumnsResponseResults,
  GetDataSetColumnEditLookupValuesResponseResults,
  GetDataSetDataResponseResults,
  GetDataSetUserStateResponseResults,
  SaveDataSetUserStateParamType,
  GetDataSetStatusResponseResults,
  SaveCalculatedColumnType,
  IdValue,
  ReturnFromRevert,
} from '../services/map.typings';
import { AxiosLoader } from '../services/AxiosLoader';

const agGridService = (): AgGridServiceMethodsType => {
  const agGridEndpoints = (
    dataSetId: string,
    columnName?: string
  ): AgGridServiceLinkType => {
    return {
      getDataSetUserState: `CustomSearches/GetDatasetUserState/${dataSetId}`,
      getDataSetColumnEditLookupValues: `CustomSearches/getDataSetColumnEditLookupValues/${dataSetId}/${columnName}`,
      getDatasetData: `CustomSearches/GetDatasetData/${dataSetId}`,
      getDatasetColumns: `CustomSearches/GetDatasetColumns/${dataSetId}`,
      getDatasetStatus: `CustomSearches/GetDatasetState/${dataSetId}/`,
      getJobStatus: `Jobs/GetJobStatus/${dataSetId}/`,
      saveDataSetUserState: `CustomSearches/SaveDatasetUserState/${dataSetId}`,
      saveUpdateDatasetData: `CustomSearches/UpdateDatasetData/${dataSetId}`,
      addCalculatedColumn: `CustomSearches/AddCalculatedColumn/${dataSetId}`,
      deleteCalculatedColumn: `CustomSearches/DeleteCalculatedColumn/${dataSetId}/${columnName}`,
      importCalculatedColumns: `CustomSearches/ImportCalculatedColumns/${dataSetId}`,
      revertRow: `CustomSearches/RevertDatasetUpdates/${dataSetId}`,
      duplicateDataset: `CustomSearches/DuplicateDataset/${dataSetId}`,
      deleteRows: `CustomSearches/CullDataset/${dataSetId}`,
    };
  };

  const getDataSetUserState = async (
    dataSetId: string
  ): Promise<GetDataSetUserStateResponseResults | null> => {
    const loader = new AxiosLoader<GetDataSetUserStateResponseResults, {}>(
    );
    return await loader.GetInfo(
      String(agGridEndpoints(dataSetId).getDataSetUserState),
      {}
    );
  };

  const duplicateDataset = async (
    dataSetId: string,
    userSelection = true
  ): Promise<DuplicateDatasetType | null> => {
    let params = {};
    if (!userSelection) params = { applyRowFilter: true };
    if (userSelection) params = { applyUserSelection: true };
    const loader = new AxiosLoader<DuplicateDatasetType, {}>(
    );
    return await loader.PutInfo(
      String(agGridEndpoints(dataSetId).duplicateDataset),
      {},
      {
        ...params,
      }
    );
  };

  const deleteRows = async (dataSetId: string): Promise<IdOnly | null> => {
    const loader = new AxiosLoader<IdOnly, {}>(
    );
    return await loader.PutInfo(
      String(agGridEndpoints(dataSetId).deleteRows),
      {},
      {}
    );
  };

  const getDataSetColumnEditLookupValues = async (
    dataSetId: string,
    columnName: string
  ): Promise<GetDataSetColumnEditLookupValuesResponseResults | null> => {
    const loader = new AxiosLoader<
      GetDataSetColumnEditLookupValuesResponseResults | null,
      {}
    >();
    return await loader.GetInfo(
      String(
        agGridEndpoints(dataSetId, columnName).getDataSetColumnEditLookupValues
      ),
      {}
    );
  };

  const getDataSetStatus = async (
    dataSetId: string,
    postProcessId: number
  ): Promise<GetDataSetStatusResponseResults | null> => {
    const loader = new AxiosLoader<GetDataSetStatusResponseResults, JSON>();
    const datasetStatus = await loader.GetInfo(
      String(agGridEndpoints(dataSetId).getDatasetStatus),
      {
        postProcessId,
      }
    );

    return datasetStatus;
  };

  const getJobStatus = async (
    postProcessId: number
  ): Promise<GetJobStatusResponseResults | null> => {
    const loader = new AxiosLoader<GetJobStatusResponseResults, JSON>(

    );

    const datasetStatus = await loader.GetInfo(
      String(agGridEndpoints(`${postProcessId}`).getJobStatus),
      {
        // postProcessId,
      }
    );

    return datasetStatus;
  };

  const getDataSetData = async (
    dataSetId: string,
    requestHeader: JSON,
    usePostProcess = true,
    postProcessId?: string
  ): Promise<GetDataSetDataResponseResults | null> => {
    const loader = new AxiosLoader<GetDataSetDataResponseResults, JSON>(

    );

    const params: {
      usePostProcess: boolean;
      postProcessId?: string;
      includeUpdateInfo?: boolean;
    } = {
      usePostProcess,
      includeUpdateInfo: true,
      postProcessId,
    };

    let payload = {};

    if (requestHeader === undefined)
      payload = {
        startRow: 0,
        endRow: 100,
        rowGroupCols: [],
        valueCols: [],
        pivotCols: [],
        pivotMode: false,
        groupKeys: [],
        filterModel: {},
        sortModel: [],
      };
    return await loader.PutInfo(
      String(agGridEndpoints(dataSetId).getDatasetData),
      {
        ...requestHeader,
        ...payload,
      },
      {
        ...params,
      }
    );
  };

  const getDatasetColumns = async (
    dataSetId: string,
    usePostProcess: boolean,
    postProcessId: number,
    includeDependencies?: boolean
  ): Promise<GetDatasetColumnsResponseResults | null> => {
    const loader = new AxiosLoader<GetDatasetColumnsResponseResults | null, {}>(

    );

    let params = {};
    if (usePostProcess) {
      params = { usePostProcess };
    }

    if (postProcessId) {
      params = { ...params, postProcessId };
    }

    if (includeDependencies) {
      return await loader.GetInfo(
        String(agGridEndpoints(dataSetId).getDatasetColumns),
        { includeDependencies: true, ...params }
      );
    }

    return await loader.GetInfo(
      String(agGridEndpoints(dataSetId).getDatasetColumns),
      {}
    );
  };

  const saveDataSetUserState = async (
    dataSetId: string,
    requestHeader: SaveDataSetUserStateParamType
  ): Promise<void> => {
    const loader = new AxiosLoader<string, SaveDataSetUserStateParamType>(

    );
    await loader.PutInfo(
      String(agGridEndpoints(dataSetId).saveDataSetUserState),
      requestHeader,
      {}
    );
  };

  const revertRows = async (
    dataSetId: string,
    rowIds: number[]
  ): Promise<ReturnFromRevert | null> => {
    const loader = new AxiosLoader<ReturnFromRevert, { RowIds: number[] }>(

    );
    const result = await loader.PutInfo(
      agGridEndpoints(dataSetId).revertRow,
      { RowIds: rowIds },
      { includeRevertedRows: true }
    );
    return result;
  };

  const revertAllChanges = async (dataSetId: string): Promise<void> => {
    const loader = new AxiosLoader<string, JSON[]>(

    );

    const payload = JSON.parse(JSON.stringify({}));

    await loader.PutInfo(agGridEndpoints(dataSetId).revertRow, payload, {
      startRow: 0,
      endRow: 100,
      rowGroupCols: [],
      valueCols: [],
      pivotCols: [],
      pivotMode: false,
      groupKeys: [],
      filterModel: {},
      sortModel: [],
    });
  };

  const saveUpdateDatasetData = async (
    dataSetId: string,
    requestHeader: unknown[]
  ): Promise<IdValue[]> => {
    const loader = new AxiosLoader<{ results: IdValue[] }, unknown[]>(

    );
    return (
      (
        await loader.PutInfo(
          agGridEndpoints(dataSetId).saveUpdateDatasetData,
          requestHeader,
          { includeUpdatedRows: true, clientId: 'CS' }
        )
      )?.results || []
    );
  };

  const addCalculatedColumn = async (
    dataSetId: string,
    ColumnName: string,
    Script: string
  ): Promise<void> => {
    const loader = new AxiosLoader<string, JSON[]>(

    );

    const payload = JSON.parse(JSON.stringify({ ColumnName, Script }));

    await loader.PutInfo(
      String(agGridEndpoints(dataSetId).addCalculatedColumn),
      payload,
      {}
    );
  };

  const saveCalculatedColumnsChanges = async (
    dataSetId: string,
    columnData: SaveCalculatedColumnType[]
  ): Promise<void> => {
    const loader = new AxiosLoader<string, JSON[]>(

    );

    const payload = JSON.parse(
      JSON.stringify({ calculatedColumns: columnData })
    );

    await loader.PutInfo(
      String(agGridEndpoints(dataSetId).importCalculatedColumns),
      payload,
      {}
    );
  };

  const deleteCalculatedColumn = async (
    dataSetId: string,
    ColumnName: string
  ): Promise<void> => {
    const loader = new AxiosLoader<string, JSON[]>();

    const payload = JSON.parse(JSON.stringify({}));

    await loader.PutInfo(
      String(agGridEndpoints(dataSetId, ColumnName).deleteCalculatedColumn),
      payload,
      {}
    );
  };

  return {
    getDataSetUserState,
    getDataSetColumnEditLookupValues,
    getDataSetData,
    getDataSetStatus,
    getDatasetColumns,
    saveDataSetUserState,
    saveUpdateDatasetData,
    addCalculatedColumn,
    deleteCalculatedColumn,
    saveCalculatedColumnsChanges,
    revertAllChanges,
    getJobStatus,
    revertRows: revertRows,
    duplicateDataset,
    deleteRows,
  };
};

export default agGridService();
