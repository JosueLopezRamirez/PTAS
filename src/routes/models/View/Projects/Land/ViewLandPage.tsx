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
} from 'services/map.typings';
import { Link, useHistory, useParams } from 'react-router-dom';
import {
  getCalculatedVars,
  getDependentVars,
  getExpressionVars,
  getIndependentVars,
  LoadProject,
} from '../../Regression/common';
import LinearRegression from '../../Regression/LinearRegression';
import AgGrid from 'components/Grid';
import { AxiosLoader } from 'services/AxiosLoader';
import { PlayArrowOutlined } from '@material-ui/icons';
import { v4 as uuidv4 } from 'uuid';
import { AppContext } from 'context/AppContext';
import { SalesDropdown } from '../../Regression/SalesDropdown';
import { ImportErrorMessageType } from 'components/ErrorMessage/ErrorMessage';

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

const ViewLandPage = (): JSX.Element => {
  const { id }: { id: string } = useParams();
  const history = useHistory();
  const appContext = useContext(AppContext);
  const [project, setProjectInfo] = useState<Project | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo[]>();
  const [datasetId, setDatasetId] = useState<string>('');
  const [regression, setRegression] = useState<number>(0);
  const [gridData, setGridData] = useState<GenericGridRowData[]>([]);
  const [errorMessage,setErrorMessage] = useState<ImportErrorMessageType>();
  const [expressionPayload, setExpressionsPayload] = useState<
    GenericGridRowData[]
  >([]);
  const [datasets, setDatasets] = useState<GenericDropdownType[]>([]);

  const randStr = (): string | (() => string) => `${uuidv4()}`;

  const [loading, setLoading] = useState<boolean>(false);
  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [lastKey, setLastKey] = useState(randStr());
  const [reloadKey, setReloadKey] = useState('');

  useEffect(() => {
    setReloadKey(lastKey + '.');
  }, [lastKey]);

  const reload = (): void => setLastKey(randStr());

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const project = await LoadProject(id, true);
      if (project) {
        setProjectInfo(project.project);
        const datasets = project.project.projectDatasets?.filter(
          (dataset: ProjectDataset) => dataset.datasetRole === 'Sales'
        );
        setDatasets(
          datasets.map((dataset: ProjectDataset) => ({
            label: 'Land' || dataset.datasetRole,
            value: dataset.datasetId,
          }))
        );
        setDatasetId(datasets[0]?.datasetId || '');
        setUserInfo(project.usersDetails);
      }
    };
    fetchData();
  }, [id]);

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
      postProcessName: 'Land Schedule',
      priority: 2000,
      rScriptModelId: regression,
      postProcessDefinition: 'RScript post process test',
      customSearchExpressions: customSearchExpressions,
      postProcessRole: 'LandRegression',
    };
    try {
      setLoading(true);
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
        pathname: `/models/view-land-model/${id}/edit/${postProcessInfo?.id}`,
        state: {
          jobId: executePost?.id,
          from: 'create'
        },
      });
      // history.push(`/models/new-land-model/${id}`);
    } catch (e) {
      setErrorMessage({
        message: e.message,
        reason: e.validationError
      });
    } finally {
      setRunningRegression(false);
      setLoading(false);
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
    if (project && datasetId.length) {
      return (
        <AgGrid
          height={'450px'}
          id={datasetId}
          externalUse={true}
          // reloadGrid={reload}
          key={reloadKey}
        ></AgGrid>
      );
    }
    return <Fragment></Fragment>;
  };

  const getDatasetId = (id: string): void => {
    setDatasetId(id);
    reload();
  };

  if (!project || loading) return <Loading />;

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
        modelDetails={project}
        getFormData={getFormData}
        // useDropdownDataset
        // datasets={datasets}
        errorMessage={errorMessage}
        useLandRegression
        // getDatasetId={getDatasetId}
      />
      <div className="TimeTrend-maingrid">{renderGrid()}</div>
    </Fragment>
  );
};

export default ViewLandPage;
