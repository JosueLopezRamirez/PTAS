// ProjectContext.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import React, {
  createContext,
  FC,
  PropsWithChildren,
  useState,
  useEffect,
  useContext,
} from 'react';

import {
  FileResult,
  PostProcess,
  Project,
  RegressionDetails,
  UserInfo,
} from 'services/map.typings';
import {
  SyncDetails,
  Card,
} from 'routes/models/View/Projects/common/CustomSection';
import { useParams, useHistory } from 'react-router-dom';
import bar from '../assets/images/chart/bar.svg';
import scatter from '../assets/images/chart/scatter.svg';
import boxplot from '../assets/images/chart/boxplot.svg';
import population from '../assets/images/dataSource/population.svg';
import sales from '../assets/images/dataSource/sales.svg';
import pie from '../assets/images/chart/pie.svg';
import histogram from '../assets/images/chart/histogram.svg';
import reportSvg from '../assets/images/report/report.svg';
import {
  deleteDatasetPostProcess,
  getUserProject,
  setDatasetLockLevel,
} from 'services/common';
import { AppContext } from './AppContext';
import { AxiosLoader } from 'services/AxiosLoader';

import { cloneDeep } from 'lodash';
import { Alert } from '@ptas/react-ui-library';
const images: { [id: string]: string } = {
  bar: bar,
  scatter: scatter,
  boxplot: boxplot,
  pie: pie,
  histogram: histogram,
};

interface Props {
  headerDetails: HeaderDetails;
  setHeaderDetails: React.Dispatch<React.SetStateAction<HeaderDetails>>;

  projectDetails: string;
  setProjectDetails: React.Dispatch<React.SetStateAction<string>>;

  projectType: string;
  setProjectType: React.Dispatch<React.SetStateAction<string>>;

  comments: string;
  setComments: React.Dispatch<React.SetStateAction<string>>;

  projectId: string;
  setProjectId: React.Dispatch<React.SetStateAction<string>>;

  projectName: string;
  setProjectName: React.Dispatch<React.SetStateAction<string>>;

  regression: PostProcess | null;
  setRegression: React.Dispatch<React.SetStateAction<PostProcess | null>>;

  regressionData: PostProcess[];
  setRegressionData: React.Dispatch<React.SetStateAction<PostProcess[]>>;

  regressionSyncDetails?: SyncDetails;
  setRegressionSyncDetails?: React.Dispatch<React.SetStateAction<SyncDetails>>;

  dataSourceSyncDetails?: SyncDetails;
  setDataSourceSyncDetails?: React.Dispatch<React.SetStateAction<SyncDetails>>;

  chartSyncDetails?: SyncDetails;
  setChartSyncDetails?: React.Dispatch<React.SetStateAction<SyncDetails>>;

  reportSyncDetails?: SyncDetails;
  setReportSyncDetails?: React.Dispatch<React.SetStateAction<SyncDetails>>;

  dataSourceCards?: Card[];
  setDataSourceCards?: React.Dispatch<React.SetStateAction<Card[]>>;

  chartCards?: Card[];
  setChartCards?: React.Dispatch<React.SetStateAction<Card[]>>;

  modelDetails: Project | null;

  timeCards?: Card[];
  multipleCards?: Card[];
  landCards?: Card[];
  suppCards?: Card[];
  appRatioCards?: Card[];
  annualCards?: Card[];
  salesDatasetId: string;

  userDetails: UserInfo[];
  setUserDetails: React.Dispatch<React.SetStateAction<UserInfo[]>>;

  getSyncDetails: (postProcessRole: string) => SyncDetails | undefined;
}

interface HeaderDetails {
  top: string;
  bottom: string;
}

export const ProjectContext = createContext<Partial<Props>>({});

function ProjectProvider(props: PropsWithChildren<{}>): JSX.Element {
  const appContext = useContext(AppContext);
  const [projectId, setProjectId] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('');
  const [projectDetails, setProjectDetails] = useState<string>('');

  const [headerDetails, setHeaderDetails] = useState<HeaderDetails>();

  const [regressionData, setRegressionData] = useState<PostProcess[]>();
  const [regression, setRegression] = useState<PostProcess | null>(null);
  const { id }: { id: string } = useParams();

  useEffect(() => {
    setProjectId(id);
  }, [id]);

  // const [heartbeat, setHeartbeat] = useState<number>(0);
  const [modelDetails, setModelDetails] = useState<Project | null>(null);
  const [comments, setComments] = useState<string>('');
  const history = useHistory();

  const [dataSourceSyncDetails, setDataSourceSyncDetails] = useState<
    SyncDetails | undefined
  >(undefined);

  const [chartSyncDetails, setChartSyncDetails] = useState<
    SyncDetails | undefined
  >(undefined);

  const [regressionSyncDetails, setRegressionSyncDetails] = useState<
    SyncDetails | undefined
  >(undefined);

  const [reportSyncDetails, setReportSyncDetails] = useState<
    SyncDetails | undefined
  >(undefined);

  const [dataSourceCards, setDataSourceCards] = useState<Card[]>([]);

  const [chartCards, setChartCards] = useState<Card[]>([]);

  const [userDetails, setUserDetails] = useState<UserInfo[]>([]);
  const [salesDatasetId, setSalesDatasetId] = useState<string>('');

  const [timeCards, setTimeCards] = useState<Card[] | undefined>([]);
  const [multipleCards, setMultipleCards] = useState<Card[] | undefined>([]);
  const [landCards, setLandCards] = useState<Card[] | undefined>([]);
  const [annualCards, setAnnualCards] = useState<Card[] | undefined>([]);
  const [suppCards, setSuppCards] = useState<Card[] | undefined>([]);
  const [appRatioCards, setAppRatioCards] = useState<Card[] | undefined>([]);

  useEffect(() => {
    let timeOut: NodeJS.Timeout;
    if (!projectId) return;
    const fetchData = async (): Promise<void> => {
      await loadProject();
    };
    fetchData();
    return (): void => clearTimeout(timeOut);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId /*, heartbeat*/]);

  const loadProject = async (): Promise<void> => {
    setModelDetails(null);
    try {
      const data = await getUserProject(projectId);
      if (!data) return;

      setUserDetails(data.usersDetails);
      // timeOut = setTimeout(() => setHeartbeat(heartbeat + 1), 10000);
      setModelDetails(data?.project || null);
      setComments(data?.project?.comments || '');
      setSalesDatasetId(
        `${
          data.project?.projectDatasets.find(
            (dataset) => dataset.datasetRole.toLowerCase() === 'sales'
          )?.datasetId
        }`
      );
    } catch (error) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          text: 'Failed loading the project',
          severity: 'error',
        });
    }
  };

  useEffect(() => {
    if (!modelDetails) return;
    setProjectType(modelDetails.projectTypeName?.toLowerCase() as string);
    setHeaderDetails(getHeaderDetails());
    setProjectName(modelDetails.projectName);
    setDataSourceSyncDetails(getDataSourceSyncDetails());
    setDataSourceCards(getDataSourceCards());

    setTimeCards(getCards('timetrendregression'));
    setMultipleCards(getCards('multipleregression'));
    setLandCards(getCards('waterfrontschedule'));
    setAnnualCards(getCards('annualupdateadjustment', false, true));
    setSuppCards(getCards('supplementalandexception', false, true));
    setAppRatioCards(getCards('appraisalratioreport', true));

    // setLandScheduleCards(getCards(""))
    // setlandScheduleSyncDetails(getSyncDetails(""));

    setChartSyncDetails(getNewestChart());
    setChartCards(getChartCards());
    setRegressionSyncDetails(getNewestRegression());

    setRegressionData(
      modelDetails.projectDatasets[0].dataset?.dependencies.postProcesses
    );

    //console.log(modelDetails.projectDatasets[0].dataset?.dependencies.postProcesses);

    const totalAreas = modelDetails.selectedAreas.length;
    const areas = modelDetails?.selectedAreas.join(', ');
    const from = modelDetails.assessmentDateFrom;
    const to = modelDetails.assessmentDateTo;

    setProjectDetails(
      `Project details - ${
        totalAreas > 1 ? 'Areas' : 'Area'
      } ${areas}, assessment year ${
        modelDetails.assessmentYear
      }, from ${new Date(from).toLocaleDateString()} to ${new Date(
        to
      ).toLocaleDateString()}`
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelDetails]);

  useEffect(() => {
    if (!regression) return;
    setReportSyncDetails({
      lastSyncBy:
        userDetails.find((u) => u.id === regression.lastModifiedBy)?.fullName ??
        'John Doe',
      lastSyncOn: new Date(regression.lastModifiedTimestamp + "Z").toLocaleString(),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regression]);

  const getHeaderDetails = (): HeaderDetails => {
    const headerOldestData = getHeaderSyncDetails();
    return {
      top: `Last sync on ${headerOldestData?.lastSyncOn}, by ${headerOldestData?.lastSyncBy}`,
      bottom: getHeaderNumberDetails(),
    };
  };

  const getHeaderSyncDetails = (): SyncDetails | undefined => {
    if (!modelDetails) return;

    const oldestProjectDataset = modelDetails.projectDatasets.reduce((r, o) =>
      o.dataset.lastExecutionTimestamp &&
      r.dataset.lastExecutionTimestamp &&
      new Date(o.dataset.lastExecutionTimestamp) <
        new Date(r.dataset.lastExecutionTimestamp )
        ? o
        : r
    );
    const oldestDsDate = new Date(
      oldestProjectDataset.dataset.lastExecutionTimestamp
        ? oldestProjectDataset.dataset.lastExecutionTimestamp + "Z"
        : new Date().toLocaleString()
    ).toLocaleString();
    return {
      lastSyncOn: oldestDsDate,
      lastSyncBy:
        userDetails.find(
          (u) => u.id === oldestProjectDataset.dataset.lastModifiedBy
        )?.fullName ?? 'John Doe',
    };
  };

  const getHeaderNumberDetails = (): string => {
    if (!modelDetails)
      return `Sales: XX   |  Population: XX,XXX  |  Area(s): XX`;

    const population = modelDetails?.projectDatasets.find(
      (ds) => ds.datasetRole.toLowerCase() === 'population'
    );
    const sales = modelDetails?.projectDatasets.find(
      (ds) => ds.datasetRole.toLowerCase() === 'sales'
    );
    if (!sales || !population)
      return `Sales: XX   |  Population: XX,XXX  |  Area(s): XX`;

    return `Sales: ${sales.dataset.totalRows}   |  Population:  ${
      population.dataset.totalRows
    }  |  ${
      'Area(s):' + (modelDetails.selectedAreas.length > 1)
        ? modelDetails.selectedAreas?.join(', ')
        : 'Area: ' + modelDetails.selectedAreas
    }`;
  };

  const getDataSourceSyncDetails = (): SyncDetails | undefined => {
    if (!modelDetails) return;

    const newestProjectDataset = modelDetails.projectDatasets.reduce((r, o) =>
      o.dataset.lastModifiedTimestamp &&
      r.dataset.lastModifiedTimestamp &&
      new Date(o.dataset.lastModifiedTimestamp) >
        new Date(r.dataset.lastModifiedTimestamp)
        ? o
        : r
    );
    const newestDsDate = new Date(
      newestProjectDataset.dataset.lastModifiedTimestamp
        ? newestProjectDataset.dataset.lastModifiedTimestamp + "Z"
        : new Date().toLocaleString()
    ).toLocaleString();
    return {
      lastSyncOn: newestDsDate,
      lastSyncBy:
        userDetails.find((u) => u.id === newestProjectDataset.dataset.userId)
          ?.fullName ?? 'John Doe',
    };
  };

  const getDataSourceCards = (): Card[] => {
    const cards: Card[] = [];

    modelDetails?.projectDatasets
      .slice()
      .sort(
        (a, b) =>
          new Date(a.dataset.lastExecutionTimestamp ?? '').getUTCDate() -
          new Date(b.dataset.lastExecutionTimestamp ?? '').getUTCDate()
      )
      .forEach((d, i) => {
        // If index is greater than 1, it means that there is a duplicate, so we use the dataset name and areas
        const title =
          i > 1
            ? `${d.dataset.datasetName} ${modelDetails.selectedAreas.join(
                ', '
              )}`
            : d.datasetRole.toLowerCase() === 'sales'
            ? `Sales ${modelDetails.selectedAreas.join(', ')}`
            : `Population ${modelDetails.selectedAreas[0]}`;

        cards.push({
          title: title,
          author:
            userDetails.find((u) => u.id === d.dataset.lastModifiedBy)
              ?.fullName ?? 'John Doe',
          date: d.dataset.lastExecutionTimestamp ?? '',
          image:
            d.datasetRole.toLowerCase() === 'population' ? population : sales,
          onClick: () =>
            history.push(`/models/results/${projectId}/${d.datasetId}`),
          onLockClick: (status: boolean) =>
            setDatasetLockStatus(d.datasetId, status),
          isLocked: d.dataset.isLocked,
          showLock: true,
          onMenuOptionClick: async (option): Promise<void> => {
            if (option.id === 0) {
              history.push(`/models/results/${projectId}/${d.datasetId}`);
            } else {
              await setDatasetLockStatus(d.datasetId, !d.dataset.isLocked);
            }
          },
          menuItems: [{ id: 0, label: 'Edit' }],
        });
      });
    return cards;
  };

  const setDatasetLockStatus = async (
    id: string,
    isLocked: boolean
  ): Promise<void> => {
    try {
      await setDatasetLockLevel(id, isLocked);
    } catch (error) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          text: 'Setting lock status failed',
          severity: 'error',
        });
      await loadProject();
    }
  };

  const deleteChart = async (
    chartId: number,
    datasetId: string
  ): Promise<void> => {
    const cloneModel = cloneDeep(modelDetails);

    const cloneModelDataset = cloneModel?.projectDatasets.find(
      (p) => p.datasetId === datasetId
    );

    if (!cloneModelDataset?.dataset || !cloneModel) return;
    cloneModelDataset.dataset.dependencies.interactiveCharts = cloneModelDataset?.dataset.dependencies.interactiveCharts?.filter(
      (c) => c.interactiveChartId !== chartId
    );

    cloneModel.projectDatasets = cloneModel?.projectDatasets.map((p) =>
      p.datasetId === datasetId ? cloneModelDataset : p
    );

    setModelDetails(cloneModel);

    try {
      const loader = new AxiosLoader<{}, {}>();
      await loader.PutInfo(
        `CustomSearches/DeleteInteractiveChart/${chartId}`,
        {},
        {}
      );
    } catch (error) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          text: 'Failed deleting chart',
          severity: 'error',
        });
      await loadProject();
    }
  };

  const getChartCards = (): Card[] => {
    const cards: Card[] = [];
    modelDetails?.projectDatasets.forEach((ds) =>
      ds?.dataset?.dependencies.interactiveCharts?.forEach((ic) =>
        cards.push({
          id: ic.interactiveChartId,
          title: ic.chartTitle,
          author:
            userDetails.find((u) => u.id === ds.dataset.createdBy)?.fullName ??
            'John Doe',
          date: `${ds.dataset.createdTimestamp}`,
          image: images[ic.chartType.toLowerCase()],
          onClick: (): void =>
            history.push(
              `/models/view-chart/${id}/${ic.datasetId}/${ic.interactiveChartId}`
            ),
          onMenuOptionClick: async (e): Promise<void> => {
            if (e.id === 1) {
              //Remame
            }
          },
          menuItems: [
            { id: 0, label: 'Edit Chart' },
            { id: 1, label: 'Rename', disabled: true },
            {
              id: 2,
              label: 'Delete',
              afterClickContent: DeleteAlert(
                () => deleteChart(ic.interactiveChartId, ds.datasetId),
                ic.chartTitle ?? 'chart'
              ),
              isAlert: true,
            },
          ],
        })
      )
    );
    return cards;
  };

  const getSyncDetails = (postProcessrole: string): SyncDetails | undefined => {
    if (!modelDetails || !modelDetails?.projectDatasets) return;
    const sales = modelDetails?.projectDatasets.find(
      (p) => p.datasetRole.toLowerCase() === 'sales'
    );

    if (
      !sales ||
      !sales.dataset ||
      !sales.dataset.dependencies ||
      !sales.dataset.dependencies.postProcesses
    )
      return;

    const postProcesses = sales?.dataset.dependencies.postProcesses.filter(
      (p) =>
        p.postProcessRole && p.postProcessRole.toLowerCase() === postProcessrole
    );

    const lastModiedDates = postProcesses.flatMap(
      (p) => p.lastModifiedTimestamp
    );

    if (!lastModiedDates || lastModiedDates.length === 0) return;

    const newestDate = lastModiedDates.reduce(function (a, b) {
      return a > b ? a : b;
    });

    const user = postProcesses.find(
      (p) => p.lastExecutionTimestamp === newestDate.toString()
    )?.lastModifiedBy;

    return {
      lastSyncBy:
        userDetails.find((u) => u.id === user)?.fullName ?? 'John Doe',
      lastSyncOn: new Date(newestDate + "Z").toLocaleString(),
    };
  };

  const getLink = (
    postProcessRole: string,
    postProcess: PostProcess
  ): string => {
    switch (postProcessRole.toLowerCase()) {
      case 'timetrendregression':
        return `/models/regression/${id}/${postProcess.datasetPostProcessId}/`;
      case 'multipleregression':
        return `/models/estimated_market_regression/${id}/${postProcess.datasetPostProcessId}/`;
      case 'waterfrontschedule':
        return `/models/new-land-model/${id}`;
      case 'appraiserratiosreport':
        return '';
      case 'supplementalandexception':
        return `/models/supplementals_edit/${id}/${postProcess.datasetPostProcessId}`;
      case 'annualupdateadjustment':
        return `/models/annual_update/${id}/${postProcess.datasetPostProcessId}`;
    }
    return '';
  };

  const deletePostProcess = async (
    id: React.ReactText,
    datasetId: string
  ): Promise<void> => {
    const cloneModel = cloneDeep(modelDetails);

    const cloneModelDataset = cloneModel?.projectDatasets.find(
      (p) => p.datasetId === datasetId
    );

    if (!cloneModelDataset?.dataset || !cloneModel) return;
    cloneModelDataset.dataset.dependencies.postProcesses = cloneModelDataset?.dataset.dependencies.postProcesses?.filter(
      (p) => p.datasetPostProcessId !== id
    );

    cloneModel.projectDatasets = cloneModel?.projectDatasets.map((p) =>
      p.datasetId === datasetId ? cloneModelDataset : p
    );

    setModelDetails(cloneModel);

    try {
      await deleteDatasetPostProcess(id);
    } catch (error) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          text: 'Deleting postprocess failed',
          severity: 'error',
        });
      await loadProject();
    }
  };

  const getCards = (
    postProcessRole: string,
    noPostProcesses?: boolean,
    onlyPopulation = false
  ): Card[] => {
    const cards: Card[] = [];
    if (!modelDetails || !modelDetails.projectDatasets) return [];

    const sales = modelDetails?.projectDatasets.find(
      (p) =>
        p.datasetRole.toLowerCase() ===
        (onlyPopulation ? 'population' : 'sales')
    );

    if (
      !sales ||
      !sales.dataset ||
      !sales.dataset.dependencies ||
      !sales.dataset.dependencies.postProcesses
    )
      return [];

    const postProcess = sales.dataset.dependencies.postProcesses.filter(
      (p) =>
        (p.postProcessRole && p.postProcessRole.toLowerCase()) ===
          postProcessRole.toLowerCase() &&
        p.postProcessType.toLowerCase() ===
          (['supplementalandexception', 'annualupdateadjustment'].includes(
            postProcessRole.toLowerCase()
          ) || postProcessRole.toLowerCase() === 'waterfrontschedule'
            ? 'exceptionpostprocess'
            : 'rscriptpostprocess')
    );

    if (!postProcess) return [];

    const getCardTitle = (pp: PostProcess): string => {
      if (pp.postProcessRole?.toLowerCase() === 'waterfrontschedule')
        return 'Land Schedule';
      return pp?.postProcessName || '';
    };

    postProcess.forEach((p) => {
      let payload: RegressionDetails | undefined = undefined;
      try {
        payload = JSON.parse(p.resultPayload) as RegressionDetails;
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            severity: 'error',
            text: 'Error getting suplemental regression',
          });
      }

      if (!noPostProcesses) {
        cards.push({
          title: getCardTitle(p) ?? 'Card title',
          author:
            userDetails.find((u) => u.id === p.createdBy)?.fullName ??
            'John Doe',
          date: `${p.createdTimestamp}`,
          image: undefined,
          onClick: (): void => history.push(getLink(postProcessRole, p)),
          onMenuOptionClick: async (m): Promise<void> => {
            if (m.id === 'edit') {
              history.push(getLink(postProcessRole, p));
            }
          },
          menuItems: [
            { id: 'edit', label: 'Edit' },
            {
              id: 'delete',
              label: 'Delete',
              afterClickContent: DeleteAlert(
                () => deletePostProcess(p.datasetPostProcessId, p.datasetId),
                p.postProcessName ?? 'post process'
              ),
              isAlert: true,
            },
          ],
          error:
            payload?.Status.toLowerCase() === 'failed'
              ? `Status: Failed - Reason: ${
                  payload.Reason ? payload.Reason : 'Unknown error'
                }`
              : undefined,
        });
      }

      if (!payload || payload.Status.toLowerCase() === 'failed') return cards;

      let reports: FileResult[] = [];
      reports =
        payload?.FileResults?.map((fr: FileResult) => ({
          ...fr,
          regressionDetails: payload,
        })) || [];

      const filteredReports = reports.filter(
        (r) => r.FileName.includes('.html') || r.FileName.includes('.pdf')
      );

      if (!filteredReports) return cards;

      filteredReports.forEach((f) => {
        cards.push({
          title: f.FileName,
          author:
            userDetails.find((u) => u.id === p.createdBy)?.fullName ??
            'John Doe',
          date: `${p.createdTimestamp}`,
          image: reportSvg,
          onClick: (): void => {
            history.push(
              `/models/reports/${id}/${p.datasetPostProcessId}/${f.FileName}`
            );
            appContext.setPostProcessName &&
              appContext.setPostProcessName(null);
          },
          onMenuOptionClick: async (m): Promise<void> => {
            if (m.id === 0) {
              history.push(
                `/models/reports/${id}/${p.datasetPostProcessId}/${f.FileName}`
              );
              appContext.setPostProcessName &&
                appContext.setPostProcessName(null);
            }
          },
          menuItems: [
            { id: 0, label: 'Open' },
            {
              id: 1,
              label: 'Delete',
              disabled: postProcessRole !== 'appraisalratioreport',
              afterClickContent: DeleteAlert(
                () => deletePostProcess(p.datasetPostProcessId, p.datasetId),
                p.postProcessName ?? 'report'
              ),
              isAlert: true,
            },
          ],
        });
      });
    });

    return cards;
  };

  const DeleteAlert = (
    onConfirm: () => Promise<void>,
    type: string
  ): JSX.Element => (
    <Alert
      okButtonClick={async (): Promise<void> => {
        await onConfirm();
      }}
      contentText={`Delete will permanently erase ${type}`}
      okButtonText="Delete"
    />
  );

  const getNewestChart = (): SyncDetails | undefined => {
    const salesDataset = modelDetails?.projectDatasets.find(
      (ds) => ds.datasetRole.toLowerCase() === 'sales'
    );
    if (
      !salesDataset ||
      !salesDataset.dataset.dependencies.interactiveCharts ||
      salesDataset.dataset.dependencies.interactiveCharts.length === 0
    )
      return;

    const newestChart = salesDataset.dataset.dependencies.interactiveCharts.reduce(
      (r, o) => (o.lastModifiedTimestamp > r.lastModifiedTimestamp ? o : r)
    );

    return {
      lastSyncBy:
        userDetails.find((u) => u.id === newestChart.lastModifiedBy)
          ?.fullName ?? 'John Doe',
      lastSyncOn: new Date(newestChart.lastModifiedTimestamp + "Z").toLocaleString(),
    };
  };

  const getNewestRegression = (): SyncDetails | undefined => {
    const dataset = modelDetails?.projectDatasets.find(
      (ds) => ds.dataset.dependencies.postProcesses !== null
    );
    if (
      !dataset ||
      !dataset.dataset.dependencies.postProcesses ||
      dataset.dataset.dependencies.postProcesses.length === 0
    )
      return;

    const newestRegression = dataset.dataset.dependencies.postProcesses.reduce(
      (r, o) => (o.lastModifiedTimestamp > r.lastModifiedTimestamp ? o : r)
    );

    return {
      lastSyncBy:
        userDetails.find((u) => u.id === newestRegression.lastModifiedBy)
          ?.fullName ?? 'John Doe',
      lastSyncOn: new Date(
        newestRegression.lastModifiedTimestamp + "Z"
      ).toLocaleString(),
    };
  };

  return (
    <ProjectContext.Provider
      value={{
        projectId,
        projectType,
        headerDetails,
        projectName,
        regression,
        setRegression,
        regressionData,
        comments,
        setComments,
        dataSourceSyncDetails,
        chartSyncDetails,
        regressionSyncDetails,
        reportSyncDetails,
        dataSourceCards,
        projectDetails,
        chartCards,
        modelDetails,
        userDetails,
        getSyncDetails,
        timeCards,
        multipleCards,
        landCards,
        annualCards,
        suppCards,
        appRatioCards,
        salesDatasetId,
      }}
    >
      {props.children}
    </ProjectContext.Provider>
  );
}

export const withProjectProvider = (Component: FC) => (
  props: object
): JSX.Element => (
  <ProjectProvider>
    <Component {...props} />
  </ProjectProvider>
);
