// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import GetAppIcon from '@material-ui/icons/GetApp';
import PublishIcon from '@material-ui/icons/Publish';
import CheckIcon from '@material-ui/icons/Check';
import DeleteIcon from '@material-ui/icons/Delete';
import CustomSection from '../common/CustomSection';
import CancelIcon from '@material-ui/icons/Cancel';
import SaveIcon from '@material-ui/icons/Save';
import {
  CustomIconButton,
  PanelHeader,
  SectionContainer,
} from '@ptas/react-ui-library';
import EditIcon from '@material-ui/icons/Edit';
import Loader from 'react-loader-spinner';
import {
  ExcelSheetJson,
  LandGridData,
  LandVariableGridRowData,
  PostProcess,
  Project,
  SheetType,
} from 'services/map.typings';
import LandVariableGrid from './LandVariablesGrid';
import { Link, useHistory, useParams } from 'react-router-dom';
import { LoadProject } from '../../Regression/common';
import Loading from 'components/Loading';
import {
  applyRegressionToSchedule,
  executeDatasetPostProcess,
  nonWaterFrontExpressionService,
  waterFrontExpressionService,
  runAdjustment,
  runNonWaterFrontFromExcel,
  runWaterFrontFromExcel,
  getPredictedEcuation,
} from './services/landServices';
import ExpressionsGrid, { ExpressionGridData } from './ExpressionsGrid';
import AgGridService from 'services/AgGridService';
import { deleteDatasetPostProcess } from 'services/common';
import { AppContext } from 'context/AppContext';
import { ColDef } from 'ag-grid-community';
import useJsonTools from 'components/common/useJsonTools';
import { v4 as uuidv4 } from 'uuid';
import 'react-block-ui/style.css';
import '../../../../../assets/time-trend-styles/block-ui.scss';
import {
  getPostProcess,
  ErrorMessageType,
  UserInfo,
  getBottom,
} from './services/newLandServices';
import { useStyles } from './styles';
import { ScheduleGrid } from './ScheduleGrid';
import useSignalR from 'components/common/useSignalR';
import ErrorMessage from 'components/ErrorMessage/ErrorMessage';

let timer: NodeJS.Timeout;

const debounceRequest = (
  callback: Function,
  wait = 0,
  ...args: unknown[]
): Function => {
  return (): void => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
};

const NewLandPage = (): JSX.Element => {
  const { id }: { id: string } = useParams();
  const appContext = useContext(AppContext);
  const history = useHistory();
  const [project, setProjectInfo] = useState<Project | null | undefined>(null);
  const [datasetId, setDatasetId] = useState<string>('');
  const [predictedEcuation, setPredictedEcuation] = useState<string>('');
  const classes = useStyles();
  const [userInfo, setUserInfo] = useState<UserInfo[]>();
  const [nonWaterGridData, setNonWaterGridData] = useState<LandGridData[]>([]);
  const [nonWaterfrontGridData, setNonWaterfrontGridData] = useState<
    LandGridData[]
  >([]);
  const [applyJobId, setApplyJobId] = useState<number>(0);
  const [runningRegression, setRunningRegression] = useState<boolean>(false);
  const [postProcess, setPostProcess] = useState<PostProcess | null>();
  const [waterfrontGridData, setWaterfrontGridData] = useState<LandGridData[]>(
    []
  );
  const [
    nonWaterFrontExpressionData,
    setNonWaterFrontExpressionData,
  ] = useState<ExpressionGridData[]>([]);
  const [waterFrontExpressionData, setWaterFrontExpressionData] = useState<
    ExpressionGridData[]
  >([]);
  const [positiveGridData, setPositiveGridData] = useState<
    LandVariableGridRowData[]
  >([]);
  const [positiveUpdateData, setPositiveUpdateData] = useState<
    LandVariableGridRowData[]
  >([]);
  const [loadingPostProcess, setLoadingPostProcess] = useState<boolean>(false);
  const [waterfront, setWaterfront] = useState<PostProcess>();
  const [nonWaterfront, setNonWaterfront] = useState<PostProcess>();
  const [
    adjustmentPostProcess,
    setAdjustmentPostProcess,
  ] = useState<PostProcess>();
  const [nonWaterColDefs, setNonWaterColDefs] = useState<ColDef[]>();
  const [waterColDefs, setWaterColDefs] = useState<ColDef[]>();
  const [disableApplyButton, setDisableApplyButton] = useState(true);
  const [blocked, setBlocked] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<
    'nonWater' | 'water'
  >();
  const [loadingRegression, setLoadingRegression] = useState<string>('');
  const [regressionViewKey, setRegressionViewKey] = useState<string>(uuidv4());

  const [
    waterFrontExpressionPostProcessId,
    setWaterFrontExpressionPostProcessId,
  ] = useState<number>();
  const [
    nonWaterFrontExpressionPostProcessId,
    setNonWaterFrontExpressionPostProcessId,
  ] = useState<number>();
  const [datasetIsDirty, setDatasetIsDirty] = useState<boolean>(false);

  const [jobId, setJobId] = useState<number>(0);

  const { message } = useSignalR(jobId);

  const { message: applyMessage } = useSignalR(applyJobId);

  const cleanTimeouts = (): void => clearTimeout(timer);

  const applyMessageHandle = async (): Promise<void> => {
    if (applyMessage?.jobStatus) {
      await loadLandData();
      setRunningRegression(false);
    }
  };

  const callApplyMessageHandle = (): void => {
    applyMessageHandle();
  };

  useEffect(callApplyMessageHandle, [applyMessage]);

  useEffect(cleanTimeouts, []);

  const validateMessage = async (): Promise<void> => {
    if (message?.jobStatus === 'Succeeded') {
      setDatasetIsDirty(false);
    }
    if (message?.jobStatus.length) {
      await loadLandData(false);
    }
  };

  const callValidateMessage = (): void => {
    validateMessage();
  };

  useEffect(callValidateMessage, [message]);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const {
    getExcelFromJson,
    isLoading,
    convertFromExcelToJson,
    fromExcelLoading,
  } = useJsonTools();

  const [selectedVariableGrid, setSelectedVariableGrid] = useState<
    'water' | 'nonWater'
  >();

  const [errorMessage, setErrorMessage] = useState<ErrorMessageType>();

  const callFetch = (): void => {
    fetchData();
  };
  useEffect(callFetch, [id]);

  const fetchData = async (): Promise<void> => {
    const project = await LoadProject(id, true);
    if (project) {
      const userProject: Project = project.project;
      const datasetId =
        userProject?.projectDatasets?.find(
          (dataset) => dataset?.datasetRole.toLowerCase() === 'sales'
        )?.datasetId || '';
      setDatasetId(datasetId);
      setProjectInfo(project.project);
      setUserInfo(project.usersDetails);
    }
  };

  const getDatasetStatus = async (data: PostProcess): Promise<boolean> => {
    if (data) {
      const datasetStatus = await AgGridService.getDataSetStatus(
        data?.datasetId,
        data?.datasetPostProcessId
      );

      const status = datasetStatus?.datasetState === 'Processed';
      if (!status) {
        const debounced = debounceRequest(getDatasetStatus, 1000, data);
        debounced();
      }
      return status;
    }
    return false;
  };

  const callLoadLandData = (): void => {
    loadLandData();
  };
  useEffect(callLoadLandData, [project]);

  const loadLandData = async (viewSpinner = true): Promise<void> => {
    if (project) {
      if (viewSpinner) setLoadingPostProcess(true);
      const data = await getPostProcess(project, {
        setNonWaterfrontGridData,
        setNonWaterColDefs,
        setWaterfrontGridData,
        setWaterColDefs,
        setPositiveGridData,
        setNonWaterFrontExpressionData,
        setWaterFrontExpressionData,
        setWaterFrontExpressionPostProcessId,
        setNonWaterFrontExpressionPostProcessId,
      });
      if (data.mainPostProcess) {
        setPostProcess(data.mainPostProcess);
        if (data.mainPostProcess.resultPayload?.length) {
          const result = JSON.parse(data.mainPostProcess.resultPayload);
          if (result?.Status === 'Success') {
            const ecuation = await getPredictedEcuation(
              data.mainPostProcess.datasetPostProcessId
            );
            if (ecuation?.predictedEquation)
              setPredictedEcuation(ecuation?.predictedEquation);
          }
        }
      }
      if (data.nonWaterFront) setNonWaterfront(data.nonWaterFront);
      if (data.regressionViewKey) setRegressionViewKey(data.regressionViewKey);
      if (data.waterFront) setWaterfront(data.waterFront);
      if (data.disableApplyButton !== undefined)
        setDisableApplyButton(data.disableApplyButton);
      if (data.adjustmentPostProcess)
        setAdjustmentPostProcess(data.adjustmentPostProcess);
      setLoadingPostProcess(false);
    }
  };

  const disableContent = (label: string) => async (): Promise<void> => {
    if (datasetIsDirty) {
      appContext.setSnackBar?.({
        severity: 'warning',
        text: 'Another post process is happening right now.',
      });
      return;
    }
    if (blocked.length && blocked !== label) return;
    if (blocked === label) {
      switch (label) {
        case 'nonWater':
          await runNonWaterFrontRegression();
          break;
        case 'nonWaterExpression':
          await runNonWaterFrontExpression();
          break;
        case 'water':
          await updateWaterFront();
          break;
        case 'waterExpression':
          await runWaterFrontExpression();
          break;
        case 'adjustment':
          await runAdjustments();
          break;
        default:
          break;
      }
      setBlocked('');
      return;
    }
    setBlocked(label);
  };

  const runWaterFrontExpression = async (): Promise<void> => {
    try {
      setLoadingRegression('waterExpression');
      setDatasetIsDirty(true);
      const postProcess = await waterFrontExpressionService(
        waterFrontExpressionData,
        datasetId,
        setWaterFrontExpressionPostProcessId,
        waterFrontExpressionPostProcessId
      );
      if (postProcess) {
        const execute = await executeDatasetPostProcess(
          datasetId,
          `${postProcess?.id}`
        );
        if (postProcess?.id)
          setWaterFrontExpressionPostProcessId(parseInt(postProcess?.id));
        if (execute) setJobId(parseInt(`${execute.id}`));
      }
    } catch (error) {
      getErrorMessage(error, 'waterExpression');
    } finally {
      setLoadingRegression('');
      setDatasetIsDirty(false);
      setBlocked('');
    }
  };

  const runNonWaterFrontExpression = async (): Promise<void> => {
    try {
      setLoadingRegression('nonWaterExpression');
      setDatasetIsDirty(true);
      const postProcess = await nonWaterFrontExpressionService(
        nonWaterFrontExpressionData,
        datasetId,
        setNonWaterFrontExpressionPostProcessId,
        nonWaterFrontExpressionPostProcessId
      );
      if (postProcess) {
        const execute = await executeDatasetPostProcess(
          datasetId,
          `${postProcess?.id}`
        );
        if (postProcess?.id)
          setNonWaterFrontExpressionPostProcessId(parseInt(postProcess?.id));
        if (execute) setJobId(parseInt(`${execute.id}`));
      }
    } catch (error) {
      getErrorMessage(error, 'nonWaterExpression');
    } finally {
      setLoadingRegression('');
      setDatasetIsDirty(false);
      setBlocked('');
    }
  };

  const runNonWaterFrontRegression = async (): Promise<void> => {
    if (nonWaterfront) {
      if (getDatasetStatus(nonWaterfront)) {
        const sheet: SheetType = { headers: [], rows: [] };
        if (nonWaterColDefs?.length) {
          sheet.headers = nonWaterColDefs?.map<string>(
            (col) => `${col?.field}`
          );
        }
        if (nonWaterGridData.length) {
          sheet.rows = nonWaterGridData.map((gridData) =>
            Object.values(gridData)
          );
        }
        try {
          setLoadingRegression('nonWater');
          setDatasetIsDirty(true);
          const exeception = await runNonWaterFrontFromExcel(sheet, datasetId);
          const execute = await executeDatasetPostProcess(
            datasetId,
            `${exeception?.id}`
          );
          if (execute) setJobId(parseInt(`${execute.id}`));
        } catch (error) {
          getErrorMessage(error, 'nonWater');
        } finally {
          setLoadingRegression('');
          setDatasetIsDirty(false);
          setBlocked('');
        }
      }
    }
  };

  const runApplyRegression = async (): Promise<void> => {
    // called by apply regression button click.
    if (nonWaterfront) {
      if (getDatasetStatus(nonWaterfront)) {
        const sheet: SheetType = { headers: [], rows: [] };
        if (nonWaterColDefs?.length) {
          sheet.headers = nonWaterColDefs?.map<string>(
            (col) => `${col?.field}`
          );
        }
        if (nonWaterGridData.length) {
          sheet.rows = nonWaterGridData.map((gridData) =>
            Object.values(gridData)
          );
        }
        try {
          setRunningRegression(true);
          await runNonWaterFrontFromExcel(sheet, datasetId);

          if (postProcess?.datasetPostProcessId) {
            const jobId = await applyRegressionToSchedule(
              postProcess?.datasetPostProcessId,
              nonWaterfront?.datasetPostProcessId
            );
            setApplyJobId(parseInt(`${jobId?.id}`));
          }
        } catch (error) {
          console.log(`error`, error);
          appContext.setSnackBar?.({
            severity: 'error',
            text: 'Apply regression failed',
          });
          setRunningRegression(false);
        }
      }
    } else {
      appContext.setSnackBar?.({
        severity: 'error',
        text: 'Nonwaterfront is not defined.',
      });
    }
  };

  const createRegression = (): void => {
    if (postProcess) {
      history.push(
        `/models/view-land-model/${id}/edit/${postProcess?.datasetPostProcessId}`
      );
    } else {
      history.push(`/models/view-land-model/${id}/create`);
    }
  };

  const importFromExcel = (from: 'water' | 'nonWater'): void => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
    setSelectedSection(from);
  };

  const callJson = (): void => {
    files && getJsonFromExcel(files[0]);
  };

  useEffect(callJson, [files]);

  const getField = (header: string): string => {
    if (header === 'SqFt') return 'to';
    if (header === 'default') return 'default';
    return header;
  };

  const getEditable = (header: string): boolean => {
    if (header !== 'SqFt') return true;
    return false;
  };

  // the error variable is of any type since any structure can come from the backend
  //eslint-disable-next-line
  const getErrorMessage = (error: any, label: string): void => {
    if (error?.message) {
      setErrorMessage({
        message: {
          message: error?.message,
          reason: error?.validationError,
        },
        section: label,
      });
    } else {
      setErrorMessage({
        message: {
          message: error,
          reason: [],
        },
        section: label,
      });
    }
  };

  const getJsonFromExcel = async (file: File): Promise<void> => {
    try {
      const json = await convertFromExcelToJson(file);
      if (selectedSection === 'nonWater') {
        const colDefs = json?.Sheet1.headers.map<ColDef>((header) => {
          return {
            headerName: header,
            field: getField(header),
            flex: 1,
            editable: getEditable(header),
          };
        });
        setNonWaterColDefs(colDefs);
        const data = json?.Sheet1.rows.map((row: unknown[]) => {
          let result = {};
          // if (Array.isArray(row))
          row?.forEach((value: unknown, index: number) => {
            result = {
              ...result,
              [getField(json?.Sheet1.headers[index])]: value,
            };
          });
          return result;
        });
        if (data) {
          setNonWaterfrontGridData(data as LandGridData[]);
          if (nonWaterfront) {
            setLoadingRegression('nonWater');
            try {
              await runNonWaterFrontFromExcel(json?.Sheet1, datasetId);
              await loadLandData(false);
            } catch (error) {
              getErrorMessage(error, 'nonWater');
            } finally {
              setLoadingRegression('');
            }
          }
        }
      }
      if (selectedSection === 'water') {
        const colDefs = json?.Sheet1.headers.map<ColDef>((header) => {
          return {
            headerName: header,
            field: getField(header),
            flex: 1,
            editable: getEditable(header),
          };
        });
        setWaterColDefs(colDefs);
        const data = json?.Sheet1.rows.map((row: unknown[]) => {
          let result = {};
          row?.forEach((value: unknown, index: number) => {
            result = {
              ...result,
              [getField(json?.Sheet1.headers[index])]: value,
            };
          });
          return result;
        });
        if (data) {
          setWaterfrontGridData(data as LandGridData[]);
          if (waterfront) {
            setLoadingRegression('water');
            try {
              await runWaterFrontFromExcel(json?.Sheet1, datasetId);
              await loadLandData(false);
            } finally {
              setLoadingRegression('');
            }
          }
        }
      }
      //TODO Jorge: implement imported data - https://kingcounty.visualstudio.com/PTAS/_workitems/edit/140293
    } catch (error) {
      console.log(`error`, error);
      appContext.setSnackBar?.({
        severity: 'error',
        text: `Something failed ${error}`,
      });
    } finally {
      setFiles(null);
    }
  };

  const getColumnNames = (from: string): string[] => {
    if (from === 'water')
      return waterColDefs?.map((col) => `${col.headerName}`) || [];
    return (
      nonWaterColDefs?.map((col) => {
        if (`${col.headerName}` === 'to') return 'SqFt';
        if (`${col.headerName}` === 'LandValue') return 'Baseline';
        return `${col.headerName}`;
      }) || []
    );
  };

  const toExcel = async (from: 'water' | 'nonWater'): Promise<void> => {
    const fileName =
      from === 'water'
        ? 'Waterfront schedule.xlsx'
        : 'Nonwaterfront schedule.xlsx';
    setSelectedVariableGrid(from);
    const columns: string[] = getColumnNames(from);

    const data = from === 'water' ? waterfrontGridData : nonWaterGridData;

    const rows = data.map((data) => Object.values(data));

    const toSend: ExcelSheetJson = {
      Sheet1: {
        headers: columns,
        rows: rows,
      },
    };
    console.log({ toSend });
    // return;
    await getExcelFromJson(toSend, fileName);
  };

  const defaultIcons = [
    // {
    //   icon: <InsertDriveFileIcon />,
    //   text: 'Save land model',
    //   onClick: (): Promise<void> | void => {
    //     return saveLandModel();
    //   },
    // },
    {
      icon: <GetAppIcon />,
      text: 'Export',
      onClick: (): void => {
        // return runRegression();
      },
    },
  ];

  const extraIcons = [
    {
      icon: <DeleteIcon />,
      text: 'Delete',
      onClick: (): Promise<void> => {
        return deleteRegression();
      },
      disabled: !postProcess,
    },
  ];

  const deleteRegression = async (): Promise<void> => {
    try {
      if (postProcess) {
        setRunningRegression(true);
        await deleteDatasetPostProcess(postProcess?.datasetPostProcessId);
        await fetchData();
        setDisableApplyButton(true);
        setPostProcess(null);
      }
    } catch (error) {
      console.log(`error`, error);
      appContext.setSnackBar?.({
        text: `Delete regression failed. Message: ${error}`,
        severity: 'error',
      });
    } finally {
      setRunningRegression(false);
    }
  };

  const renderWaterfrontIcons = (): JSX.Element => {
    return (
      <Fragment>
        <CustomIconButton
          text="To Excel"
          icon={<GetAppIcon />}
          onClick={(): void => {
            toExcel('water');
          }}
          disabled={waterfrontGridData.length < 1 || !isEditing('water')}
        />
        <CustomIconButton
          text="From Excel"
          icon={<PublishIcon />}
          onClick={(): void => importFromExcel('water')}
          disabled={!isEditing('water')}
        />
        {isEditing('water') ? (
          <Fragment>
            <CustomIconButton
              text="Save"
              icon={<SaveIcon />}
              onClick={disableContent('water')}
            />
            <CustomIconButton
              text="Cancel"
              icon={<CancelIcon />}
              onClick={cleanBlock}
            />
          </Fragment>
        ) : (
          <CustomIconButton
            text="Edit"
            icon={<EditIcon />}
            onClick={disableContent('water')}
          />
        )}
      </Fragment>
    );
  };

  const renderAdjustmentIcons = (): JSX.Element => {
    if (isEditing('adjustment')) {
      return (
        <Fragment>
          <CustomIconButton
            text="Save"
            icon={<SaveIcon />}
            onClick={disableContent('adjustment')}
          />
          <CustomIconButton
            text="Cancel"
            icon={<CancelIcon />}
            onClick={cleanBlock}
            className={classes.button}
          />
        </Fragment>
      );
    }
    return (
      <CustomIconButton
        text="Edit"
        icon={<EditIcon />}
        onClick={disableContent('adjustment')}
      />
    );
  };

  const renderNonWaterfrontIcons = (): JSX.Element => {
    return (
      <Fragment>
        <CustomIconButton
          text="To Excel"
          icon={<GetAppIcon />}
          onClick={(): void => {
            toExcel('nonWater');
          }}
          disabled={nonWaterGridData.length < 1 || !isEditing('nonWater')}
        />
        <CustomIconButton
          text="From Excel"
          icon={<PublishIcon />}
          onClick={(): void => importFromExcel('nonWater')}
          disabled={!isEditing('nonWater')}
        />
        <CustomIconButton
          text="Apply Regression"
          icon={<CheckIcon />}
          onClick={(): Promise<void> => {
            return runApplyRegression();
          }}
          disabled={!isEditing('nonWater') && !disableApplyButton}
        />
        {isEditing('nonWater') ? (
          <Fragment>
            <CustomIconButton
              text="Save"
              icon={<SaveIcon />}
              onClick={disableContent('nonWater')}
            />
            <CustomIconButton
              text="Cancel"
              icon={<CancelIcon />}
              onClick={cleanBlock}
            />
          </Fragment>
        ) : (
          <CustomIconButton
            text="Edit"
            icon={<EditIcon />}
            onClick={disableContent('nonWater')}
          />
        )}
      </Fragment>
    );
  };

  const updateNonWaterColData = (
    newData: LandGridData[],
    change: boolean
  ): void => {
    if (change) {
      //With change transformation
    }
    setNonWaterGridData(newData);
  };

  const updateWaterFront = async (): Promise<void> => {
    try {
      setLoadingRegression('water');
      setDatasetIsDirty(true);
      const sheet: SheetType = { headers: [], rows: [] };
      if (waterColDefs?.length) {
        sheet.headers = waterColDefs?.map<string>((col) => `${col?.field}`);
      }
      if (waterfrontGridData.length) {
        sheet.rows = waterfrontGridData.map((gridData) =>
          Object.values(gridData)
        );
      }
      const postProcess = await runWaterFrontFromExcel(sheet, datasetId);
      const execute = await executeDatasetPostProcess(
        datasetId,
        `${postProcess?.id}`
      );
      if (execute) setJobId(parseInt(`${execute.id}`));
    } catch (error) {
      getErrorMessage(error, 'water');
    } finally {
      setLoadingRegression('');
      setDatasetIsDirty(false);
      setBlocked('');
    }
  };

  const updateWaterColData = (
    newData: LandGridData[],
    change: boolean
  ): void => {
    //With change transformation
    if (change) {
      setWaterfrontGridData(newData);
    }
  };

  const runAdjustments = async (): Promise<void> => {
    try {
      setLoadingRegression('adjustment');
      const postProcess = await runAdjustment(
        {
          rules: positiveUpdateData,
          datasetId: datasetId,
        },
        adjustmentPostProcess?.datasetPostProcessId
      );
      if (postProcess) {
        const job = await executeDatasetPostProcess(datasetId, postProcess.id);
        if (job) setJobId(parseInt(job.id));
      }
    } catch (error) {
      getErrorMessage(error, 'adjustment');
    } finally {
      setLoadingRegression('');
      setBlocked('');
    }
  };

  const updatePositiveAdjustentGrid = (
    data: LandVariableGridRowData[]
  ): void => {
    setPositiveUpdateData(data);
  };

  const getBlokedStatus = (label: string): boolean => {
    return !!blocked && blocked !== label;
  };

  const isEditing = (label: string): boolean => {
    return label === blocked;
  };

  const updateGridData = (label: string) => (
    data: ExpressionGridData[]
  ): void => {
    if (label === 'nonWater') setNonWaterFrontExpressionData(data);
    if (label === 'water') setWaterFrontExpressionData(data);
  };

  const cleanBlock = (): void => setBlocked('');

  const renderEcuation = (): JSX.Element => {
    if (predictedEcuation.length) {
      return (
        <span className={classes.ecuation}>
          LandValue = {predictedEcuation}
        </span>
      );
    }
    return <></>;
  };

  if (runningRegression || loadingPostProcess || !project) return <Loading />;

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
          <span>Land Model</span>,
        ]}
        icons={defaultIcons}
        detailBottom={getBottom(userInfo, project)}
      />
      <CustomSection
        title="Regression analysis"
        iconText="Use Regression"
        iconOnClick={createRegression}
        key={regressionViewKey}
        extraIcons={extraIcons}
      >
        {renderEcuation()}
      </CustomSection>
      <ScheduleGrid
        sectionTitle="Nonwaterfront schedule"
        isLoading={
          (isLoading && selectedVariableGrid === 'nonWater') ||
          (selectedSection === 'nonWater' && fromExcelLoading)
        }
        loadingRegression={loadingRegression}
        classes={classes}
        blockUI={getBlokedStatus('nonWater')}
        editing={isEditing('nonWater')}
        colDefs={nonWaterColDefs}
        updateGridData={updateNonWaterColData}
        gridData={nonWaterfrontGridData}
        errorMessage={errorMessage}
        type="nonWater"
      >
        <div className={classes.icons}>{renderNonWaterfrontIcons()}</div>
      </ScheduleGrid>
      <SectionContainer title="Non-Waterfront Expressions">
        {loadingRegression === 'nonWaterExpression' ? (
          <div className={classes.sectionLoader}>
            <Loader type="Oval" color="#00BFFF" height={80} width={80} />
          </div>
        ) : (
          <Fragment>
            <ExpressionsGrid
              rowData={nonWaterFrontExpressionData}
              updateGridData={updateGridData('nonWater')}
              title="New non-waterfront expression"
              blocking={getBlokedStatus('nonWaterExpression')}
              editing={isEditing('nonWaterExpression')}
              editOrSave={disableContent('nonWaterExpression')}
              cancel={cleanBlock}
            />
            {errorMessage?.section === 'nonWaterExpression' &&
              errorMessage?.message && (
                <ErrorMessage message={errorMessage.message} />
              )}
          </Fragment>
        )}
      </SectionContainer>
      <ScheduleGrid
        sectionTitle="Waterfront schedule"
        isLoading={
          (isLoading && selectedVariableGrid === 'water') ||
          (selectedSection === 'water' && fromExcelLoading)
        }
        loadingRegression={loadingRegression}
        classes={classes}
        blockUI={getBlokedStatus('water')}
        editing={isEditing('water')}
        colDefs={waterColDefs}
        updateGridData={updateWaterColData}
        gridData={waterfrontGridData}
        errorMessage={errorMessage}
        type="water"
      >
        <div className={classes.icons}>{renderWaterfrontIcons()}</div>
      </ScheduleGrid>
      <SectionContainer title="Waterfront Expressions">
        {loadingRegression === 'waterExpression' ? (
          <div className={classes.sectionLoader}>
            <Loader type="Oval" color="#00BFFF" height={80} width={80} />
          </div>
        ) : (
          <Fragment>
            <ExpressionsGrid
              rowData={waterFrontExpressionData}
              updateGridData={updateGridData('water')}
              title="New waterfront expression"
              editing={isEditing('waterExpression')}
              blocking={getBlokedStatus('waterExpression')}
              cancel={cleanBlock}
              editOrSave={disableContent('waterExpression')}
            />
            {errorMessage?.section === 'waterExpression' &&
              errorMessage?.message && (
                <ErrorMessage message={errorMessage.message} />
              )}
          </Fragment>
        )}
      </SectionContainer>
      <SectionContainer title="Adjustments">
        {loadingRegression === 'adjustment' ? (
          <div className={classes.sectionLoader}>
            <Loader type="Oval" color="#00BFFF" height={80} width={80} />
          </div>
        ) : (
          <Fragment>
            <LandVariableGrid
              rowData={positiveGridData}
              updateColData={updatePositiveAdjustentGrid}
              datasetId={datasetId}
              postProcessId={''}
            >
              {renderAdjustmentIcons()}
            </LandVariableGrid>
            {errorMessage?.section === 'adjustment' &&
              errorMessage?.message && (
                <ErrorMessage message={errorMessage.message} />
              )}
          </Fragment>
        )}
      </SectionContainer>
      <input
        type="file"
        ref={inputFileRef}
        onChange={(event): void => setFiles(event.target.files)}
        accept=".xlsx"
        multiple={false}
        style={{ display: 'none' }}
      />
    </Fragment>
  );
};

export default NewLandPage;
