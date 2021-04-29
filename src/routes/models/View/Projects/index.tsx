// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import CustomSection, { SyncDetails } from './common/CustomSection';
import ProjectDetails from './common/ProjectDetails';
import { ProjectContext } from 'context/ProjectsContext';
import { useHistory, useParams } from 'react-router-dom';
import NewLandModal from './Land/NewLandModal';
import { GetModalDataType, WaterFrontType } from 'services/map.typings';
import {
  executeDatasetPostProcess,
  runNonWaterfront,
  runWaterfront,
} from './Land/services/landServices';
import useToast from 'components/common/useToast';
import useSignalR from 'components/common/useSignalR';

interface LandRegressionModalType {
  to: string;
  default: string;
}

interface ExceptionRegressionLandType {
  rowData: LandRegressionModalType[];
  step: number;
}

/**
 * Project
 *
 * @param props - Component props
 * @returns A JSX element
 */
function Project(): JSX.Element {
  const context = useContext(ProjectContext);
  const { id }: { id: string } = useParams();
  const history = useHistory();
  const [isOpen, setIsOpen] = useState<boolean>();
  const [running, setRunning] = useState<boolean>(false);
  const [datasetId, setDatasetId] = useState<string>('');
  const [jobId, setJobId] = useState<number>(0);
  const [activePostProcess, setActivePostProcess] = useState<string>('');
  const { message } = useSignalR(jobId);

  useEffect(() => {
    const runWaterfrontPostProcess = async (): Promise<void> => {
      if (
        message?.jobStatus.length &&
        activePostProcess === 'nonWater'
      ) {
        setActivePostProcess('');
        if (modalData?.waterFront) {
          const info = transformData(modalData.waterFront);
          const postProcess = await runWaterfront({
            datasetId,
            rules: info.rowData,
            step: info.step,
          });
          const job = await executeDatasetPostProcess(
            datasetId,
            `${postProcess?.id}`
          );
          if (job) {
            setJobId(parseInt(`${job?.id}`));
            setActivePostProcess('water');
          }
        }
      }
      if (activePostProcess === 'water' && message?.jobStatus.length) {
        setRunning(false);
        history.push(`/models/new-land-model/${id}`);
      }
    };
    runWaterfrontPostProcess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const [modalData, setModalData] = useState<GetModalDataType>();
  const toast = useToast();

  const getSyncDetails = (postProcessRole: string): SyncDetails | undefined => {
    return context.getSyncDetails && context.getSyncDetails(postProcessRole);
  };

  useEffect(() => {
    const datasetId = context.modelDetails?.projectDatasets?.find(
      (dataset) => dataset.datasetRole.toLowerCase() === 'sales'
    )?.datasetId;
    if (datasetId) setDatasetId(datasetId);
  }, [context.modelDetails]);

  const runExceptions = async (data: GetModalDataType): Promise<void> => {
    if (!datasetId) return;
    setRunning(true);
    setModalData(data);
    if (data.nonWaterFront) {
      const info = transformData(data.nonWaterFront);
      const postProcess = await runNonWaterfront({
        datasetId,
        rules: info.rowData,
        step: info.step,
      });
      const job = await executeDatasetPostProcess(
        datasetId,
        `${postProcess?.id}`
      );
      if (job) {
        setJobId(parseInt(`${job?.id}`));
        setActivePostProcess('nonWater');
      }
    }
  };

  const transformData = (data: WaterFrontType): ExceptionRegressionLandType => {
    const rowData: LandRegressionModalType[] = [];
    const { from, to, step } = data;
    if (from?.length && to?.length && step?.length) {
      const fromGrid = parseInt(from);
      const toGrid = parseInt(to);
      const stepGrid = parseInt(step);
      let i = fromGrid;
      let sum = stepGrid + fromGrid;
      for (i; i < toGrid; i += stepGrid) {
        if (i + stepGrid > toGrid) {
          rowData.push({
            to: toGrid.toString(),
            default: '0',
          });
        } else {
          if (i === fromGrid) {
            rowData.push({
              to: fromGrid.toString(),
              default: '0',
            });
          } else {
            rowData.push({
              to: sum.toString(),
              default: '0',
            });
          }
        }
        sum += stepGrid;
      }
    }
    return { rowData: rowData, step: parseInt(`${step}`) };
  };

  const createSchedule = async (data: GetModalDataType): Promise<void> => {
    try {
      await runExceptions(data);
    } catch (error) {
      setRunning(false);
      //TODO Jorge - Separate api callsD
      toast('Something failed (fn: createSchedule)', 'error');
    }
  };

  const renderSection = (): JSX.Element => {
    if (context.projectType?.length === 0) return <Fragment></Fragment>;
    if (context.projectType === 'annual update')
      return (
        <CustomSection
          title="Annual update adjustments"
          iconText="New annual update adjustments"
          lastSyncDetails={getSyncDetails('annualupdate')}
          iconOnClick={(): void => history.push(`/models/annual-update/${id}`)}
          disableIcon={context.annualCards && context.annualCards.length >= 1}
          cards={context.annualCards}
        />
      );
    return (
      <CustomSection
        title="Supplementals"
        iconText="New supplemental"
        lastSyncDetails={getSyncDetails('supplemental')}
        iconOnClick={(): void => history.push(`/models/supplementals/${id}`)}
        disableIcon={context.suppCards && context.suppCards.length >= 1}
        cards={context.suppCards}
      />
    );
  };

  return (
    <Fragment>
      <ProjectDetails />
      <CustomSection
        title="Data sources"
        lastSyncDetails={context.dataSourceSyncDetails}
        cards={context.dataSourceCards}
        noIcons
      />
      <CustomSection
        title="Analytics"
        iconText="New chart"
        lastSyncDetails={context.chartSyncDetails}
        iconOnClick={(): void => history.push(`/models/new-chart/${id}`)}
        cards={context.chartCards}
      />
      <CustomSection
        title="Time trend"
        iconText="New time trend model"
        lastSyncDetails={getSyncDetails('timetrendregression')}
        iconOnClick={(): void => {
          return history.push(`/models/new-regression/${id}`);
        }}
        disableIcon={context.timeCards && context.timeCards.length >= 1}
        cards={context.timeCards}
      />
      {context.projectType !== 'annual update' && (
        <CustomSection
          title="Land model"
          iconText="New land model"
          lastSyncDetails={getSyncDetails('landregression')}
          iconOnClick={(): void =>
            //history.push(`/models/new-chart/${context.projectId}`)
            setIsOpen(true)
          }
          disableIcon={context.landCards && context.landCards.length >= 1}
          cards={context.landCards}
        />
      )}
      <CustomSection
        title="Regression analysis"
        iconText="New EMV model"
        lastSyncDetails={getSyncDetails('multipleregression')}
        iconOnClick={(): void => {
          return history.push(`/models/estimated-market-regression/${id}`);
        }}
        disableIcon={context.multipleCards && context.multipleCards.length >= 1}
        cards={context.multipleCards}
      />

      {/*

      {/* <CustomSection
        title="Multiple variables"
        iconText="New regression"
        lastSyncDetails={context.regressionSyncDetails}
        iconOnClick={(): void => {
          return history.push(`/models/new-regression/${id}`);
        }}
        containerStyles={{ display: 'unset', paddingLeft: 0 }}
      >
        <Regressions />
      </CustomSection>
      {context.regression && (
        <CustomSection
          title="Reports"
          lastSyncDetails={context.reportSyncDetails}
          containerStyles={{ paddingLeft: 0 }}
          noIcons
        >
          <Reports />
        </CustomSection>
      )} */}
      <CustomSection
        title="Appraisal ratios"
        iconText="New appraisal ratios"
        lastSyncDetails={getSyncDetails('appraisalratioreport')}
        iconOnClick={(): void =>
          history.push(`/models/view/${id}/new-appraisal-report`)
        }
        cards={context.appRatioCards}
      />
      {renderSection()}
      <NewLandModal
        isOpen={isOpen}
        running={running}
        onButtonClick={createSchedule}
        onClose={(): void => {
          setIsOpen(false);
        }}
      />
    </Fragment>
  );
}

export default Project;
