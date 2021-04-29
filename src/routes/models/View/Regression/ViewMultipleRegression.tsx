// ViewMultipleRegression.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';

import PlayArrowOutlined from '@material-ui/icons/PlayArrowOutlined';
import Loading from 'components/Loading';
import {
  GenericGridRowData,
  IdOnly,
  PostProcess,
  Project,
  ProjectDataset,
  ResultPayload,
  ResultDefinitionType,
  JobStateType,
  GenericDropdownType,
} from 'services/map.typings';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  getDependentVars,
  LoadProject,
  getIndependentVars,
  getCalculatedVars,
  LoadPostProcess,
  getMultipleCustomExpressions,
  fetchMultipleRegressionsType,
  getHidenVars,
} from './common';
import { AxiosLoader } from 'services/AxiosLoader';

import AgGrid from 'components/Grid';
import '../../../../assets/time-trend-styles/styles.scss';
import { PanelHeader } from '@ptas/react-ui-library';
import GenericGrid from 'components/GenericGrid/GenericGrid';
import { InputLabel, Grid, makeStyles } from '@material-ui/core';
import moment from 'moment';
import { AppContext } from 'context/AppContext';
import AgGridService from 'services/AgGridService';
import useSignalR from 'components/common/useSignalR';
import { SalesDropdown } from './SalesDropdown';
import ErrorMessage, {
  ImportErrorMessageType,
} from 'components/ErrorMessage/ErrorMessage';
import { ProjectContext } from 'context/ProjectsContext';
import { getPredictedEcuation } from '../Projects/Land/services/landServices';
import { EmptyGrid } from 'components/Grid/EmptyGrid';

interface UserInfo {
  email: string;
  fullName: string;
  id: string;
  roles: unknown;
  teams: unknown;
}

const useStyles = makeStyles({
  ecuation: {
    fontSize: 16,
    fontWeight: 500,
    marginLeft: -16,
  },
  results: {
    display: 'flex',
    flexDirection: 'row'
  }
});

let timer: NodeJS.Timeout;

const debounceRequest = (callback: Function, wait = 0): Function => {
  return (...args: Record<string, unknown>[]): void => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
};

interface MultipleExpressionsType {
  rowData?: GenericGridRowData[];
  expressionPayload?: GenericGridRowData[];
}

const randStr = (): string | (() => string) => `${Math.random()}`;

const ViewMultipleRegression = (): JSX.Element => {
  const {
    id,
    regressionid,
  }: { id: string; regressionid: string } = useParams();
  const classes = useStyles();
  const location = useLocation<JobStateType>();
  const [project, setProjectInfo] = useState<Project | null>(null);
  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [updateRegression, setUpdateRegression] = useState<boolean>(false);
  const [jobId, setJobId] = useState<number>(location.state?.jobId | 0);

  const [userInfo, setUserInfo] = useState<UserInfo[]>();
  const [lastKey, setLastKey] = useState(randStr());
  const [reloadKey, setReloadKey] = useState('');
  const [gridData, setGridData] = useState<GenericGridRowData[]>([]);
  const [datasetId, setDatasetId] = useState<string>('');
  const [datasets, setDatasets] = useState<GenericDropdownType[]>([]);
  const [postProcessCorrect, setPostProcessCorrect] = useState<boolean>(false);
  const [rowData, setRowData] = useState<GenericGridRowData[]>([]);
  const [postProcess, setPostProcess] = useState<PostProcess | null>(null);
  const [errorMessage, setErrorMessage] = useState<ImportErrorMessageType>();
  const [predictedEcuation, setPredictedEcuation] = useState<string>('');
  // const [expressionPayload, setExpressionPayload] = useState<
  //   GenericGridRowData[]
  // >([]);
  const [postProcessResult, setPostProcessResult] = useState<ResultPayload>();
  const [regression, setRegression] = useState<number>(0);
  const appContext = useContext(AppContext);
  const projectContext = useContext(ProjectContext);
  const [regressionType, setRegressionType] = useState<
    ResultDefinitionType[]
  >();

  const { message } = useSignalR(jobId);

  const reload = (): void => setLastKey(randStr());

  useEffect(() => {
    setReloadKey(lastKey + '.');
  }, [lastKey]);

  const fetchProjectData = (): void => {
    getUserProject();
    return clearTimeout(timer);
  };

  useEffect(fetchProjectData, []);

  const verifySignalRMessage = async (): Promise<void> => {
    if (!message) {
      const debounced = debounceRequest(getJobStatus, 5000);
      debounced();
    }
    if (message?.jobStatus?.length) {
      await getUserProject();
      setPostProcessCorrect(true);
      setUpdateRegression(false);
    }
  };

  const callVerifySignalRMessage = (): void => {
    verifySignalRMessage();
  };

  useEffect(callVerifySignalRMessage, [message]);

  const getJobStatus = async (): Promise<boolean> => {
    if (location?.state?.jobId) {
      const jobStatus = await AgGridService.getJobStatus(location.state.jobId);
      const status = jobStatus?.jobStatus === 'Finished';
      // const status = false;
      if (!status) {
        const debounced = debounceRequest(
          getJobStatus,
          parseInt(`${process.env.REACT_APP_SIGNALR_TIMEOUT}`)
        );
        debounced();
      } else {
        if (jobStatus?.jobResult?.Status === 'Failed') {
          setErrorMessage({
            message: `${jobStatus?.jobResult.Reason}`,
          });
        }
        await getUserProject();
        setPostProcessCorrect(status);
        setUpdateRegression(false);
      }
      return status;
    }
    return false;
  };

  const getUserProject = async (): Promise<void> => {
    const project = await LoadProject(id, true);
    setUserInfo(project.usersDetails);
    const pp = project?.project?.projectDatasets
      ?.find(
        (projectDataset: ProjectDataset) =>
          projectDataset?.datasetRole === 'Sales'
      )
      ?.dataset?.dependencies?.postProcesses?.find(
        (pos: PostProcess) =>
          pos?.datasetPostProcessId === parseInt(regressionid)
      );

    let result = null;
    if (pp) {
      if (pp.resultPayload) {
        result = JSON.parse(pp.resultPayload);
      }
      if (result && result?.Status === 'Success') {
        setPostProcessResult(JSON.parse(pp.resultPayload));
        setErrorMessage(undefined);
        const ecuation = await getPredictedEcuation(parseInt(regressionid));
        if (ecuation?.predictedEquation)
          setPredictedEcuation(ecuation?.predictedEquation);
      }
      if (result && result.Status.length) {
        setPostProcessCorrect(true);
      }
      if (result && result?.Status === 'Failed') {
        setErrorMessage({
          message: `${result.Reason}`,
        });
      }
      setProjectInfo(project.project);
      if (pp.rscriptModelId) {
        setRegression(pp.rscriptModelId);
      }
    }
  };

  const fetchPostProcessData = async (): Promise<void> => {
    const pp = await LoadPostProcess(regressionid);
    const regressionInfo = await fetchMultipleRegressionsType();
    setRegressionType(regressionInfo?.resultDefinitions);
    setPostProcess(pp);
    let data: MultipleExpressionsType | null = null;
    if (pp?.customSearchExpressions?.length) {
      data = getMultipleCustomExpressions(pp?.customSearchExpressions);
    }
    if (data) {
      setRowData(data?.rowData || []);
      // setExpressionPayload(data?.expressionPayload || []);
    }
  };

  const fetchCallPostProcess = (): void => {
    if (regressionid) {
      fetchPostProcessData();
    }
  };

  useEffect(fetchCallPostProcess, [regressionid]);

  const fetchData = async (): Promise<void> => {
    const project = await LoadProject(id);
    const d = project?.projectDatasets.find(
      (ds: ProjectDataset) => ds.datasetRole === 'Sales'
    )?.datasetId;

    const datasets =
      project?.projectDatasets.filter(
        (ds: ProjectDataset) => ds.datasetRole === 'Sales'
      ) || [];

    setDatasets(
      datasets.map((dataset: ProjectDataset) => ({
        label: dataset.datasetRole,
        value: dataset.datasetId,
      }))
    );

    if (!d) {
      appContext?.setSnackBar?.({
        severity: 'error',
        text: 'This model does not have a sales dataset.',
      });
      return;
    }
    setDatasetId(d);
  };

  const fetchCall = (): void => {
    fetchData();
  };

  useEffect(fetchCall, [id]);

  const runRegression = async (): Promise<void> => {
    if (runningRegression) return;

    if (!gridData) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          severity: 'error',
          text: 'No form data.',
        });
      return;
    }
    const priorVars = getDependentVars(gridData);
    const postVars = getIndependentVars(gridData);
    const calculatedVars = getCalculatedVars(gridData);
    // const expressionVars = getExpressionVars(expressionPayload);
    const expressionVars = getHidenVars(priorVars, postVars);

    if (priorVars.length === 0) {
      appContext.setSnackBar?.({
        text: 'There need to be 1 dependent variable only to run regression',
        severity: 'warning',
      });
      return;
    }

    if (postVars.length === 0) {
      appContext.setSnackBar?.({
        text:
          'There needs to be at least 1 independent variable to run regression',
        severity: 'warning',
      });
      return;
    }

    const customSearchExpressions = [
      ...priorVars,
      ...postVars,
      ...calculatedVars,
      ...expressionVars,
    ];

    const payload = {
      datasetId: datasetId,
      postProcessName: 'Estimated market value regression',
      priority: 3000,
      rScriptModelId: regression,
      postProcessDefinition: 'RScript post process test',
      customSearchExpressions: customSearchExpressions,
      postProcessRole: 'MultipleRegression',
    };
    try {
      setRunningRegression(true);
      const al1 = new AxiosLoader<IdOnly, {}>();
      const postProcessInfo = await al1.PutInfo(
        'CustomSearches/ImportRScriptPostProcess',
        payload,
        {}
      );
      const ad2 = new AxiosLoader<IdOnly, {}>();
      const executePost = await ad2.PutInfo(
        `CustomSearches/ExecuteDatasetPostProcess/${payload.datasetId}/${postProcessInfo?.id}`,
        [
          {
            Id: 0,
            Name: '',
            Value: '',
          },
        ],
        {}
      );

      setJobId(parseInt(`${executePost?.id}`));
      setErrorMessage(undefined);
      setUpdateRegression(true);
      fetchCallPostProcess();
      fetchProjectData();
    } catch (e) {
      setRowData(gridData);
      setErrorMessage({
        message: e?.message,
        reason: e?.validationError || [],
      });
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
    },
  ];

  const saveColData = (): boolean => {
    return true;
  };

  const updateColData = (newData: GenericGridRowData[]): void => {
    setGridData(newData);
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
      userInfo.find((u) => u.id === project.userId)?.fullName ?? project.userId
    }`;
  };

  const renderGrid = (): JSX.Element => {
    if (postProcess && postProcessCorrect && gridData.length) {
      return (
        <AgGrid
          height={'450px'}
          id={datasetId}
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
    //     id={`${projectContext.salesDatasetId}`}
    //     showSpinner={false}
    //   ></AgGrid>
    // );
  };

  const renderResult = (name: string): string => {
    if (name.toLowerCase() === 'intercept') {
      return renderIntercept();
    }
    if (name.toLowerCase() === 'coefficient') {
      return renderCoefficient();
    }
    return 'NA';
  };

  const renderCoefficient = (): string => {
    if (postProcessResult?.Results?.length) {
      if (postProcessResult?.Results[0].Coefficient) {
        return postProcessResult?.Results[0].Coefficient.toString();
      }
    }
    return 'To be Calculated';
  };

  const renderIntercept = (): string => {
    if (postProcessResult?.Results?.length) {
      if (postProcessResult?.Results[0].Intercept) {
        return postProcessResult?.Results[0].Intercept.toString();
      }
    }
    return 'To be Calculated';
  };

  const renderVariablesResult = (): JSX.Element => {
    const columns: ResultDefinitionType[][] = [];
    let counter = 0;
    let rdtemp: ResultDefinitionType[] = [];
    if (regressionType?.length)
      for (const rd of regressionType) {
        
        rdtemp.push(rd);
        counter++;
        if (counter === 4) {
          counter = 0;
          columns.push(rdtemp);
          rdtemp = [];
        }
      }
    return (
      <Fragment>
        {columns?.map((rd) => (
          <Grid sm={4}>
            {rd?.map((r: ResultDefinitionType) => (
              <InputLabel className="" id="label-for-dd">
                <strong>{r.name}:</strong>{' '}
                <span className="Result-strong">{renderResult(r.name)}</span>
              </InputLabel>
            ))}
          </Grid>
        ))}
      </Fragment>
    );
  };

  const renderReportSection = (): JSX.Element => {
    if (postProcessResult?.FileResults?.length) {
      return (
        <Grid sm={3} className="TimeTrend-results report">
          <InputLabel className="" id="label-for-dd">
            {postProcessResult?.FileResults?.filter(
              (file) =>
                file.FileName.includes('.html') && file.Type === 'Report'
            ).map((fileResult) => (
              <Link
                to={`/models/reports/${id}/${regressionid}/${fileResult.FileName}`}
                onClick={(): void =>
                  appContext.setPostProcessName &&
                  appContext.setPostProcessName(
                    postProcess?.postProcessName ?? null
                  )
                }
              >
                <span className="TimeTrend-report">{fileResult.Title}</span>
              </Link>
            ))}
          </InputLabel>
        </Grid>
      );
    }
    return <Fragment></Fragment>;
  };

  const getDatasetId = (datasetId: string): void => {
    setDatasetId(datasetId);
  };

  const renderEcuation = (): JSX.Element => {
    if (predictedEcuation.length) {
      return (
        <Grid sm={2}>
          <span className={classes.ecuation}>
            Predicted = {predictedEcuation}
          </span>
        </Grid>
      );
    }
    return <></>;
  };

  const renderRsQuaredResult = (name: string): string => {
    if (postProcessResult?.Results?.length) {
      const rsquearedResult = postProcessResult?.Results[1];
      if (name === 'AdjustedRSquared' && rsquearedResult.AdjustedRSquared)
        return rsquearedResult.AdjustedRSquared.toString();
      if (name === 'RSquared' && rsquearedResult.RSquared)
        return rsquearedResult.RSquared.toString();
    }
    return 'To be Calculated';
  };

  if (
    (!project && !postProcess) ||
    runningRegression ||
    updateRegression ||
    projectContext.salesDatasetId?.length === 0 ||
    projectContext.salesDatasetId === undefined ||
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
            {project?.projectName || 'Model'}
          </Link>,
          <Link
            to={`/models/estimated-market-regression/${id}/${regressionid}`}
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
      <Grid container className="TimeTrend-formWrapper mt-0">
        {renderEcuation()}
        <Grid sm={5} className="TimeTrend-results">
          <InputLabel className="" id="label-for-dd">
            <strong>
              ValuationDate:{' '}
              {moment(project?.assessmentDateTo).format('MM-DD-YYYY')}
            </strong>
          </InputLabel>
          <div className={classes.results}>{renderVariablesResult()}</div>
        </Grid>
        <Grid sm={2} className="TimeTrend-results">
          <InputLabel className="" id="label-for-dd">
            <strong>R-squared = </strong>{' '}
            <span className={'Result-strong'}>
              {renderRsQuaredResult('RSquared')}
            </span>
          </InputLabel>
          <InputLabel className="" id="label-for-dd">
            <strong>Adjusted R-squared = </strong>{' '}
            <span className={'Result-strong'}>
              {renderRsQuaredResult('AdjustedRSquared')}
            </span>
          </InputLabel>
        </Grid>
        {renderReportSection()}
      </Grid>
      <div className="TimeTrend-grid withBorder">
        <GenericGrid
          rowData={rowData}
          saveColData={saveColData}
          useDropdown={true}
          updateColData={updateColData}
          badExpressions={errorMessage?.reason}
        />
        <ErrorMessage message={errorMessage} />
      </div>
      <div className="TimeTrend-maingrid">{renderGrid()}</div>
    </div>
  );
};
export default ViewMultipleRegression;
