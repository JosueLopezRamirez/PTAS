// utility.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { isInteger } from 'lodash';
import { GetOneProjectResult } from 'services/map.typings';

export const getHighestPriority = (data: GetOneProjectResult, defaultPriority: number): number => {
  if (!data || !data.project) return defaultPriority;

  const sales = data.project.projectDatasets.find(
    (p) => p.datasetRole.toLocaleLowerCase() === 'sales'
  );

  if (
    !sales ||
    !sales.dataset ||
    !sales.dataset.dependencies ||
    !sales.dataset.dependencies.postProcesses
  )
    return 0;

  const postProcesses = sales.dataset.dependencies.postProcesses.filter(
    (p) => p?.postProcessRole?.toLowerCase() === 'appraisalratioreport'
  );

  if (!postProcesses || postProcesses.length === 0) return 0;

  const priorities = postProcesses
    .flatMap((p) => p?.priority)
    .filter((p) => p !== 0);

  if (!priorities || priorities.length === 0) return 0;

  return Math.max.apply(null, priorities);
};

export const getCurrentReport = (data: GetOneProjectResult): number | null => {
  if (!data || !data.project) return null;

  const sales = data.project.projectDatasets.find(
    (p) => p.datasetRole.toLocaleLowerCase() === 'sales'
  );

  if (
    !sales ||
    !sales.dataset ||
    !sales.dataset.dependencies ||
    !sales.dataset.dependencies.postProcesses
  )
    return null;

  const postProcesses = sales.dataset.dependencies.postProcesses.filter(
    (p) => p?.postProcessRole?.toLowerCase() === 'appraisalratioreport'
  );

  const names = postProcesses
    .flatMap((p) => p.postProcessName);

  if(names.length === 1 && names[0] === 'Appraisal Ratio Report') return 1;

  const numbers: number[] = [];
  names.forEach(n => {
    if(!n) return;
    const toAdd = parseInt(n.replace('Appraisal Ratio Report', '').trim());
    if(isInteger(toAdd)) numbers.push(toAdd);
  })

  if (!numbers || numbers.length === 0) return null;
  return Math.max.apply(null, numbers);
};

export const sleep = (delay: number): Promise<void> => new Promise((r) => setTimeout(r, delay));
