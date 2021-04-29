// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import GetAppIcon from '@material-ui/icons/GetApp';
import Loading from 'components/Loading';

import { PanelHeader } from '@ptas/react-ui-library';
import {
  GenericGridRowData,
  Project,
  ProjectDataset,
  SearchParameters,
  GenericDropdownType,
  IdOnly,
  PostProcess,
  ResultPayload,
  JobStateType,
} from 'services/map.typings';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import {
  getCalculatedVars,
  getDependentVars,
  getExpressionVars,
  getIndependentVars,
  LoadPostProcess,
  LoadProject,
} from '../../Regression/common';
import LinearRegression from '../../Regression/LinearRegression';
import AgGrid from 'components/Grid';
import { AxiosLoader } from 'services/AxiosLoader';

import AgGridService from 'services/AgGridService';
import { PlayArrowOutlined } from '@material-ui/icons';
import useSignalR from 'components/common/useSignalR';
import { AppContext } from 'context/AppContext';
import { SalesDropdown } from '../../Regression/SalesDropdown';
import { ProjectContext } from 'context/ProjectsContext';
import { ImportErrorMessageType } from 'components/ErrorMessage/ErrorMessage';
import { EmptyGrid } from 'components/Grid/EmptyGrid';

/**
 * Land
 *
 * @param props - Component props
 * @returns A JSX element
 */

interface UserInfo {
  email: string;
  fullName: string;
  id: string;
  roles: unknown;
  teams: unknown;
}

let timer: NodeJS.Timeout;

const debounceRequest = (callback: Function, wait = 0): Function => {
  return (...args: Record<string, unknown>[]): void => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
};

const randStr = (): string | (() => string) => `${Math.random()}`;

const ViewLandPage = (): JSX.Element => {
  const {
    id,
    regressionid,
  }: { id: string; regressionid: string } = useParams();
  const appContext = useContext(AppContext);
  const projectContext = useContext(ProjectContext);
  const [project, setProjectInfo] = useState<Project | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo[]>();
  const [datasetId, setDatasetId] = useState<string>('');
  //eslint-disable-next-line
  const [regression, setRegression] = useState<number>(0);
  const [gridData, setGridData] = useState<GenericGridRowData[]>([]);
  const [expressionPayload, setExpressionsPayload] = useState<
    GenericGridRowData[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [datasets, setDatasets] = useState<GenericDropdownType[]>([]);
  const [disableButton, setDisableButton] = useState<boolean>(true);
  const [formChanged, setFormChanged] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [lastKey, setLastKey] = useState(randStr());
  const [reloadKey, setReloadKey] = useState('');
  const [postProcessResult, setPostProcessResult] = useState<ResultPayload>();
  const location = useLocation<JobStateType>();
  const [, setFromParam] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<ImportErrorMessageType>();
  const [postProcessCorrect, setPostProcessCorrect] = useState<boolean>(false);
  const [jobId] = useState(location.state?.jobId || 0);

  const { message } = useSignalR(jobId);

  useEffect(() => {
    if (location.state?.from) {
      setFromParam(location.state?.from);
    }
  }, [location]);

  const reload = (): void => setLastKey(randStr());

  useEffect(() => {
    setReloadKey(lastKey + '.');
  }, [lastKey]);
  const history = useHistory();

  const [postProcess, setPostProcess] = useState<
    PostProcess | null | undefined
  >(null);
  const [updateRegression, setUpdateRegression] = useState<boolean>(false);

  const getJobStatus = async (): Promise<boolean> => {
    if (location?.state?.jobId && regression) {
      const jobStatus = await AgGridService.getJobStatus(location.state.jobId);
      const status = jobStatus?.jobStatus === 'Finished';
      // const status = false;
      if (!status) {
        const debounced = debounceRequest(getJobStatus, 1000);
        debounced();
      } else {
        setPostProcessCorrect(status);
        setUpdateRegression(false);
        setFromParam('');
        history.replace({
          state: {},
        });
        if (jobStatus?.jobResult.Status === 'Failed') {
          setErrorMessage({
            message: `${jobStatus.jobResult.Reason}`,
          });
        }
      }
      return status;
    }
    return false;
  };

  const fetchPostProcess = async (): Promise<void> => {
    const pp = await LoadPostProcess(regressionid);
    setPostProcess(pp);
    if (pp?.datasetId) {
      setDatasetId(pp?.datasetId);
    }
    if (pp?.resultPayload) setPostProcessResult(JSON.parse(pp?.resultPayload));
    if (pp?.isDirty) {
      setDisableButton(false);
      setIsDirty(true);
    }
  };

  useEffect(() => {
    if (datasetId) {
      if (datasetId !== postProcess?.datasetId) {
        setDisableButton(false);
        setFormChanged(true);
        reload();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  const fetchProject = async (): Promise<void> => {
    const project = await LoadProject(id, true);
    setProjectInfo(project.project);
    setDatasets(
      project.project.projectDatasets
        ?.filter((dataset: ProjectDataset) => dataset.datasetRole === 'Sales')
        .map((dataset: ProjectDataset) => {
          return {
            value: dataset.datasetId,
            label: 'Land' || dataset.datasetRole,
          };
        })
    );
    setUserInfo(project.usersDetails);
  };

  const callInit = (): void => {
    fetchProject();
    if (regressionid) {
      fetchPostProcess();
    }
    getUserProject();
    return clearTimeout(timer);
  };

  // useEffect(callProject, []);

  useEffect(callInit, []);

  const validateMessage = async (): Promise<void> => {
    if (!message) {
      const debounced = debounceRequest(getJobStatus, 5000);
      debounced();
    }
    if (message?.jobStatus?.length) {
      setPostProcessCorrect(true);
      setFromParam('');
      await getUserProject();
      history.replace({
        state: {},
      });
      if (updateRegression) {
        callInit();
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
    const dataset = project?.project?.projectDatasets?.find(
      (projectDataset: ProjectDataset) =>
        projectDataset?.datasetRole === 'Sales'
    );
    const postProcess = dataset.dataset?.dependencies?.postProcesses?.find(
      (pos: PostProcess) => pos?.datasetPostProcessId === parseInt(regressionid)
    );

    let result = null;
    if (postProcess?.resultPayload) {
      result = JSON.parse(postProcess.resultPayload);
    }

    if (result && result.Status.length) {
      setPostProcessCorrect(true);
    }
    if (postProcess?.rscriptModelId) {
      setRegression(postProcess.rscriptModelId);
    }
    if (result && result.Status === 'Success') {
      fetchPostProcess();
      setProjectInfo(project.project);
      setPostProcessResult(result);
    }
    if (result && result.Status === 'Failed') {
      setErrorMessage({
        message: result.Reason,
      });
    }
  };

  const runRegression = async (): Promise<void> => {
    if (runningRegression) return;

    if (!gridData) {
      appContext.setSnackBar?.({
        text: 'No form data.',
        severity: 'warning',
      });
      return;
    }

    setRunningRegression(true);

    const priorVars = getDependentVars(gridData);
    const postVars = getIndependentVars(gridData);
    const calculatedVars = getCalculatedVars(gridData);
    const expressionVars = getExpressionVars(expressionPayload);

    const customSearchExpressions = [
      ...priorVars,
      ...postVars,
      ...calculatedVars,
      ...expressionVars,
    ];

    const payload = {
      datasetId: datasetId,
      priority: 2000,
      postProcessName: 'Land Schedule',
      rScriptModelId: regression,
      postProcessDefinition: 'RScript post process test',
      customSearchExpressions: customSearchExpressions,
      postProcessRole: 'LandRegression',
    };
    try {
      setLoading(true);
      if (formChanged) {
        const al1 = new AxiosLoader<IdOnly, {}>();
        await al1.PutInfo(
          'CustomSearches/ImportRScriptPostProcess',
          payload,
          {}
        );
        const ad2 = new AxiosLoader<IdOnly, {}>();
        const executePost = await ad2.PutInfo(
          `CustomSearches/ExecuteDatasetPostProcess/${payload.datasetId}/${regressionid}`,
          [
            {
              Id: 0,
              Name: '',
              Value: '',
            },
          ],
          {}
        );
        appContext.handleJobId?.(parseInt(`${executePost?.id}`));
        const url = `/models/new-land-model/${id}`;
        history.push(url);
      }
      if (isDirty && !formChanged) {
        const ad2 = new AxiosLoader<IdOnly, {}>();
        const executePost = await ad2.PutInfo(
          `CustomSearches/ExecuteDatasetPostProcess/${payload.datasetId}/${regressionid}`,
          [
            {
              Id: 0,
              Name: '',
              Value: '',
            },
          ],
          {}
        );
        appContext?.handleJobId?.(parseInt(`${executePost?.id}`));
        setUpdateRegression(true);
      }
      setErrorMessage(undefined);
      callInit();
    } catch (e) {
      setErrorMessage({
        message: e?.message,
        reason: e?.validationError || [],
      });
    } finally {
      setRunningRegression(false);
      setLoading(false);
    }
  };

  const defaultIcons = [
    {
      icon: <PlayArrowOutlined />,
      text: 'Calculate regression',
      onClick: (): Promise<void> => {
        return runRegression();
      },
      disabled: disableButton,
    },
    {
      icon: <GetAppIcon />,
      text: 'Export',
      onClick: (): void => {
        // return runRegression();
      },
    },
  ];

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
      userInfo.find((u) => u.id === project.userId)?.fullName ?? project.userId
    }`;
  };

  const getFormData = (
    regression: number,
    gridData: GenericGridRowData[],
    expressionPayload: GenericGridRowData[],
    _params: SearchParameters[] | undefined
  ): void => {
    setRegression(regression);
    setGridData(gridData);
    setExpressionsPayload(expressionPayload);
  };

  const renderGrid = (): JSX.Element => {
    if (postProcess && postProcessCorrect && gridData.length) {
      return (
        <AgGrid
          height={'450px'}
          id={datasetId}
          reloadGrid={reload}
          key={reloadKey}
          postProcessId={regressionid}
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
    //     id={`${projectContext?.salesDatasetId}`}
    //     key={`${projectContext?.salesDatasetId}`}
    //     reloadGrid={reload}
    //     showSpinner={false}
    //   ></AgGrid>
    // );
  };

  const getDatasetId = (id: string): void => {
    setDatasetId(id);
  };

  const changeGrid = (): void => {
    setDisableButton(false);
    setFormChanged(true);
  };

  if (
    loading ||
    (!project && !postProcess) ||
    updateRegression ||
    projectContext?.salesDatasetId?.length === 0 ||
    projectContext?.salesDatasetId === undefined ||
    !postProcessCorrect
  )
    return <Loading />;

  return (
    <Fragment>
      <PanelHeader
        route={[
          <Link to="/models" style={{ color: 'black' }}>
            Models
          </Link>,
          <Link to={`/models/view/${id}`} style={{ color: 'black' }}>
            {project?.projectName}
          </Link>,
          <Link to={`/models/new-land-model/${id}`} style={{ color: 'black' }}>
            Land Model
          </Link>,
          <span>Regression analysis</span>,
        ]}
        icons={defaultIcons}
        // detailTop={getDetailTop()}
        detailBottom={getBottom()}
      />
      <SalesDropdown options={datasets} getDatasetId={getDatasetId} />
      <LinearRegression
        id={id}
        regression={regression}
        regressionid={regressionid}
        postProcessResult={postProcessResult}
        modelDetails={project}
        getFormData={getFormData}
        // useDropdownDataset
        // datasets={datasets}
        datasetId={datasetId}
        useLandRegression
        // getDatasetId={getDatasetId}
        viewReport={true}
        variableGridData={postProcess?.customSearchExpressions}
        postProcess={postProcess}
        changeGrid={changeGrid}
        errorMessage={errorMessage}
        usePostProcessRegression={true}
      />
      <div className="TimeTrend-maingrid">{renderGrid()}</div>
    </Fragment>
  );
};

export default ViewLandPage;
