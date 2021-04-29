// elements.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from 'react';
import { Project, ProjectDataset } from 'services/map.typings';
import { FormValues } from 'components/FormBuilder/FormBuilder';
import DatasetViewer from '../DatasetViewer';
import { getVars } from './common';

export const RedirectDisplay = (showRedirectMessage: boolean): JSX.Element => {
  if (showRedirectMessage)
    return (
      <div className="overlay">
        <div className="message">
          Running regression.You will be redirected to the time trend screen.
        </div>
      </div>
    );
  return <></>;
};

export const OverlayDisplay = ({
  message,
}: {
  message: string;
}): JSX.Element => {
  if (message)
    return (
      <div className="overlay">
        <div className="message">{message}</div>
      </div>
    );
  return <></>;
};

export const ShowDatasets = (
  formData: FormValues,
  projectInfo: Project | null | undefined
): JSX.Element => {
  return (
    <DatasetViewer
      priorVars={getVars(formData, 'priorvars')}
      postVars={getVars(formData, 'postvars')}
      datasets={
        projectInfo?.projectDatasets.map((ds: ProjectDataset) => ({
          id: ds.datasetId || '',
          description: ds.datasetRole || '',
        })) || []
      }
    ></DatasetViewer>
  );
};
