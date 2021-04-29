/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, PropsWithChildren } from 'react';
import { SectionContainer } from '@ptas/react-ui-library';
import { ClassNameMap } from '@material-ui/styles';
import Loader from 'react-loader-spinner';
import BlockUi from 'react-block-ui';
import { ErrorMessageType } from './services/newLandServices';
import { Grid } from '@material-ui/core';
import LandGrid from './LandGrid';
import { ColDef } from 'ag-grid-community';
import { LandGridData } from 'services/map.typings';
import ErrorMessage from 'components/ErrorMessage/ErrorMessage';

interface ScheduleGridProps {
  sectionTitle: string;
  loadingRegression: string;
  isLoading?: boolean;
  classes: ClassNameMap;
  errorMessage: ErrorMessageType | undefined;
  colDefs: ColDef[] | undefined;
  blockUI: boolean;
  gridData: LandGridData[];
  editing: boolean;
  updateGridData: (data: LandGridData[], change: boolean) => void;
  type: string;
}

//eslint-disable-next-line
const getSize = (size: number | undefined): any => {
  if (!size) return 3;
  if (size >= 12) {
    return 12;
  }
  return size;
};

export const ScheduleGrid = (
  props: PropsWithChildren<ScheduleGridProps>
): JSX.Element => {
  const { classes, errorMessage, type } = props;
  return (
    <SectionContainer title={props.sectionTitle} isLoading={props.isLoading}>
      {props.loadingRegression === type ? (
        <div className={classes.sectionLoader}>
          <Loader type="Oval" color="#00BFFF" height={80} width={80} />
        </div>
      ) : (
        <Fragment>
          {props.children}
          <BlockUi tag="div" blocking={props.blockUI} loader={<></>}>
            <Grid sm={getSize(props.colDefs?.length)}>
              <LandGrid
                editing={props.editing}
                columnsDefs={props.colDefs}
                rowData={props.gridData}
                updateColData={props.updateGridData}
              />
            </Grid>
          </BlockUi>
          {errorMessage?.section === props.type && errorMessage?.message && (
            <ErrorMessage message={errorMessage.message} />
            // <Fragment>
            //   <span className={classes.errorMessage}>
            //     {errorMessage?.message?.message}
            //   </span>
            //   <span className={classes.errorMessage}>
            //     {errorMessage?.message?.reason}
            //   </span>
            // </Fragment>
          )}
        </Fragment>
      )}
    </SectionContainer>
  );
};
