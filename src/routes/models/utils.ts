// utils.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { Project, UserDetailsType } from 'services/map.typings';


  export interface OldestDs {
    lastSyncOn: string;
    lastSyncBy: string;
  }

  //TODO make generic
  export const getOldest = (modelDetails?: Project | null, userDetails?: UserDetailsType[]): OldestDs | null => {
    if (!modelDetails || !modelDetails.projectDatasets) return null;

    const user = userDetails?.find(u => u.id === modelDetails.userId);

    const oldestProjectDataset = modelDetails.projectDatasets.reduce((r, o) =>
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
    return {
      lastSyncOn: oldestDsDate,
      lastSyncBy: user?.fullName ?? 'John Doe' ,
      // oldestProjectDataset.dataset.lastModifiedBy
    };
  };

  // // export const getNewest = (modelDetails: Project | null): OldestDs | null => {
  //   if (!modelDetails || !modelDetails.projectDatasets) return null;

  //   const newestProjectDataset = modelDetails.projectDatasets.reduce((r, o) =>
  //     o.dataset.lastModifiedTimestamp &&
  //     r.dataset.lastModifiedTimestamp &&
  //     new Date(o.dataset.lastModifiedTimestamp) >
  //       new Date(r.dataset.lastModifiedTimestamp)
  //       ? o
  //       : r
  //   );
  //   const newestDsDate = new Date(
  //     newestProjectDataset.dataset.lastModifiedTimestamp ||
  //       new Date().toLocaleString()
  //   ).toLocaleString();
  //   return {
  //     lastSyncOn: newestDsDate,
  //     lastSyncBy: newestProjectDataset.dataset.userId,
  //   };
  // };

  // // export const getNewestChart = (modelDetails: Project | null): OldestDs | null => {
  // //   const salesDataset = modelDetails?.projectDatasets.filter(
  // //     (ds) => ds.datasetRole.toLowerCase() === 'sales'
  // //   );
  // //   if (
  // //     !salesDataset ||
  // //     !salesDataset[0] ||
  // //     !salesDataset[0].dataset.dependencies.interactiveCharts
  // //   )
  // //     return {
  // //       lastSyncBy: 'Jonh Doe',
  // //       lastSyncOn: new Date().toLocaleString(),
  // //     };

  // //   const newestChart = salesDataset[0].dataset.dependencies.interactiveCharts.reduce(
  // //     (r, o) => (o.lastModifiedTimestamp > r.lastModifiedTimestamp ? o : r)
  // //   );

  // //   return {
  // //     lastSyncBy: newestChart.lastModifiedBy,
  // //     lastSyncOn: new Date(newestChart.lastModifiedTimestamp).toLocaleString(),
  // //   };
  // // };

  // // export const getNewestRegression = (
  // //   modelDetails: Project | null
  // // ): OldestDs | null => {
  // //   if (!modelDetails) return null;
  // //   const dataset = modelDetails?.projectDatasets.find(
  // //     (ds) => ds.dataset.dependencies.postProcesses !== null
  // //   );
  // //   if (!dataset?.dataset?.dependencies?.postProcesses)
  // //     return {
  // //       lastSyncBy: 'NA',
  // //       lastSyncOn: 'NA',
  // //     };

  // //   const newestRegression = dataset.dataset.dependencies.postProcesses.reduce(
  // //     (r, o) => (o.lastModifiedTimestamp > r.lastModifiedTimestamp ? o : r)
  // //   );

  // //   return {
  // //     lastSyncBy: newestRegression.lastModifiedBy,
  // //     lastSyncOn: new Date(
  // //       newestRegression.lastModifiedTimestamp
  // //     ).toLocaleString(),
  // //   };
  // // };
