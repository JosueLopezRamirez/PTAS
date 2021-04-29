// MultipleRegression.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import ModelDetailsHeader from 'routes/models/ModelDetailsHeader';

import PlayArrowOutlined from '@material-ui/icons/PlayArrowOutlined';
import { ProjectContext } from 'context/ProjectsContext';
import Loading from 'components/Loading';
import {
  GenericGridRowData,
  IdOnly,
  Project,
  ProjectDataset,
  GenericDropdownType,
  // RegressionRoleType,
} from 'services/map.typings';
import { useHistory, useParams } from 'react-router-dom';
import {
  getDependentVars,
  getIndependentVars,
  getCalculatedVars,
  fetchMultipleRegressionExpressions,
  getHidenVars,
} from './common';
import { AxiosLoader } from 'services/AxiosLoader';
import AgGrid from 'components/Grid';
import '../../../../assets/time-trend-styles/styles.scss';
import GenericGrid from 'components/GenericGrid/GenericGrid';
import { getUserProject } from 'services/common';
import { AppContext } from 'context/AppContext';
import { SalesDropdown } from './SalesDropdown';
import ErrorMessage, {
  ImportErrorMessageType,
} from 'components/ErrorMessage/ErrorMessage';

const MultipleRegression = (): JSX.Element => {
  const { id }: { id: string } = useParams();
  const context = useContext(ProjectContext);
  const appContext = useContext(AppContext);
  const [project, setProjectInfo] = useState<Project | null | undefined>(null);
  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [regression, setRegression] = useState<number>(0);
  const [gridData, setGridData] = useState<GenericGridRowData[]>([]);
  const [datasetId, setDatasetId] = useState<string>('');
  const [datasets, setDatasets] = useState<GenericDropdownType[]>([]);
  const [rowData, setRowData] = useState<GenericGridRowData[]>([]);
  const [errorMessage, setErrorMessage] = useState<ImportErrorMessageType>();
  // const [expressionPayload, setExpressionPayload] = useState<
  //   GenericGridRowData[]
  // >([]);

  const history = useHistory();

  const fetchExpressions = (): void => {
    getData();
  };

  useEffect(fetchExpressions, []);

  const fetchProject = (): void => {
    fetchUserProject();
  };

  useEffect(fetchProject, [id]);

  const fetchUserProject = async (): Promise<void> => {
    try {
      const response = await getUserProject(id);
      setProjectInfo(response?.project);
      const d = response?.project?.projectDatasets.find(
        (ds: ProjectDataset) => ds.datasetRole === 'Sales'
      )?.datasetId;

      const datasets =
        response?.project?.projectDatasets.filter(
          (ds: ProjectDataset) => ds.datasetRole === 'Sales'
        ) || [];

      setDatasets(
        datasets.map((dataset) => ({
          label: dataset.datasetRole,
          value: dataset.datasetId,
        }))
      );

      if (!d) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            severity: 'error',
            text: 'This model does not have a sales dataset.',
          });
        return;
      }
      setDatasetId(d);
    } catch (error) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          severity: 'error',
          text: 'Getting user project failed',
        });
    }
  };

  const getData = async (): Promise<void> => {
    const regressionInfo = await fetchMultipleRegressionExpressions();
    if (regressionInfo?.data?.rowData) {
      setRowData(regressionInfo?.data?.rowData);
    }
    // if (regressionInfo?.data?.expressionPayload) {
    //   setExpressionPayload(regressionInfo?.data?.expressionPayload);
    // }
    if (regressionInfo?.regression) {
      setRegression(regressionInfo?.regression);
    }
  };

  const runRegression = async (): Promise<void> => {
    if (runningRegression) return;

    if (!gridData) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          text: 'No form data.',
          severity: 'warning',
        });
      return;
    }

    const priorVars = getDependentVars(gridData);
    const postVars = getIndependentVars(gridData);
    const calculatedVars = getCalculatedVars(gridData);
    const expressionVars = getHidenVars(priorVars, postVars);
    setRowData(gridData);
    // const expressionVars = getExpressionVars(expressionPayload);

    if (priorVars.length === 0) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          text: 'There need to be 1 dependent variable only to run regression',
          severity: 'warning',
        });
      return;
    }

    if (postVars.length === 0) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
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
    setRunningRegression(true);

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
      appContext.handleJobId &&
        appContext.handleJobId(parseInt(`${executePost?.id}`));
      history.push({
        pathname: `/models/estimated_market_regression/${id}/${postProcessInfo?.id}`,
        state: {
          jobId: executePost?.id,
        },
      });
    } catch (e) {
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
      text: 'Run Regression',
      onClick: (): Promise<void> => {
        return runRegression();
      },
    },
  ];

  if (
    !context.modelDetails ||
    (!project && !datasetId.length) ||
    runningRegression
  )
    return <Loading />;

  const saveColData = (): boolean => {
    return true;
  };

  const updateColData = (newData: GenericGridRowData[]): void => {
    setGridData(newData);
  };

  const renderGrid = (): JSX.Element => {
    if (project) {
      if (datasetId.length) {
        return <AgGrid height={'450px'} id={datasetId} externalUse={true}></AgGrid>;
      }
    }
    return <Fragment></Fragment>;
  };

  const getDatasetId = (datasetId: string): void => {
    setDatasetId(datasetId);
  };

  return (
    <div>
      <ModelDetailsHeader
        modelDetails={context.modelDetails}
        userDetails={context.userDetails}
        icons={defaultIcons}
        links={[<span>New Regression</span>]}
      />
      <SalesDropdown options={datasets} getDatasetId={getDatasetId} />
      <div className="TimeTrend-grid withBorder mt-0">
        <GenericGrid
          rowData={rowData}
          saveColData={saveColData}
          updateColData={updateColData}
          useDropdown={true}
          badExpressions={errorMessage?.reason}
        />
        <ErrorMessage message={errorMessage} />
      </div>
      <div className="TimeTrend-maingrid">{renderGrid()}</div>
    </div>
  );
};
export default MultipleRegression;
