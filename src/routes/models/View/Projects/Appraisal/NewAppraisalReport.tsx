// NewAppraisalReport.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { makeStyles } from '@material-ui/core';
import {
  // Banner,
  CustomIconButton,
  DropDownItem,
  IconToolBarItem,
  SimpleDropDown,
} from '@ptas/react-ui-library';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import CustomHeader from 'components/common/CustomHeader';
import { Link, useHistory, useParams } from 'react-router-dom';
import CustomSimpleDropdown, {
  CustomSimpleDropdownProps,
} from 'components/common/CustomSimpleDropdown';
import clsx from 'clsx';
import { AppContext } from 'context/AppContext';
import {
  executeDatasetPostProcess,
  getDatasetColumns,
  getDatasetPostProcess,
  getUserProject,
  importRScriptPostProcess,
} from 'services/common';
import {
  CustomSearchExpressions,
  GetDatasetColumnsResponseResultsItem,
  GetOneProjectResult,
  ImportRScriptPostProcessRequest,
  RegressionDetails,
  RScriptModelItem,
} from 'services/map.typings';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { useCounter, useLatest, useList, useMap, useToggle } from 'react-use';
import { isNumber, uniqueId } from 'lodash';
import { getRScriptModels } from '../../Regression/common';
import { getCurrentReport, getHighestPriority, sleep } from './utility';
import defaultValues from "routes/models/View/Projects/defaultValues.json";
import Loading from 'components/Loading';

interface DropData {
  [key: string]: GetDatasetColumnsResponseResultsItem;
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: 32,
  },
  topDrops: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: 32,
    width: 230,
  },
  dropRoot: {
    width: 'unset',
    marginBottom: 16,
  },
  break: {
    width: 250,
  },
  title: {
    fontFamily: theme.ptas.typography.bodyFontFamily,
    fontSize: '1.125rem',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: 16,
  },
  customDrop: {
    marginLeft: 16,
  },
  newBreak: {
    marginLeft: 12,
  },
}));

/**
 * NewAppraisalReport
 *
 * @param props - Component props
 * @returns A JSX element
 */
function NewAppraisalReport(): JSX.Element {
  const classes = useStyles();
  const { id }: { id: string } = useParams();
  const history = useHistory();
  const appContext = useContext(AppContext);
  const [model, setModel] = useState<GetOneProjectResult | null>(null);
  const [datasetId, setDatasetId] = useState<string>('');
  const [columns, setColumns] = useState<
    GetDatasetColumnsResponseResultsItem[]
  >([]);

  const [priority, setPriority] = useState<number>(0);
  const [defaultPriority, setDefaultPriority] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useToggle(false);
  const [lastReportNumber, setLastReportNumber] = useState<number | null>(null);

  const [dropdownData, setDropdownData] = useState<DropDownItem[]>([]);

  //used to set an unique id to the simple dropdowns
  const [counter, counterMethods] = useCounter(1);

  //used to build the custom simple dropdowns (breaks)
  const [breaks, breaksMethods] = useList<CustomSimpleDropdownProps>();

  const latestBreaks = useLatest(breaks);

  //state of the selected breaks
  const [data, { set, remove }] = useMap<DropData>();

  const [
    appraisalVariable,
    setAppraisalVariable,
  ] = useState<GetDatasetColumnsResponseResultsItem>();
  const [
    salesPriceVariable,
    setSalesPriceVariable,
  ] = useState<GetDatasetColumnsResponseResultsItem>();

  const [reports, setReports] = useState<RScriptModelItem[]>([]);
  const [dropdownReportData, setDropdownReportData] = useState<DropDownItem[]>(
    []
  );
  const [selectedReport, setSelectedReport] = useState<RScriptModelItem>();

  const setSnackMessage = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ): void => {
    appContext.setSnackBar &&
      appContext.setSnackBar({ text: message, severity: severity });
  };

  const icons: IconToolBarItem[] = [
    {
      icon: <InsertDriveFileIcon />,
      text: 'Create appraisal ratio report',
      onClick: async (): Promise<void> => createReport(),
      disabled:
        !selectedReport ||
        !appraisalVariable ||
        !salesPriceVariable ||
        !data ||
        Object.keys(data).length < 3 ||
        isProcessing,
    },
  ];

  const getResultPayload = async (
    datasetPostProcessId: string
  ): Promise<string | undefined> => {
    try {
      const response = await getDatasetPostProcess(datasetPostProcessId);
      return response?.postProcess.resultPayload;
    } catch (error) {
      setSnackMessage('Getting result payload failed', 'error');
    }
  };

  useEffect(() => {
    const defaultPriority = defaultValues.defaultPriorities.appraisalReport;

    if (defaultPriority && isNumber(defaultPriority)) {
      setDefaultPriority(defaultPriority);
    }

    const fetchData = async (): Promise<void> => {
      try {
        const data = await getUserProject(id);
        setModel(data);
        if (!data) return;
        setPriority(getHighestPriority(data, defaultPriority));
        setLastReportNumber(getCurrentReport(data));
      } catch (error) {
        setSnackMessage('Failed loading user project', 'error');
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  //Populate reports dropdown
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const toAdd: DropDownItem[] = [];
      try {
        const models = await getRScriptModels();
        const reports = models.filter(
          (m) => m.rscriptModelRole === 'AppraiserRatiosReport'
        );
        setReports(reports);
        reports.forEach((r) => {
          toAdd.push({ label: r.rscriptModelName, value: r.rscriptModelId });
        });
        setDropdownReportData(toAdd);
      } catch (error) {
        setSnackMessage('Failed loading reports', 'error');
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Get the dataset columns and sets the dropdown content
  useEffect(() => {
    if (!model) return;

    const datasetId = model.project?.projectDatasets.find(
      (p) => p.datasetRole.toLocaleLowerCase() === 'sales'
    )?.datasetId;

    if (!datasetId) {
      setSnackMessage('Dataset id not found', 'warning');
      return;
    }
    setDatasetId(datasetId);

    const fetchData = async (): Promise<void> => {
      const toAdd: DropDownItem[] = [];
      try {
        const columns = await getDatasetColumns(datasetId);
        if (!columns) return;

        setColumns(columns.datasetColumns);

        columns?.datasetColumns.forEach((c) =>
          toAdd.push({ label: c.columnName, value: c.columnName })
        );
        setDropdownData(toAdd.sort((a, b) => a.label.localeCompare(b.label)));
      } catch (error) {
        setSnackMessage('Error getting the dataset columns', 'error');
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  const onBreakSelect = (
    item: DropDownItem,
    prevItem?: React.ReactText
  ): void => {
    const column = columns.find((c) => c.columnName === item.value);
    if (!column) return;
    if (prevItem) remove(prevItem);
    set(item.label, column);
  };

  const createReport = async (): Promise<void> => {
    if (
      !selectedReport ||
      !datasetId ||
      !appraisalVariable ||
      !salesPriceVariable ||
      !data
    )
      return;
    setIsProcessing(true);
    const importBreaks: CustomSearchExpressions[] = [];

    let breakCounter = 1;
    Object.keys(data).forEach((k) => {
      if (
        k === appraisalVariable.columnName ||
        k === salesPriceVariable.columnName
      )
        return;
      importBreaks.push({
        expressionType: 'RScript',
        expressionRole: 'RScriptParameter',
        script: k,
        columnName: `Break${breakCounter}`,
        note: null,
        category: null,
      });
      breakCounter++;
    });

    if (!importBreaks) return;

    const importRequest: ImportRScriptPostProcessRequest = {
      datasetId: datasetId,
      postProcessName: lastReportNumber
        ? `Appraisal Ratio Report ${lastReportNumber + 1}`
        : 'Appraisal Ratio Report',
      postProcessRole: 'AppraisalRatioReport',
      priority: priority === 0 ? defaultPriority : priority + 10,
      rScriptModelId: selectedReport.rscriptModelId,
      postProcessDefinition: 'Appraisal Ratio Report',
      customSearchExpressions: [
        {
          expressionType: 'RScript',
          expressionRole: 'RScriptParameter',
          script: selectedReport.rscriptModelName,
          columnName: 'Report',
          note: null,
          category: null,
        },
        {
          expressionType: 'RScript',
          expressionRole: 'RScriptParameter',
          script: appraisalVariable.columnName,
          columnName: 'AppraisalVariable',
          note: null,
          category: null,
        },
        {
          expressionType: 'RScript',
          expressionRole: 'RScriptParameter',
          script: salesPriceVariable.columnName,
          columnName: 'SalesPriceVariable',
          note: null,
          category: null,
        },
        ...importBreaks,
      ],
    };

    try {
      const importResponse = await importRScriptPostProcess(importRequest);
      if (!importResponse) {
        setIsProcessing(false);
        setSnackMessage('Import process id is null', 'warning');
        return;
      }
      await executeDatasetPostProcess(datasetId, importResponse.id, [
        {
          id: 0,
          name: '',
          value: '',
        },
      ]);

      let result = await getResultPayload(importResponse.id);
      while (!result) {
        await sleep(3000);
        result = await getResultPayload(importResponse.id);
      }

      const payload: RegressionDetails = JSON.parse(
        result
      ) as RegressionDetails;

      history.push(
        `/models/reports/${id}/${importResponse.id}/${payload.FileResults[0].FileName}`
      );
    } catch (error) {
      setIsProcessing(false);
      setSnackMessage('Error creating appraisal report', 'error');
    }
  };

  //Adds a default empty break
  useEffect(() => {
    if (dropdownData.length < 1) return;
    breaksMethods.push({
      id: uniqueId('Break'),
      items: dropdownData,
      onSelected: onBreakSelect,
      onButtonClickWithValue: (id, value): void => {
        breaksMethods.removeAt(
          latestBreaks.current.findIndex((b) => b.id === id)
        );
        if (!value) return;
        remove(value);
      },
      disable: data,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dropdownData]);

  const addBreak = (): void => {
    counterMethods.inc(1);
    breaksMethods.push({
      id: `break${counter}`,
      items: dropdownData,
      onSelected: onBreakSelect,
      onButtonClickWithValue: (id, value): void => {
        breaksMethods.removeAt(
          latestBreaks.current.findIndex((b) => b.id === id)
        );
        if (!value) return;
        remove(value);
      },
      disable: data,
    });
  };

  const renderBreaks = useCallback(() => {
    breaks.map((b) => (b.disable = data));
    return breaks.map((b) => {
      return (
        <CustomSimpleDropdown
          key={b.id}
          classes={{ root: clsx(classes.dropRoot, classes.customDrop) }}
          id={b.id}
          items={b.items}
          onSelected={b.onSelected}
          disable={b.disable}
          onButtonClickWithValue={b.onButtonClickWithValue}
        />
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breaks, data]);

  if(isProcessing) return <Loading />

  return (
    <Fragment>
      <CustomHeader
        route={[
          <Link to="/models" style={{ color: 'black' }}>
            Models
          </Link>,
          <Link to={`/models/view/${id}`} style={{ color: 'black' }}>
            {model?.project?.projectName}
          </Link>,
          <span>New appraisal ratio report</span>,
        ]}
        icons={icons}
      />
      <div className={classes.root}>
        <div className={classes.topDrops}>
          <SimpleDropDown
            items={dropdownReportData}
            onSelected={(item): void =>
              setSelectedReport(
                reports.find((r) => r.rscriptModelId === item.value)
              )
            }
            label="Report"
            classes={{ root: classes.dropRoot }}
          />
          <SimpleDropDown
            items={dropdownData}
            onSelected={(item, prevItem): void => {
              onBreakSelect(item, prevItem);
              setAppraisalVariable(
                columns.find((c) => c.columnName === item.value)
              );
            }}
            label="Appraisal variable"
            classes={{ root: classes.dropRoot }}
            disable={data}
          />
          <SimpleDropDown
            items={dropdownData}
            onSelected={(s, prevItem): void => {
              onBreakSelect(s, prevItem);
              setSalesPriceVariable(
                columns.find((c) => c.columnName === s.value)
              );
            }}
            label="Sales price variable"
            classes={{ root: classes.dropRoot }}
            disable={data}
          />
        </div>
        <div className={classes.break}>
          <label className={classes.title}>Breaks</label>
          {renderBreaks()}
          <CustomIconButton
            icon={<AddCircleIcon />}
            text="New break"
            className={classes.newBreak}
            onClick={addBreak}
            disabled={
              Object.keys(data).length === columns.length ||
              breaks.length === columns.length
            }
          />
        </div>
      </div>
    </Fragment>
  );
}

export default NewAppraisalReport;
