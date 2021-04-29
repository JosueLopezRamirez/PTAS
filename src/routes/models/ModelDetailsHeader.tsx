// ModelDetailsHeader.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import {
  // ProjectDataset,
  Project,
  UserDetailsType,
} from 'services/map.typings';
import CustomHeader from 'components/common/CustomHeader';
import React from 'react';
import { Link } from 'react-router-dom';
import { getOldest, OldestDs } from './utils';
import { IconToolBarItem } from '@ptas/react-ui-library';

// interface OldestDs {
//   lastSyncOn: string;
//   lastSyncBy: string;
// }

interface Props {
  modelDetails?: Project | null;
  userDetails?: UserDetailsType[];
  links?: JSX.Element[];
  icons?: IconToolBarItem[];
  detailTop?: string;
  detailsBottom?: string;
}

function ModelDetailsHeader(props: Props): JSX.Element {
  const { modelDetails, userDetails, links, icons } = props;
  // const getDetailBottomData = (modelDetails: Project | null): string => {
  //   const population = modelDetails?.projectDatasets.find(
  //     (ds: ProjectDataset) => ds.datasetRole.toLowerCase() === 'population'
  //   );
  //   const sales = modelDetails?.projectDatasets.find(
  //     ds => ds.datasetRole.toLowerCase() === 'sales'
  //   );

  //   return `Sales: ${sales?.dataset.totalRows ||
  //     'NA'}   |  Population:  ${population?.dataset.totalRows ||
  //     'NA'}  | Area(s):  ${modelDetails?.selectedAreas?.join(', ')}`;
  // };

  let headerOldestData: OldestDs | null = {lastSyncBy: "", lastSyncOn: ""};
  if (!props.detailsBottom) {
    headerOldestData = getOldest(modelDetails, userDetails || []);
  }

  return (
    <CustomHeader
      route={[
        <Link to="/models" style={{ color: 'black' }}>
          Models
        </Link>,
        <Link
          to={
            modelDetails
              ? `/models/view/${modelDetails?.userProjectId}`
              : '/models'
          }
        >
          {modelDetails?.projectName ?? 'Project name'}
        </Link>,
        ...(links || []),
      ]}
      icons={icons || []}
      // detailTop={detailTop || getDetailBottomData(modelDetails)}
      detailBottom={
        props.detailsBottom ?? headerOldestData
          ? `Last sync on ${headerOldestData?.lastSyncOn}, by ${headerOldestData?.lastSyncBy}`
          : ''
      }
    />
  );
}
export default ModelDetailsHeader;
