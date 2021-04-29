// NewTimeTrendContext
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import React, {
  useState,
  createContext,
  PropsWithChildren,
  useEffect,
  useContext,
  FC,
} from 'react';
import {
  ProjectDataSets,
  TreeDataset,
  ProjectTypes,
  ProjectType,
  TreeData,
  SaveModel,
  ModelDataset,
  CustomSearchParameters,
  AreaData,
  Areas,
} from 'routes/models/View/NewTimeTrend/typings';
import { AxiosLoader } from 'services/AxiosLoader';

import { AppContext } from 'context/AppContext';
import { ImportUserProjectResponse } from 'services/map.typings';
import { useHistory } from 'react-router-dom';
import {
  getCustomSearchParameterLookupValues,
  getCustomSearchParameters,
} from 'services/common';
import useLoaderCursor from 'components/common/useLoaderCursor';

interface Props {
  projectName: string;
  setProjectName: React.Dispatch<React.SetStateAction<string>>;

  comments: string;
  setComments: React.Dispatch<React.SetStateAction<string>>;

  assessmentYear: number | undefined;
  setAssessmentYear: React.Dispatch<React.SetStateAction<number | undefined>>;

  assessmentDateFrom: Date | undefined | null;
  setAssessmentDateFrom: React.Dispatch<
    React.SetStateAction<Date | undefined | null>
  >;

  assessmentDateTo: Date | undefined | null;
  setAssessmentDateTo: React.Dispatch<
    React.SetStateAction<Date | undefined | null>
  >;

  salesSelectedAreas: number[];
  setSalesSelectedAreas: React.Dispatch<React.SetStateAction<number[]>>;

  populationSelectedAreas: number[];
  setPopulationSelectedAreas: React.Dispatch<React.SetStateAction<number[]>>;

  selectedProjectArea: number | undefined;
  setSelectedProjectArea: React.Dispatch<React.SetStateAction<number | undefined>>;

  selectedProjectType: ProjectType | null;
  setSelectedProjectType: React.Dispatch<
    React.SetStateAction<ProjectType | null>
  >;

  projectTypes: ProjectTypes | null;
  setProjectTypes: React.Dispatch<React.SetStateAction<ProjectTypes | null>>;

  projectDatasets: ProjectDataSets;
  setProjectDatasets: React.Dispatch<React.SetStateAction<ProjectDataSets>>;

  salesTreeSelection: TreeData | null;
  setSalesTreeSelection: React.Dispatch<React.SetStateAction<TreeData | null>>;

  populationTreeSelection: TreeData | null;
  setPopulationTreeSelection: React.Dispatch<
    React.SetStateAction<TreeData | null>
  >;

  treeDatasets: TreeDataset | null;
  setTreeDatasets: React.Dispatch<React.SetStateAction<TreeDataset | null>>;

  selectedCustomSearchParameters: CustomSearchParameters | null;
  setSelectedCustomSearchParameters: React.Dispatch<
    React.SetStateAction<CustomSearchParameters | null>
  >;

  salesSearchParameters: CustomSearchParameters | null;
  setSalesSearchParameters: React.Dispatch<
    React.SetStateAction<CustomSearchParameters | null>
  >;

  populationSearchParameters: CustomSearchParameters | null;
  setPopulationSearchParameters: React.Dispatch<
    React.SetStateAction<CustomSearchParameters | null>
  >;

  areas: Areas | null;
  setAreas: React.Dispatch<React.SetStateAction<Areas | null>>;

  salesAreas: Areas | null;
  setSalesAreas: React.Dispatch<React.SetStateAction<Areas | null>>;

  populationAreas: Areas | null;
  setPopulationAreas: React.Dispatch<React.SetStateAction<Areas | null>>;

  createModel: (
    salesSelected: number,
    populationSelected: number
  ) => Promise<void>;

  onSetArea: (
    isNew: boolean,
    areaType: 'sales' | 'population',
    item: number
  ) => void;
}

export const NewTimeTrendContext = createContext<Partial<Props>>({});

const NewTimeTrendProvider = (props: PropsWithChildren<{}>): JSX.Element => {
  const appContext = useContext(AppContext);
  const [projectName, setProjectName] = useState<string>('');
  const [projectTypes, setProjectTypes] = useState<ProjectTypes | null>(null);
  const [comments, setComments] = useState<string>('');
  const [assessmentYear, setAssessmentYear] = useState<number | undefined>(
    2020
  );
  const [assessmentDateFrom, setAssessmentDateFrom] = useState<
    Date | undefined | null
  >(new Date());
  const [assessmentDateTo, setAssessmentDateTo] = useState<
    Date | undefined | null
  >(new Date());
  const [salesSelectedAreas, setSalesSelectedAreas] = useState<number[]>([]);
  const [populationSelectedAreas, setPopulationSelectedAreas] = useState<
    number[]
  >([]);
  const [
    selectedProjectType,
    setSelectedProjectType,
  ] = useState<ProjectType | null>(null);
  const [projectDatasets, setProjectDatasets] = useState<ProjectDataSets>([]);
  const [salesTreeSelection, setSalesTreeSelection] = useState<TreeData | null>(
    null
  );
  const [
    populationTreeSelection,
    setPopulationTreeSelection,
  ] = useState<TreeData | null>(null);
  const [treeDatasets, setTreeDatasets] = useState<TreeDataset | null>(null);

  const [
    selectedCustomSearchParameters,
  ] = useState<CustomSearchParameters | null>(null);

  const [
    salesSearchParameters,
    setSalesSearchParameters,
  ] = useState<CustomSearchParameters | null>(null);
  // const [
  //   populationSearchParameters,
  //   setPopulationSearchParameters,
  // ] = useState<CustomSearchParameters | null>(null);

  const [allowMultipleAreasSales, setAllowMultipleAreasSales] = useState<boolean>(false);
  const [allowMultipleAreasPopu, setAllowMultipleAreasPopu] = useState<boolean>(false);

  enum ParameterNames {
    Area = 'Area',
    SalesDateFrom = 'SaleDateFrom',
    SalesDateTo = 'SaleDateTo',
  }

  // const [areas, setAreas] = useState<Areas | null>(null);
  const [salesAreas, setSalesAreas] = useState<Areas | null>(null);
  const [populationAreas, setPopulationAreas] = useState<Areas | null>(null);

  const [selectedProjectArea, setSelectedProjectArea] = useState<number | undefined>(undefined);

  const value = useContext(AppContext);
  const userId = value.currentUserId;
  const [, setError] = useState<object>({});
  const history = useHistory();
  const cursorLoading = useLoaderCursor();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const loader = new AxiosLoader<TreeDataset, {}>();
      const data = await loader.GetInfo(
        `CustomSearches/GetDatasetsForUser/${userId}`,
        {}
      );
      setTreeDatasets(data);
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const loader = new AxiosLoader<ProjectTypes, {}>();
      const data = await loader.GetInfo(`CustomSearches/GetProjectTypes/`, {});
      setProjectTypes(data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedProjectType) return;
    setPopulationAreas(null);
    setSalesAreas(null);
    setSalesSelectedAreas([]);
    setPopulationSelectedAreas([]);

    const fetchData = async (): Promise<void> => {
      try {
        const salesData = selectedProjectType.projectTypeCustomSearchDefinitions.find(
          (c) => c.datasetRole.toLocaleLowerCase() === 'sales'
        );
        const populationData = selectedProjectType.projectTypeCustomSearchDefinitions.find(
          (c) => c.datasetRole.toLocaleLowerCase() === 'population'
        );
        if (!salesData || !populationData) return;

        const sales = await getCustomSearchParameters(
          salesData.customSearchDefinitionId
        );
        const population = await getCustomSearchParameters(
          populationData.customSearchDefinitionId
        );
        
        setSalesSearchParameters(sales);

        const isAllowedSales = sales?.customSearchParameters.find(c => c.name.toLowerCase() === "area")?.allowMultipleSelection;
        const isAllowedPopu = population?.customSearchParameters.find(c => c.name.toLowerCase() === "area")?.allowMultipleSelection;

        setAllowMultipleAreasPopu(isAllowedPopu ?? false);
        setAllowMultipleAreasSales(isAllowedSales ?? false);

        if (!sales || !population) return;

        await setAreas(
          sales,
          population,
          salesData.customSearchDefinitionId,
          populationData.customSearchDefinitionId
        );
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            text: !selectedProjectType.projectTypeCustomSearchDefinitions
              ? `Custom search definitions are null for ${selectedProjectType.projectTypeName}`
              : 'Failed getting the custom search parameters',
            severity: 'error',
          });
        setSelectedProjectType(null);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectType]);

  const setAreas = async (
    sales: CustomSearchParameters,
    population: CustomSearchParameters,
    salesId: number,
    populationId: number
  ): Promise<void> => {
    const areaParam = sales.customSearchParameters.find(
      (p) => p.name === ParameterNames.Area
    );
    const populationParam = population.customSearchParameters.find(
      (p) => p.name === ParameterNames.Area
    );

    if (!areaParam || !populationParam) return;

    try {
      const salesAreas = await getCustomSearchParameterLookupValues(
        salesId,
        areaParam.name
      );
      const populationAreas = await getCustomSearchParameterLookupValues(
        populationId,
        populationParam.name
      );

      if (salesAreas) setSalesAreas(salesAreas);
      if (populationAreas) setPopulationAreas(populationAreas);
    } catch (error) {
      console.log('getCustomSearchParameterLookupValues error', error);
    }
  };

  // useEffect(() => {
  //   if (
  //     !salesSearchParameters ||
  //     !salesSearchParameters.customSearchParameters ||
  //     salesSearchParameters.customSearchParameters.length === 0
  //   )
  //     return;
  //   const areaParam = salesSearchParameters.customSearchParameters.filter(
  //     (p) => p.name === ParameterNames.Area
  //   );
  //   if (!areaParam || areaParam.length === 0) return;

  //   const fetchData = async (): Promise<void> => {
  //     const loader = new AxiosLoader<Areas, {}>(
  //       process.env.REACT_APP_CUSTOM_SEARCHES_URL
  //     );
  //     const data = await loader.GetInfo(
  //       `CustomSearches/GetCustomSearchParameterLookupValues/${selectedProjectType?.customSearchDefinitionId}/${areaParam[0].name}`,
  //       {}
  //     );
  //     setAreas(data);
  //   };
  //   fetchData();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [populationSearchParameters]);

  const setNewModelInfo = (
    datasetMods: number,
    datasetTreeSelection: TreeData | null,
    datasetSelectedArea: number[],
    datasetRole: 'Population' | 'Sales'
  ): ModelDataset => {
    const datasetModel: ModelDataset = { datasetRole: datasetRole };
    // 0 -> area
    // 1 -> dataset
    if (datasetMods) {
      datasetModel.datasetId = datasetTreeSelection?.id as string;
    } else if (selectedProjectType) {
      const defId = selectedProjectType.projectTypeCustomSearchDefinitions.find(
        (p) => p.datasetRole.toLocaleLowerCase() === 'sales'
      )?.customSearchDefinitionId;
      const dt: AreaData = {
        customSearchDefinitionId: defId ? defId : 0,
        parameterValues: [],
      };
      salesSearchParameters?.customSearchParameters.forEach((p) => {
        if (p.name.toLowerCase().includes("area")) {
          const isMultiple = p.allowMultipleSelection === true ? true : false;
          if(isMultiple) {
            const areas = datasetSelectedArea.join(",");
            dt.parameterValues.push({ id: p.id, value: areas });
          } else {
            dt.parameterValues.push({ id: p.id, value: datasetSelectedArea[0] });
          }
        }
        if (p.name.toLowerCase().includes("assmtyr") && assessmentYear){
          dt.parameterValues.push({id: p.id, value: assessmentYear})
        }
        if (
          p.name.toLowerCase().includes("from") &&
          datasetRole === 'Sales' &&
          assessmentDateFrom
        ) {
          dt.parameterValues.push({ id: p.id, value: assessmentDateFrom });
        }
        if (
          p.name.toLowerCase().includes("to") &&
          datasetRole === 'Sales' &&
          assessmentDateTo
        ) {
          dt.parameterValues.push({ id: p.id, value: assessmentDateTo });
        }
      });
      datasetModel.dataset = dt;
    }
    return datasetModel;
  };

  const createModel = async (
    salesSelected: number,
    populationSelected: number
  ): Promise<void> => {
    if (
      selectedProjectType?.projectTypeName &&
      assessmentYear &&
      assessmentDateTo &&
      assessmentDateFrom &&
      projectName
    ) {
      const toSave: SaveModel = {
        projectName: projectName,
        comments: comments,
        assessmentYear: assessmentYear,
        assessmentDateFrom: assessmentDateFrom as Date,
        assessmentDateTo: assessmentDateTo,
        selectedAreas: salesSelectedAreas,
        projectTypeName: selectedProjectType?.projectTypeName,
        projectDatasets: [],
        userId: appContext.currentUserId as string,
      };

      toSave.projectDatasets.push(
        setNewModelInfo(
          salesSelected,
          salesTreeSelection,
          salesSelectedAreas,
          'Sales'
        )
      );

      toSave.projectDatasets.push(
        setNewModelInfo(
          populationSelected,
          populationTreeSelection,
          populationSelectedAreas,
          'Population'
        )
      );

      try {
        const al1 = new AxiosLoader<ImportUserProjectResponse, {}>();
        cursorLoading(true);
        const createNewModelRequest = await al1.PutInfo(
          'CustomSearches/ImportUserProject',
          toSave,
          {}
        );
        history.push(`/models/view/${createNewModelRequest?.projectId}`);
        cursorLoading(false);
      } catch ({ message }) {
        setError(message);
        if (`${message}`.indexOf('409') > -1) {
          //
        }
        cursorLoading(false);
      }
    }
  };

  const onSetArea = (
    isNew: boolean,
    areaType: 'sales' | 'population',
    item: number
  ): void => {
    if(areaType === "sales") {
      if(!allowMultipleAreasSales) {
        setSalesSelectedAreas(isNew ? [item] : []);
      } else{
        const areas = isNew ? [...salesSelectedAreas, item] : salesSelectedAreas.filter((s) => s !== item);
        setSalesSelectedAreas(Array.from(new Set(areas)))
      }
    } else{
      //Population
      if(!allowMultipleAreasPopu) {
        setPopulationSelectedAreas(isNew ? [item] : []);
      } else{
        const areas = isNew ? [...populationSelectedAreas, item] : populationSelectedAreas.filter((p) => p !== item);
        setPopulationSelectedAreas(Array.from(new Set(areas)));
      }
    }
  };

  return (
    <NewTimeTrendContext.Provider
      value={{
        projectName,
        setProjectName,
        treeDatasets,
        comments,
        setComments,
        assessmentYear,
        setAssessmentYear,
        assessmentDateFrom,
        setAssessmentDateFrom,
        assessmentDateTo,
        setAssessmentDateTo,
        salesSelectedAreas,
        setSalesSelectedAreas,
        populationSelectedAreas,
        setPopulationSelectedAreas,
        selectedProjectType,
        setSelectedProjectType,
        projectDatasets,
        setProjectDatasets,
        salesTreeSelection,
        setSalesTreeSelection,
        populationTreeSelection,
        setPopulationTreeSelection,
        createModel,
        projectTypes,
        populationAreas,
        salesAreas,
        onSetArea,
        selectedCustomSearchParameters,
        selectedProjectArea,
        setSelectedProjectArea
      }}
    >
      {props.children}
    </NewTimeTrendContext.Provider>
  );
};

export const withNewTimeTrendProvider = (Component: FC) => (
  props: object
): JSX.Element => (
  <NewTimeTrendProvider>
    <Component {...props} />
  </NewTimeTrendProvider>
);
