// AddRegression.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import ModelDetailsHeader from 'routes/models/ModelDetailsHeader';

import PlayArrowOutlined from '@material-ui/icons/PlayArrowOutlined';
import { ProjectContext } from 'context/ProjectsContext';
import Loading from 'components/Loading';
import LinearRegression from './LinearRegression';
import {
  GenericGridRowData,
  Project,
  ProjectDataset,
  RegressionRoleType,
  SearchParameters,
  GenericDropdownType,
} from 'services/map.typings';
import { useHistory, useParams } from 'react-router-dom';
import {
  runImportRScript,
  getTimeTrendCustomSearchExpressions,
} from './common';

import AgGrid from 'components/Grid';
import '../../../../assets/time-trend-styles/styles.scss';
import { AppContext } from 'context/AppContext';
import { SalesDropdown } from './SalesDropdown';
import { executeDatasetPostProcess } from '../Projects/Land/services/landServices';
import { getUserProject } from 'services/common';
import { ImportErrorMessageType } from 'components/ErrorMessage/ErrorMessage';

interface ParamExpression {
  expressionType: string;
  expressionRole: string;
  script?: string;
  columnName: string;
}

const randStr = (): string | (() => string) => `${Math.random()}`;

const AddRegression = (): JSX.Element => {
  const { id }: { id: string } = useParams();
  const context = useContext(ProjectContext);
  const appContext = useContext(AppContext);
  const [project, setProjectInfo] = useState<Project | null | undefined>(null);
  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<ImportErrorMessageType>();
  const [regression, setRegression] = useState<number>(0);
  const [gridData, setGridData] = useState<GenericGridRowData[]>([]);
  const [datasetId, setDatasetId] = useState<string>('');
  const [datasets, setDatasets] = useState<GenericDropdownType[]>([]);
  const [lastKey, setLastKey] = useState(randStr());
  const [reloadKey, setReloadKey] = useState('');
  const [parameterState, setParameterState] = useState<
    SearchParameters[] | undefined
  >([]);
  const [expressionPayload, setExpressionsPayload] = useState<
    GenericGridRowData[]
  >([]);

  const history = useHistory();

  const reload = (): void => setLastKey(randStr());

  useEffect(() => {
    setReloadKey(lastKey + '.' + datasetId);
  }, [datasetId, lastKey]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
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

        if (!d) return;

        setDatasetId(d);
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            severity: 'error',
            text: 'Getting user project failed',
          });
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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
      const regression = await runImportRScript(payload);
      const executePost = await executeDatasetPostProcess(
        `${payload.datasetId}`,
        `${regression?.id}`
      );
      appContext.handleJobId?.(parseInt(`${executePost?.id}`));
      history.push({
        pathname: `/models/regression/${id}/${regression?.id}`,
        state: {
          jobId: executePost?.id,
        }
      });
    } catch (e) {
      setErrorMessage({
        message: e?.message,
        reason: e?.validationError || []
      });
      setRunningRegression(false);
    }
  };

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

  const defaultIcons = [
    {
      icon: <PlayArrowOutlined />,
      text: 'Run Regression',
      onClick: (): Promise<void> => {
        return runRegression();
      },
    },
  ];

  const renderGrid = (): JSX.Element => {
    if (project && datasetId.length) {
      return (
        <AgGrid
          height={'450px'}
          id={datasetId}
          reloadGrid={reload}
          key={reloadKey}
          showSpinner={false}
          externalUse={true}
        ></AgGrid>
      );
    }
    return <Fragment />;
  };

  const getDatasetId = (datasetId: string): void => {
    setDatasetId(datasetId);
  };
  if (
    (!project && !datasetId.length) ||
    !context.modelDetails ||
    runningRegression
  )
    return <Loading />;

  return (
    <div>
      <ModelDetailsHeader
        modelDetails={context.modelDetails}
        userDetails={context.userDetails}
        icons={defaultIcons}
        links={[<span>Time Trend</span>]}
      />
      <SalesDropdown options={datasets} getDatasetId={getDatasetId} />
      <LinearRegression
        modelDetails={context.modelDetails}
        getFormData={getFormData}
        regressionType="Time Trend:"
        errorMessage={errorMessage}
        // useDropdown={true}
      />
      <div className="TimeTrend-maingrid">{renderGrid()}</div>
    </div>
  );
};
export default AddRegression;
