// AppContext.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, {
  FC,
  useState,
  PropsWithChildren,
  useEffect,
  useContext,
} from 'react';

import { AxiosLoader } from 'services/AxiosLoader';
import * as signalR from '@microsoft/signalr';

import {
  CustomSearchCategoryResults,
  CustomSearchCategory,
  CustomSearch,
  AgGridChildType,
  GridDataMethods,
  CommonValue,
  GlobalVariables,
  GlobalVariablesData,
  SignalRResponseType,
} from 'services/map.typings';
import { FormValues, FormDefinition } from 'components/FormBuilder/FormBuilder';
import { TreeDataset } from 'routes/models/View/NewTimeTrend/typings';
import { Folder, Folders } from 'routes/search/NewSearch/typings';
import {
  DropdownTreeRow,
  SnackState,
  SnackContext,
  SnackProvider,
} from '@ptas/react-ui-library';
import { uniqueId } from 'lodash';
import { getMetadataStoreItem } from 'services/common';
import { useList } from 'react-use';
import { ListActions } from 'react-use/lib/useList';

/**
 * Application context interface
 */

interface RolesTeamsType {
  id: string;
  name: string;
}

interface CurrentUserInfoType {
  email: string;
  fullName: string;
  id: string;
  roles: RolesTeamsType[];
  teams: RolesTeamsType[];
}

export interface AppContextTyping {
  messages: SignalRResponseType[];
  connection: signalR.HubConnection;
  jobId: number;
  handleJobId: (jobId: number) => void;
  currentUserId: string;
  selectedParcels: string[];
  setSelectedParcels: (selectedParcels: string[]) => void;
  customSearchesParams: {
    customSearchCategories: CustomSearchCategory[] | undefined;
    customSearch: CustomSearch | null;
    setCustomSearch: (c: CustomSearch) => void;
  };
  formValues: FormValues | null;
  setFormValues: React.Dispatch<React.SetStateAction<FormValues | null>>;

  formDefinition: FormDefinition | null;
  setFormDefinition: React.Dispatch<
    React.SetStateAction<FormDefinition | null>
  >;

  treeDatasets: TreeDataset | null;
  setTreeDatasets: React.Dispatch<React.SetStateAction<TreeDataset | null>>;

  currentDatasetId: string;
  setCurrentDatasetId: React.Dispatch<React.SetStateAction<string>>;
  getDatasetsForUser: () => Promise<void>;

  shouldDisplayVariablesGrid: boolean;
  toggleDisplayVariableGrid: () => void;

  selectAllRows: boolean;
  selectAllRowsAction: (state: boolean) => void;

  unselectAllRows: boolean;
  unselectAllRowsAction: (state: boolean) => void;

  shouldDisplayAutoFitGrid: boolean;
  toggleAutoFitColumns: () => void;

  datasetMethods: GridDataMethods;
  toogleDatasetMethods: (params: GridDataMethods) => void;

  currentGridRef?: React.RefObject<AgGridChildType>;
  setGridReference?: (gridRef: React.RefObject<AgGridChildType>) => void;

  folders: DropdownTreeRow[];
  setFolders: React.Dispatch<React.SetStateAction<DropdownTreeRow[]>>;
  getFolders: () => Promise<void>;

  snackBar: SnackState;
  setSnackBar: React.Dispatch<React.SetStateAction<SnackState>>;

  postProcessName: string | null;
  setPostProcessName: React.Dispatch<React.SetStateAction<string | null>>;

  globalVariablesCategories: string[];
  setGlobalVariablesCategories: React.Dispatch<React.SetStateAction<string[]>>;

  globalVariables: GlobalVariables[];
  globalVariablesMethods: ListActions<GlobalVariables>;

  disableVariablesMenu: boolean;
  setDisableVariablesMenu: React.Dispatch<React.SetStateAction<boolean>>;

  globalVariablesToAdd: GlobalVariables[];
  setGlobalVariablesToAdd: React.Dispatch<
    React.SetStateAction<GlobalVariables[]>
  >;

  shouldHideSelectedRows: boolean;
  toggleHideSelectedRows: (value: boolean) => void;

  shouldShowSelectedRows: boolean;
  toggleShowSelectedRows: (value: boolean) => void;

  shouldDuplicateDataset: boolean;
  toggleDuplicateDataset: () => void;

  shouldDuplicateFilteredDataset: boolean;
  toggleDuplicateFilteredDataset: () => void;

  shouldDeleteSelectedRows: boolean;
  toggleDeleteSelectedRows: () => void;

  shouldShowColumns: boolean;
  toggleShowColumns: () => void;

  routeFrom: string;
  setRouteFrom: (route: string) => void;

  connnectionIsStarted: boolean;

  showMapMenu: boolean;
  setShowMapMenu: React.Dispatch<React.SetStateAction<boolean>>;

  countTotalRecords: number;
  toogleCountTotalRecords: (count: number) => void;

  shouldHideDataColumns: boolean;
  toggleHideDataColumns: () => void;

  shouldHideVariablesColumns: boolean;
  toggleHideVariablesColumns: () => void;
}

/**
 * Initialize the app context
 */
export const AppContext = React.createContext<Partial<AppContextTyping>>({});

/**
 * A Context provider component
 *
 * @remarks
 * This component scope is private, because its exposed through the hoc
 * @param props -Arbitrary props
 */
const AppProvider = (props: PropsWithChildren<{}>): JSX.Element => {
  const [currentUserId, setCurrentUserId] = useState<string>(''); //F639C0EE-8272-E911-A976-001DD800D5B0

  const selectedParcelsKey = 'selectedParcels';
  const [customSearchCategories, setCustomSearchCategories] = useState<
    CustomSearchCategory[] | undefined
  >([]);
  const [countTotalRecords, setCountTotalRecords] = useState<number>(0);
  const [jobId, setJobId] = useState<number>(0);
  const [connection, setConnection] = useState<signalR.HubConnection>();
  const [messages, setMessages] = useState<SignalRResponseType[]>([]);

  const [shouldDuplicateDataset, setDuplicateDataset] = useState<boolean>(
    false
  );

  const [shouldHideDataColumns, setShouldHideDataColumns] = useState<boolean>(
    false
  );

  const toggleHideDataColumns = (): void => {
    setShouldHideDataColumns(!shouldHideDataColumns);
  };

  const [
    shouldHideVariablesColumns,
    setShouldHideVariablesColumns,
  ] = useState<boolean>(false);

  const toggleHideVariablesColumns = (): void => {
    setShouldHideVariablesColumns(!shouldHideVariablesColumns);
  };

  const toogleCountTotalRecords = (count: number): void => {
    setCountTotalRecords(count);
  };

  const handleJobId = (jobId: number): void => {
    setJobId(jobId);
  };

  const [
    shouldDuplicateFilteredDataset,
    setDuplicateFilteredDataset,
  ] = useState<boolean>(false);

  const [shouldDeleteSelectedRows, setDeleteSelectedRows] = useState<boolean>(
    false
  );

  const [shouldShowColumns, setShowColumns] = useState<boolean>(false);

  const toggleShowColumns = (): void => {
    setShowColumns(!shouldShowColumns);
  };

  const [routeFrom, setRouteFrom] = useState<string>('');

  const [customSearch, setCustomSearch] = useState<CustomSearch | null>(null);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('');

  const [formValues, setFormValues] = useState<FormValues | null>(null);
  const [formDefinition, setFormDefinition] = useState<FormDefinition | null>(
    null
  );
  const [treeDatasets, setTreeDatasets] = useState<TreeDataset | null>(null);

  const [shouldHideSelectedRows, setHideSelectedRows] = useState<boolean>(
    false
  );

  const [shouldShowSelectedRows, setShowSelectedRows] = useState<boolean>(
    false
  );

  const [selectedParcels, setSelectedParcels] = useState<string[]>(
    JSON.parse(localStorage.getItem(selectedParcelsKey) || '[]')
  );

  const toggleDuplicateDataset = (): void => {
    setDuplicateDataset(!shouldDuplicateDataset);
  };

  const toggleDuplicateFilteredDataset = (): void => {
    setDuplicateFilteredDataset(!shouldDuplicateFilteredDataset);
  };

  const [
    shouldDisplayVariablesGrid,
    setdisplayVariableGrid,
  ] = useState<boolean>(false);

  const [selectAllRows, setSelectAllRows] = useState<boolean>(false);
  const [unselectAllRows, setUnselectAllRows] = useState<boolean>(false);

  const [shouldDisplayAutoFitGrid, setdisplayAutoFitGrid] = useState<boolean>(
    false
  );

  const [folders, setFolders] = useState<DropdownTreeRow[]>([]);
  const { setSnackState: setSnackBar } = useContext(SnackContext);
  const [datasetMethods, setDatasetMethods] = useState<GridDataMethods>();
  const [postProcessName, setPostProcessName] = useState<string | null>(null);

  const [connnectionIsStarted, setConnnectionIsStarted] = useState<boolean>(
    false
  );

  const toggleAutoFitColumns = (): void => {
    setdisplayAutoFitGrid(!shouldDisplayAutoFitGrid);
  };
  const toggleDisplayVariableGrid = (): void => {
    setdisplayVariableGrid(!shouldDisplayVariablesGrid);
  };

  const toggleShowSelectedRows = (value: boolean): void => {
    setShowSelectedRows(value);
  };
  const selectAllRowsAction = (state: boolean): void => {
    setSelectAllRows(state);
  };

  const toggleDeleteSelectedRows = (): void => {
    setDeleteSelectedRows(!shouldDeleteSelectedRows);
  };

  const unselectAllRowsAction = (state: boolean): void => {
    setUnselectAllRows(state);
  };

  const toogleDatasetMethods = (methods: GridDataMethods): void => {
    setDatasetMethods(methods);
  };

  const [currentGridRef, setCurrentGridRef] = useState<
    React.RefObject<AgGridChildType>
  >();

  const [globalVariablesCategories, setGlobalVariablesCategories] = useState<
    string[]
  >([]);

  const [globalVariables, globalVariablesMethods] = useList<GlobalVariables>(
    []
  );

  const [disableVariablesMenu, setDisableVariablesMenu] = useState<boolean>(
    true
  );

  const [globalVariablesToAdd, setGlobalVariablesToAdd] = useState<
    GlobalVariables[]
  >([]);

  const [showMapMenu, setShowMapMenu] = useState<boolean>(false);

  const setGridReference = (
    gridRef: React.RefObject<AgGridChildType>
  ): void => {
    setCurrentGridRef(gridRef);
  };

  const setAndbroadcastSelectedParcels = (selectedParcels: string[]): void => {
    setSelectedParcels(selectedParcels);
    window.localStorage.setItem(
      selectedParcelsKey,
      JSON.stringify(selectedParcels)
    );
  };

  const toggleHideSelectedRows = (value: boolean): void => {
    setHideSelectedRows(value);
  };

  const initSignalRConnection = (): void => {
    const token = localStorage.getItem('magicToken');
    if (!token) return;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.REACT_APP_CUSTOM_SEARCHES_URL}`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();
    setConnection(connection);
  };

  useEffect(() => {
    if (connection) startConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection]);

  const startConnection = async (): Promise<void> => {
    try {
      await connection?.start();
      setConnnectionIsStarted(true);
      console.log('SignalR Connected.');
      connection?.on('JobProcessed', messageReceived);
      // connection?.on('DatasetSelectionChanged', messageReceived);
    } catch (error) {
      console.log(error);
      setTimeout(startConnection, 5000);
    }
  };

  const messageReceived = (
    arg1: unknown,
    arg2: unknown,
    arg3: unknown,
    arg4: unknown
  ): void => {
    const message = {
      jobType: arg1,
      jobId: arg2,
      jobStatus: arg3,
      payload: arg4,
    };
    const messageList = [...messages];
    if (messageList.length === 100) messageList.shift();
    setMessages([...messageList, message] as SignalRResponseType[]);
  };

  useEffect(() => {
    initSignalRConnection();
    window.addEventListener('storage', (e: StorageEvent) => {
      if (e.key === selectedParcelsKey) {
        setSelectedParcels(JSON.parse(e.newValue || '[]'));
      }
    });
  }, []);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await getMetadataStoreItem(
          'globalVariables',
          'category'
        );
        if (!response) return;
        const value = response.metadataStoreItems[0].value as CommonValue;
        setGlobalVariablesCategories(value.data.map((d) => d.toUpperCase()));
      } catch (error) {
        setSnackBar({
          text: 'Getting metadata failed: category',
          severity: 'error',
        });
      }
    };
    fetchData();
  }, [setSnackBar]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await getMetadataStoreItem(
          'globalVariables',
          'variables'
        );
        if (!response) return;
        const value = response.metadataStoreItems[0]
          .value as GlobalVariablesData;
        globalVariablesMethods.push(...value.data);
      } catch (error) {
        setSnackBar({
          text: 'Getting metadata failed: variables',
          severity: 'error',
        });
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const categoryLoader = new AxiosLoader<
          CustomSearchCategoryResults,
          {}
        >();
        const info = await categoryLoader.GetInfo(
          'CustomSearches/GetCustomSearchCategories',
          {}
        );
        const categories =
          info?.customSearchCategories.sort((a, b) =>
            a.name > b.name ? 1 : -1
          ) || [];
        setCustomSearchCategories(categories);
        await getCurrentUserInfo();
      } catch (error) {
        console.log(error.description);
      }
    };
    fetchData();
  }, []);

  const getCurrentUserInfo = async (): Promise<void> => {
    try {
      const loader = new AxiosLoader<CurrentUserInfoType, {}>();
      const info = await loader.GetInfo('Auth/GetCurrentUserInfo', {});
      if (info) setCurrentUserId(info?.id);
    } catch (error) {
      console.log(error.description);
    }
  };

  const getDatasetsForUser = async (): Promise<void> => {
    try {
      const loader = new AxiosLoader<TreeDataset, {}>();
      const data = await loader.GetInfo(
        `CustomSearches/GetDatasetsForUser/${currentUserId}`,
        {}
      );
      setTreeDatasets(data);
    } catch (error) {
      console.log(error.description);
    }
  };

  const getDataAndFolder = (): void => {
    getDatasetsForUser();
    getFolders();
  };

  useEffect(getDataAndFolder, [currentUserId]);

  const getFolders = async (): Promise<void> => {
    try {
      const loader = new AxiosLoader<Folders, {}>();
      const data = await loader.GetInfo(
        `CustomSearches/GetDatasetFoldersForUser/${currentUserId}`,
        {}
      );
      if (!data) return;
      let toAdd: DropdownTreeRow[] = [];
      flatFolderList(data.folders, toAdd);

      if (toAdd.find((f) => f.title === 'Unsaved')) {
        toAdd = toAdd.filter((f) => f.title !== 'Unsaved');
      }

      if (!toAdd.find((f) => f.title === 'User' && f.parent === null)) {
        toAdd.push({
          id: uniqueId(),
          parent: null,
          title: 'User',
          subject: '',
          folder: true,
        });
      }
      if (!toAdd.find((f) => f.title === 'Shared' && f.parent === null)) {
        toAdd.push({
          id: uniqueId(),
          parent: null,
          title: 'Shared',
          subject: '',
          folder: true,
        });
      }
      setFolders(toAdd);
    } catch (e) {
      console.log(e.description);
    }
  };

  const flatFolderList = (
    folders: Folder[],
    flatList: DropdownTreeRow[]
  ): void => {
    folders.forEach((f) => {
      if (f.children) {
        flatFolderList(f.children, flatList);
      }
      flatList.push({
        id: f.folderId,
        parent: f.parentFolderId,
        title: f.folderName,
        subject: f.folderName,
        folder: true,
      });
    });
  };

  //056fa904-c450-434d-9b3d-052fa01b5dcd
  //2BEBF379-5137-4E53-B08F-D0BF45F3C0C4
  return (
    <AppContext.Provider
      value={{
        currentUserId: currentUserId,
        selectedParcels: selectedParcels,
        customSearchesParams: {
          customSearchCategories,
          customSearch,
          setCustomSearch,
        },
        formValues,
        formDefinition,
        setFormDefinition,
        setFormValues,
        treeDatasets,
        currentDatasetId,
        setSelectedParcels: setAndbroadcastSelectedParcels,
        setCurrentDatasetId,
        getDatasetsForUser,
        shouldDisplayVariablesGrid,
        shouldDisplayAutoFitGrid,
        toggleDisplayVariableGrid,
        selectAllRowsAction,
        selectAllRows,
        unselectAllRows,
        unselectAllRowsAction,
        datasetMethods,
        toogleDatasetMethods,
        toggleAutoFitColumns,
        currentGridRef,
        setGridReference,
        folders,
        setFolders,
        getFolders,
        setSnackBar,
        postProcessName,
        setPostProcessName,
        globalVariablesCategories,
        globalVariables,
        globalVariablesMethods,
        disableVariablesMenu,
        setDisableVariablesMenu,
        globalVariablesToAdd,
        setGlobalVariablesToAdd,
        connection,
        messages,
        toggleHideSelectedRows,
        shouldHideSelectedRows,
        toggleShowSelectedRows,
        shouldShowSelectedRows,
        toggleDuplicateDataset,
        shouldDuplicateDataset,
        shouldDeleteSelectedRows,
        toggleDeleteSelectedRows,
        routeFrom,
        setRouteFrom,
        toggleDuplicateFilteredDataset,
        shouldDuplicateFilteredDataset,
        shouldShowColumns,
        toggleShowColumns,
        connnectionIsStarted,
        jobId,
        handleJobId,
        showMapMenu,
        setShowMapMenu,
        countTotalRecords,
        toogleCountTotalRecords,
        shouldHideDataColumns,
        toggleHideDataColumns,
        shouldHideVariablesColumns,
        toggleHideVariablesColumns,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export const withAppProvider = (Component: FC) => (
  props: object
): JSX.Element => (
  <SnackProvider>
    <AppProvider>
      <Component {...props} />
    </AppProvider>
  </SnackProvider>
);
