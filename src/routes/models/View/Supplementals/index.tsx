// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import {
  IdOnly,
  Project,
  ProjectDataset,
} from 'services/map.typings';
// import DatasetViewer from '../DatasetViewer';
import {
  FormDefinition,
  FormValues,
  Params,
  VariableValue,
} from 'components/FormBuilder/FormBuilder';
import FormBuilder from 'components/FormBuilder';
import { ProjectContext } from 'context/ProjectsContext';
import Loading from 'components/Loading';
import { ReactComponent as Beaker } from '../../../../assets/images/icons/beaker.svg';
import ModelDetailsHeader from 'routes/models/ModelDetailsHeader';
import { AxiosLoader } from 'services/AxiosLoader';
import ErrorDisplay from 'components/ErrorDisplay';
import { OverlayDisplay } from '../Regression/elements';
import { useHistory, useParams } from 'react-router-dom';
import { LoadPostProcess } from '../Regression/common';
import { AppContext } from 'context/AppContext';

const suppForm: FormDefinition = {
  sections: [
    {
      fields: [
        {
          title: 'Comments',
          fieldName: 'Comments',
          type: 'textbox',
          isMultiLine: true,
          className: 'comments-editor',
        },
      ],
    },
    {
      title: 'Supplementals',
      className: 'with-large-title',
      fields: [
        {
          type: 'grid',
          fieldName: 'conditions',
          itemTemplates: [
            {
              newItem: { action: 'EMV', filter: '', expression: '', note: '' },
              title: 'New Condition',
            },
          ],
          vars: [
            {
              flex: 1,
              fieldName: 'action',
              title: 'Action',
              values: ['EMV', 'Suplemental', 'Exception'],
            },
            {
              flex: 3,
              fieldName: 'filter',
              title: 'Filter',
              required: true,
            },
            {
              flex: 3,
              fieldName: 'expression',
              title: 'Expression',
              required: true,
            },
            { flex: 1, fieldName: 'note', title: 'Note', required: false },
          ],
        },
      ],
    },
  ],
};

const Supplementals = (): JSX.Element => {
  const {
    id,
    regressionid,
  }: { id: string; regressionid: string } = useParams();
  const appContext = useContext(AppContext);
  const history = useHistory();

  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormValues>({});
  const context = useContext(ProjectContext);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<string>('');
  // const [project, setProject] = useState<Project>();
  // const [postProcess, setPostProcess] = useState<PostProcess>();

  // useEffect(() => {
  //   const fetchData = async (): Promise<void> => {
  //     const p = await LoadProject(id);
  //     setProject(p);
  //   };
  //   fetchData();
  // }, [id]);

  const fetchPostProcessData = async (): Promise<void> => {
    const pp = await LoadPostProcess(regressionid);
    // if (pp) setPostProcess(pp);
    const conditions: VariableValue[] = [];
    const comment = `${pp?.postProcessName}`;
    if (Array.isArray(pp?.exceptionPostProcessRules))
      pp?.exceptionPostProcessRules?.forEach((exp) => {
        const item = {
          action:
            exp.customSearchExpressions[0].expressionExtensions.action || 'EMV',
          filter: exp.customSearchExpressions[0].script,
          expression: exp.customSearchExpressions[1].script,
          note: exp.description,
        };
        conditions.push(item);
      });

    setFormData({
      ...formData,
      Comments: comment,
      conditions,
    });
  };

  const callPostProcess = (): void => {
    if (regressionid) {
      fetchPostProcessData();
    }
  };

  useEffect(callPostProcess, []);

  const isValidData = (): void => {
    if (Object.values(formData).length) {
      if (getValidForm()) {
        setIsValidated(true);
      }
    }
  };

  const getValidForm = (): number | false =>
    typeof formData?.Comments === 'string' &&
    formData?.Comments?.length &&
    Array.isArray(formData?.conditions) &&
    formData?.conditions?.length;

  useEffect(isValidData, [formData]);

  const handleFormDataChange = (newData: FormValues): void => {
    if (Object.values(newData).length) {
      setFormData(newData);
    }
  };

  if (!context?.modelDetails) return <Loading />;

  const runTest = async (): Promise<void> => {
    if (!formData) return;
    const pop = getPopulation(context.modelDetails);
    if (!pop) return;
    try {
      const datasetId = pop[0].datasetId;
      const toSend = createSendValues(datasetId, formData, regressionid);
      const loader = new AxiosLoader<IdOnly, {}>();
      setLoading('Calling service, please wait...');
      const postprocessInfo = await loader.PutInfo(
        `CustomSearches/ImportExceptionPostProcess`,
        toSend,
        {}
      );
      setLoading('Executing post process...');
      const executer = new AxiosLoader<IdOnly, {}>();
      const job = await executer.PutInfo(
        `CustomSearches/ExecuteDatasetPostProcess/${datasetId}/${postprocessInfo?.id}`,
        [
          {
            Id: 0,
            Name: '',
            Value: '',
          },
        ],
        {}
      );
      appContext.handleJobId && appContext.handleJobId(parseInt(`${job?.id}`));
      if (!regressionid)
        history.push(`/models/supplementals_edit/${id}/${postprocessInfo?.id}`);
      setLoading('');
    } catch (error) {
      setError(`${error}`);
      setLoading('');
    }
  };

  return (
    <Fragment>
      <OverlayDisplay message={loading} />
      <ModelDetailsHeader
        modelDetails={context.modelDetails}
        links={[<span>Supplementals</span>]}
        icons={[
          {
            icon: <Beaker />,
            disabled: !isValidated,
            text: 'Save supplemental',
            onClick: runTest,
          },
        ]}
      />
      <ErrorDisplay message={error} />
      <FormBuilder
        formInfo={suppForm}
        formData={formData}
        onDataChange={handleFormDataChange}
      />

      {/* <DatasetViewer
        priorVars={[]}
        postVars={[]}
        datasets={
          getPopulation(context.modelDetails).map((ds: ProjectDataset) => ({
            id: ds.datasetId || '',
            description: ds.datasetRole || '',
          })) || []
        }
      ></DatasetViewer> */}
    </Fragment>
  );
};
export default Supplementals;

function createSendValues(
  datasetId: string,
  currvars: FormValues,
  _regressionid: string | undefined
): Params {
  return {
    datasetId: datasetId,
    postProcessName: currvars.Comments,
    postProcessRole: 'SupplementalAndException',
    priority: 2600,
    postProcessDefinition: 'Supplemental and exceptions',
    PostProcessSubType: 'UniqueConditionSelector',
    exceptionPostProcessRules: (currvars.conditions as VariableValue[]).map(
      (t, index) => ({
        description: (t.note || 'Supplemental ') + index,
        customSearchExpressions: [
          {
            expressionType: 'TSQL',
            expressionRole: 'FilterExpression',
            script: t.filter,
            columnName: t.action,
            note: t.note,
            expressionExtensions: {
              action: t.action,
            },
          },
          {
            expressionType: 'TSQL',
            expressionRole: 'CalculatedColumn',
            script: t.expression,
            columnName: t.action,
            note: t.note,
          },
        ],
      })
    ),
  };
}

function getPopulation(project: Project | null | undefined): ProjectDataset[] {
  return (
    project?.projectDatasets.filter(
      (pds) => pds.datasetRole === 'Population'
    ) || []
  );
}
