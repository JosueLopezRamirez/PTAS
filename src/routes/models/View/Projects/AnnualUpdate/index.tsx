// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import {
  IdOnly,
  PostProcess,
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
import { ReactComponent as Beaker } from '../../../../../assets/images/icons/beaker.svg';
import ModelDetailsHeader from 'routes/models/ModelDetailsHeader';
import { AxiosLoader } from 'services/AxiosLoader';
import ErrorDisplay from 'components/ErrorDisplay';
import { OverlayDisplay } from '../../Regression/elements';
import { useHistory, useParams } from 'react-router-dom';
import { LoadPostProcess, LoadProject } from '../../Regression/common';
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
          validations: [
            { type: 'required', message: 'Please enter comments.' },
          ],
        },
      ],
    },
    {
      title: 'Annual update adjustments',
      className: 'with-large-title',
      fields: [
        {
          type: 'grid',
          fieldName: 'conditions',
          itemTemplates: [
            {
              newItem: {
                category: 'Land',
                filter: '',
                factor: '',
                applyFactorTo: 'Apply to Total Value',
                minimun: '',
              },
              title: 'New Condition',
            },
          ],
          vars: [
            {
              flex: 1,
              fieldName: 'category',
              title: 'Category',
              values: [
                'Land',
                'Building',
                'Multiple Imps',
                'Mobile Homes',
                'Accessory Only',
                'Imp no char',
              ],
            },
            {
              flex: 3,
              fieldName: 'filter',
              title: 'Filter',
              required: true,
            },
            {
              flex: 1,
              fieldName: 'factor',
              title: 'Factor',
              required: true,
            },
            {
              flex: 1,
              fieldName: 'applyFactorTo',
              title: 'Apply factor to',
              values: ['Apply to Total Value', 'Apply to Imps Value'],
            },
            {
              flex: 1,
              fieldName: 'minimun',
              title: 'Minimun land value to factor',
              required: false,
            },
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
  const [isValidated, setIsValidated] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormValues>({});
  const context = useContext(ProjectContext);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<string>('');
  //eslint-disable-next-line
  const [project, setProject] = useState<Project>();
  //eslint-disable-next-line
  const [postProcess, setPostProcess] = useState<PostProcess>();

  const history = useHistory();

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const p = await LoadProject(id);
      setProject(p);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchPostProcessData = async (): Promise<void> => {
      const pp = await LoadPostProcess(regressionid);
      if (pp) setPostProcess(pp);
      //eslint-disable-next-line
      const conditions: any[] = [];
      //eslint-disable-next-line
      const comment: any = pp?.postProcessName;
      if (Array.isArray(pp?.exceptionPostProcessRules))
        pp?.exceptionPostProcessRules?.forEach((exp) => {
          const item = {
            category:
              exp.customSearchExpressions[0].expressionExtensions.Category ||
              'Land',
            filter: exp.customSearchExpressions[0].script,
            factor: exp.customSearchExpressions[0].expressionExtensions.Factor,
            applyFactorTo:
              exp.customSearchExpressions[0].expressionExtensions
                .ApplyFactorTo || 'Apply to Total Value',
            minimun:
              exp.customSearchExpressions[0].expressionExtensions
                .MinimumLandValueToFactor,
          };
          conditions.push(item);
        });

      setFormData({
        ...formData,
        //eslint-disable-next-line
        Comments: comment,
        conditions,
      });
    };

    if (regressionid) {
      fetchPostProcessData();
    }
    //eslint-disable-next-line
  }, [regressionid]);

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
      const executer = new AxiosLoader<IdOnly, {}>(
      );
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
        links={[<span>Annual Update</span>]}
        icons={[
          {
            icon: <Beaker />,
            disabled: !isValidated,
            text: 'Save annual update',
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
    </Fragment>
  );
};
export default Supplementals;

function getScript(applyFactorTo: string, t: VariableValue): string {
  if (applyFactorTo.length) return `LandValue * (${t.factor} - 1)`;
  return `CASE WHEN LandValue < ${t.minimun} THEN LandValue ELSE ${t.minimun} END * (${t.factor} - 1)`;
}

function createSendValues(
  datasetId: string,
  currvars: FormValues,
  _regressionid: string | undefined
): Params {
  return {
    datasetId: datasetId,
    postProcessName: currvars.Comments,
    postProcessRole: 'AnnualUpdateAdjustment',
    priority: 3000,
    postProcessDefinition: 'Annual update adjustments',
    PostProcessSubType: 'MultipleConditionModifier',
    traceEnabledFields: ['LandValue'],
    exceptionPostProcessRules: (currvars.conditions as VariableValue[]).map(
      (t, index) => ({
        description: (t.note || 'Supplemental ') + index,
        customSearchExpressions: [
          {
            expressionType: 'TSQL',
            expressionRole: 'FilterExpression',
            script: t.filter,
            columnName: 'LandValue',
            expressionExtensions: {
              Category: t.category,
              Factor: t.factor,
              ApplyFactorTo: t.applyFactorTo,
              MinimumLandValueToFactor: t.minimun,
              traceMessage: `+ Annual update adjustments: ${t.filter}`,
            },
          },
          {
            expressionType: 'TSQL',
            expressionRole: 'CalculatedColumn',
            script: getScript(t.applyFactorTo, t),
            columnName: 'LandValue',
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
