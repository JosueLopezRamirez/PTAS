// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { FormDefinition, FormValues } from 'components/FormBuilder/FormBuilder';
import FormBuilder from 'components/FormBuilder';
import { useParams, Link, useHistory } from 'react-router-dom';
import { AxiosLoader } from 'services/AxiosLoader';
import {
  IdOnly,
  Project,
  Expression,
  ProjectDataset,
} from 'services/map.typings';

import Loading from 'components/Loading';
import { NewRegressionForm } from 'constants/Forms';

import PlayArrowOutlined from '@material-ui/icons/PlayArrowOutlined';
import MessageDisplay from 'components/MessageDisplay';
import { PanelHeader } from '@ptas/react-ui-library';
import {
  getExpressions,
  GetPostVars,
  GetPriorVars,
  reformatDate,
  getRScriptExpressions,
} from './common';
import React, { useState, useEffect, Fragment, useContext } from 'react';
import { RedirectDisplay, ShowDatasets } from './elements';
import { OverlayDisplay } from '../Regression/elements';
import { getUserProject } from 'services/common';
import { AppContext } from 'context/AppContext';

const NewRegression = (): JSX.Element => {
  const { id }: { id: string } = useParams();

  const formDef: FormDefinition = NewRegressionForm;

  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [overlayMsg, setOverlayMsg] = useState('');
  const [showRedirectMessage] = useState(false);

  const [expressions, setExpressions] = useState<Expression[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormValues | null>(null);
  const [newFormData, setNewFormData] = useState<FormValues | null>(null);
  const [projectInfo, setProjectInfo] = useState<Project | null | undefined>(
    null
  );
  const appContext = useContext(AppContext);

  const history = useHistory();

  useEffect(() => {
    if (projectInfo !== null && expressions !== null) {
      const postVars = getExpressions(
        expressions,
        'CalculatedColumnPostCommit'
      );

      const fd: FormValues = {
        timetrend: 'linear',
        name: 'New Regression',
        valuationdate: reformatDate(new Date()),
        coefficient: '',
        intercept: '',
        priorvars: getExpressions(expressions, 'CalculatedColumnPreCommit'),
        postvars: postVars,
      };
      setFormData(fd);
      setNewFormData(fd);
    } else {
      console.log({ projectInfo, expressions });
    }
  }, [projectInfo, expressions]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await getUserProject(id);
        setProjectInfo(response?.project ?? null);
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

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const expressions = await getRScriptExpressions(1);
      setExpressions(expressions);
    };
    fetchData();
  }, [id, setExpressions]);

  const runRegression = async (): Promise<void> => {
    if (runningRegression) return;

    const d = projectInfo?.projectDatasets.find(
      (ds: ProjectDataset) => ds.datasetRole === 'Sales'
    )?.datasetId;
    if (!d) {
      setErrorMessage('This model does not have a sales dataset.');
      return;
    }
    if (!newFormData) {
      setErrorMessage('No form data.');
      return;
    }

    setOverlayMsg('Running regression, please wait.');
    setRunningRegression(true);

    const priorVars = GetPriorVars(newFormData);
    const postVars = GetPostVars(newFormData);

    const customSearchExpressions = [...priorVars, ...postVars];

    const payload = {
      datasetId: d,
      postProcessName: newFormData?.name,
      priority: 0,
      rScriptModelId: 1,
      postProcessDefinition: 'RScript post process test',
      customSearchExpressions: customSearchExpressions,
    };
    try {
      const al1 = new AxiosLoader<IdOnly, {}>();
      const postProcessInfo = await al1.PutInfo(
        'CustomSearches/ImportRScriptPostProcess',
        payload,
        {}
      );
      const ad2 = new AxiosLoader<{}, {}>();
      ad2.PutInfo(
        `CustomSearches/ExecuteDatasetPostProcess/${payload.datasetId}/${postProcessInfo?.id}`,
        {},
        {}
      );
      setOverlayMsg('You will be redirected to the time trend page.');
      setTimeout(() => history.push(`/models/view/${id}`), 3000);
    } catch (message) {
      setErrorMessage(`${message}`);
      setOverlayMsg('');
    } finally {
      setRunningRegression(false);
    }
  };

  const defaultIcons = [
    {
      icon: <PlayArrowOutlined />,
      text: 'Run Regression',
      onClick: (): void => {
        runRegression();
      },
    },
  ];
  return (
    <Fragment>
      {RedirectDisplay(showRedirectMessage)}
      <OverlayDisplay message={overlayMsg} />
      {formData ? (
        <div>
          {' '}
          <PanelHeader
            route={[
              <Link to="/models" style={{ color: 'black' }}>
                Models
              </Link>,
              <Link to={`/models/view/${id}`} style={{ color: 'black' }}>
                {projectInfo?.projectName}
              </Link>,
              <span>Add Regression</span>,
            ]}
            icons={defaultIcons}
            detailTop={`Sales: XX   |  Population: XX,XXX  |  Area(s): ${projectInfo?.selectedAreas?.join(
              ', '
            )}`}
            detailBottom="Last sync on XX/XX/XXXX at X:XXpm, by XXXXXX"
          />
          {errorMessage && <MessageDisplay message={errorMessage} />}
          <FormBuilder
            formData={formData}
            formInfo={formDef}
            onDataChange={setNewFormData}
          />
          {ShowDatasets(formData, projectInfo)}
        </div>
      ) : (
        <Loading />
      )}
    </Fragment>
  );
};
export default NewRegression;
