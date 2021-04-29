// AddRegression.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useContext, useEffect, useState } from 'react';

import PlayArrowOutlined from '@material-ui/icons/PlayArrowOutlined';
import Loading from 'components/Loading';
import LinearRegression from './LinearRegression';
import {
  GenericGridRowData,
  JobStateType,
  PostProcess,
  Project,
  ProjectDataset,
  ResultPayload,
  SearchParameters,
  GenericDropdownType,
  RegressionRoleType,
} from 'services/map.typings';
import { Link, useParams, useLocation } from 'react-router-dom';
import {
  LoadProject,
  LoadPostProcess,
  runImportRScript,
  getTimeTrendCustomSearchExpressions,
} from './common';
import AgGrid from 'components/Grid';
import '../../../../assets/time-trend-styles/styles.scss';
import { PanelHeader } from '@ptas/react-ui-library';
import AgGridService from 'services/AgGridService';
import { ProjectContext } from 'context/ProjectsContext';
import useSignalR from 'components/common/useSignalR';
import { AppContext } from 'context/AppContext';
import { SalesDropdown } from './SalesDropdown';
import { executeDatasetPostProcess } from '../Projects/Land/services/landServices';
import { ImportErrorMessageType } from 'components/ErrorMessage/ErrorMessage';
import { EmptyGrid } from 'components/Grid/EmptyGrid';

const randStr = (): string | (() => string) => `${Math.random()}`;

let timer: NodeJS.Timeout;

const debounceRequest = (callback: Function, wait = 0): Function => {
  return (...args: Record<string, unknown>[]): void => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
};

interface UserInfo {
  email: string;
  fullName: string;
  id: string;
  roles: unknown;
  teams: unknown;
}

const AddRegression = (): JSX.Element => {
  const {
    id,
    regressionid,
  }: { id: string; regressionid: string } = useParams();
  const location = useLocation<JobStateType>();
  const [project, setProjectInfo] = useState<Project | null | undefined>(null);

  const [postProcess, setPostProcess] = useState<
    PostProcess | null | undefined
  >(null);

  const context = useContext(ProjectContext);
  const appContext = useContext(AppContext);
  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [regression, setRegression] = useState<number>(0);
  const [gridData, setGridData] = useState<GenericGridRowData[]>([]);
  const [lastKey, setLastKey] = useState(randStr());
  const [reloadKey, setReloadKey] = useState('');
  const [datasetId, setDatasetId] = useState<string>('');
  const [datasets, setDatasets] = useState<GenericDropdownType[]>([]);
  // const [postProcessState, setPostProcessState] = useState<string>('');
  const [userInfo, setUserInfo] = useState<UserInfo[]>();
  const [postProcessResult, setPostProcessResult] = useState<ResultPayload>();
  const [expressionPayload, setExpressionsPayload] = useState<
    GenericGridRowData[]
  >([]);
  const [rowData, setRowData] = useState<GenericGridRowData[]>([]);
  const [parameterState, setParameterState] = useState<
    SearchParameters[] | undefined
  >([]);
  const [postProcessCorrect, setPostProcessCorrect] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ImportErrorMessageType>();
  const [disableButton, setDisableButton] = useState<boolean>(true);
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [updateRegression, setUpdateRegression] = useState<boolean>(false);
  const [jobId, setJobId] = useState<number>(location?.state?.jobId | 0);

  const [isDirty, setIsDirty] = useState<boolean>(false);

  const reload = (): void => setLastKey(randStr());
  const { message } = useSignalR(jobId);

  useEffect(() => {
    setReloadKey(lastKey + '.');
  }, [lastKey]);

  const fetchPostProcess = async (): Promise<void> => {
    const pp = await LoadPostProcess(regressionid);
    setPostProcess(pp);
    if (pp?.datasetId) setDatasetId(pp?.datasetId);
    if (pp?.isDirty) {
      setDisableButton(false);
      setIsDirty(true);
    }
    if (pp?.resultPayload?.length) {
      setPostProcessResult(JSON.parse(pp.resultPayload));
    }
  };

  const callPostProcessData = (): void => {
    fetchPostProcess();
  };

  // useEffect(() => {
  //   getDatasetStatus();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [postProcess]);

  // const getDatasetStatus = async (): Promise<void> => {
  //   if (postProcess) {
  //     const datasetStatus = await AgGridService.getDataSetStatus(
  //       postProcess?.datasetId,
  //       parseInt(regressionid)
  //     );
  //     const status = datasetStatus?.datasetPostProcessState !== 'Processed';
  //     const datasetState = datasetStatus?.datasetState !== 'Processed';
  //     setRunningRegression(datasetState);
  //     if (!status) {
  //       setPostProcessState('Processed');
  //     }
  //   }
  // };

  const fetchProjectData = async (): Promise<void> => {
    const project = await LoadProject(id, true);
    setProjectInfo(project.project);
    setUserInfo(project.usersDetails);
  };

  const callProjectData = (): void => {
    fetchProjectData();
  };

  const callAllData = (): void => {
    getUserProject();
    callProjectData();
    callPostProcessData();
    return clearTimeout(timer);
  };

  useEffect(callAllData, []);

  const validateMessage = async (): Promise<void> => {
    if (!message) {
      const debounced = debounceRequest(getJobStatus, 5000);
      debounced();
    }
    if (message?.jobStatus?.length) {
      setPostProcessCorrect(true);
      await getUserProject();
      if (message?.jobStatus === 'Succeeded') {
        await fetchPostProcess();
      }
      if (updateRegression) {
        await getUserProject();
        await callProjectData();
        await callPostProcessData();
      }
      setUpdateRegression(false);
    }
  };

  const callValidateMessage = (): void => {
    validateMessage();
  };

  useEffect(callValidateMessage, [message]);

  const getUserProject = async (): Promise<void> => {
    const project = await LoadProject(id, true);
    const postProcessFound = project?.project?.projectDatasets
      ?.find(
        (projectDataset: ProjectDataset) =>
          projectDataset?.datasetRole === 'Sales'
      )
      ?.dataset?.dependencies?.postProcesses?.find(
        (pos: PostProcess) =>
          pos?.datasetPostProcessId === parseInt(regressionid)
      );

    const datasets =
      project?.project?.projectDatasets.filter(
        (ds: ProjectDataset) => ds.datasetRole === 'Sales'
      ) || [];

    setDatasets(
      datasets.map((dataset: ProjectDataset) => ({
        label: dataset.datasetRole,
        value: dataset.datasetId,
      }))
    );

    let result = null;
    if (postProcessFound?.resultPayload) {
      result = JSON.parse(postProcessFound?.resultPayload);
    }
    if (result && result.Status.length) {
      setPostProcessCorrect(true);
    }
    console.log(`postProcessFound`, postProcessFound);
    setRegression(postProcessFound?.rscriptModelId);
    setProjectInfo(project.project);
    if (result && result.Status === 'Success') {
      setPostProcessResult(JSON.parse(postProcessFound?.resultPayload));
      // setPostProcessState('Processed');
    }
    if (result && result.Status === 'Failed') {
      setErrorMessage({
        message: `${result.Reason}`,
      });
    }
  };

  const getJobStatus = async (): Promise<boolean> => {
    if (location?.state?.jobId && regression) {
      const jobStatus = await AgGridService.getJobStatus(location.state.jobId);
      const status = jobStatus?.jobStatus === 'Finished';
      if (!status) {
        const debounced = debounceRequest(
          getJobStatus,
          parseInt(`${process.env.REACT_APP_SIGNALR_TIMEOUT}`)
        );
        debounced();
      } else {
        if (jobStatus?.jobResult.Status === 'Failed') {
          setErrorMessage({
            message: `${jobStatus.jobResult.Reason}`,
          });
        }
        if (updateRegression) {
          await getUserProject();
          await callProjectData();
          await callPostProcessData();
        }
        setUpdateRegression(false);
        setPostProcessCorrect(status);
        getUserProject();
      }
      return status;
    }
    return false;
  };

  const runRegression = async (): Promise<void> => {
    if (runningRegression) return;

    if (!gridData) {
      appContext.setSnackBar?.({
        severity: 'error',
        text: 'No form data.',
      });
      return;
    }
    setRunningRegression(true);

    const customSearchExpressions = getTimeTrendCustomSearchExpressions(
      gridData,
      parameterState,
      expressionPayload
    );

    const payload = {
      datasetId: datasetId,
      postProcessName: 'Time Trend Regression',
      priority: 1000,
      rScriptModelId: regression,
      postProcessDefinition: 'RScript post process test',
      customSearchExpressions: customSearchExpressions,
      postProcessRole: RegressionRoleType.TimeTrendRegression,
    };

    try {
      if (formChanged) {
        await runImportRScript(payload);
        const executePost = await executeDatasetPostProcess(
          `${payload.datasetId}`,
          `${regressionid}`
        );
        setJobId(parseInt(`${executePost?.id}`));
      }
      if (isDirty && !formChanged) {
        const executePost = await executeDatasetPostProcess(
          `${payload.datasetId}`,
          `${regressionid}`
        );
        setJobId(parseInt(`${executePost?.id}`));
      }
      setErrorMessage(undefined);
      setUpdateRegression(true);
    } catch (e) {
      setErrorMessage({
        message: e.message,
        reason: e.validationError || '',
      });
      setRowData(gridData);
    } finally {
      setRunningRegression(false);
    }
  };

  const defaultIcons = [
    {
      icon: <PlayArrowOutlined />,
      text: 'Calculate Regression',
      onClick: (): Promise<void> => {
        return runRegression();
      },
      disabled: disableButton,
    },
  ];
  const getFormData = (
    regression: number,
    gridData: GenericGridRowData[],
    expressionPayload: GenericGridRowData[],
    params: SearchParameters[] | undefined
  ): void => {
    setRegression(regression);
    setGridData(gridData);
    setExpressionsPayload(expressionPayload);
    setParameterState(params);
  };

  const getBottom = (): string => {
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

  // const getDetailTop = (): string => {
  //   if (!project) return '';

  //   const population = project?.projectDatasets.find(
  //     (ds: ProjectDataset) => ds.datasetRole.toLowerCase() === 'population'
  //   );
  //   const sales = project?.projectDatasets.find(
  //     (ds) => ds.datasetRole.toLowerCase() === 'sales'
  //   );

  //   return `Sales: ${sales?.dataset.totalRows || 'NA'}   |  Population:  ${
  //     population?.dataset.totalRows || 'NA'
  //   }  | Area(s):  ${project?.selectedAreas?.join(', ')}`;
  // };

  const changeGrid = (): void => {
    setDisableButton(false);
    setFormChanged(true);
  };

  const renderGrid = (): JSX.Element => {
    if (postProcess && postProcessCorrect && gridData.length) {
      return (
        <AgGrid
          height={'450px'}
          id={postProcess.datasetId}
          reloadGrid={reload}
          key={reloadKey}
          postProcessId={postProcess.datasetPostProcessId.toString()}
          gridVariableData={gridData}
          showSpinner={false}
          externalUse={true}
        ></AgGrid>
      );
    }
    return <EmptyGrid />;
    // return (
    //   <AgGrid
    //     height={'450px'}
    //     id={`${context.salesDatasetId}`}
    //     key={`${context.salesDatasetId}`}
    //     showSpinner={false}
    //   ></AgGrid>
    // );
  };

  const getDatasetId = (datasetId: string): void => {
    setDatasetId(datasetId);
  };

  //eslint-disable-next-line
  if (
    (!project && !postProcess) ||
    !context.modelDetails ||
    runningRegression ||
    updateRegression ||
    context.salesDatasetId?.length === 0 ||
    context.salesDatasetId === undefined ||
    !postProcessCorrect
  )
    return <Loading />;

  return (
    <div>
      <PanelHeader
        route={[
          <Link to="/models" style={{ color: 'black' }}>
            Models
          </Link>,
          <Link to={`/models/view/${id}`} style={{ color: 'black' }}>
            {project?.projectName}
          </Link>,
          <Link
            to={`/models/regression/${id}/${regressionid}`}
            style={{ color: 'black' }}
          >
            {postProcess?.postProcessName}
          </Link>,
        ]}
        icons={defaultIcons}
        // detailTop={getDetailTop()}
        detailBottom={getBottom()}
      />
      <SalesDropdown
        options={datasets}
        getDatasetId={getDatasetId}
        datasetId={datasetId}
      />
      <LinearRegression
        id={id}
        regression={regression}
        regressionid={regressionid}
        postProcessResult={postProcessResult}
        modelDetails={context.modelDetails}
        getFormData={getFormData}
        viewReport={true}
        variableGridData={postProcess?.customSearchExpressions}
        rowData={rowData}
        postProcess={postProcess}
        changeGrid={changeGrid}
        errorMessage={errorMessage}
        regressionType="Time Trend:"
        usePostProcessRegression={true}
        // useDropdown={true}
      />
      <div className="TimeTrend-maingrid">{renderGrid()}</div>
    </div>
  );
};
export default AddRegression;
