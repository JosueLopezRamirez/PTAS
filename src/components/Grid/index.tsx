// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import React, { Fragment, useCallback, useContext } from 'react';
import { useState, useEffect } from 'react';
import { AgGridReact, AgGridReactProps } from 'ag-grid-react';
import {
  makeStyles,
  Modal,
  // Box
} from '@material-ui/core';
import {
  // AutoComplete,
  AutoCompleteRow,
  CustomPopover,
} from '@ptas/react-ui-library';
import {
  AgGridProps,
  GetDatasetColumnsResponseResultsItem,
  GetDataUserStateResponseResultsItem,
  AgGridChildType,
  ColDefDatasetConfig,
  SaveDataSetUserStateParamType,
  LookupItemsListType,
  SaveCalculatedColumnType,
  IdValue,
  ReturnFromRevert,
  UpdatedColumnType,
  UpdatedColumnManualType,
  GenericGridRowData,
  GetDataSetDataResponseResults,
  DuplicateDatasetType,
} from '../../services/map.typings';
import 'ag-grid-enterprise';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import agGridService from '../../services/AgGridService';
import moment from 'moment';
import {
  GridOptions,
  ValueFormatterParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  Column,
  // CellValueChangedEvent,
  RowEditingStoppedEvent,
  ColDef,
  SortChangedEvent,
  DragStoppedEvent,
  SideBarDef,
  RowNode,
  RangeSelectionChangedEvent,
  ProcessCellForExportParams,
} from 'ag-grid-community';
import clsx from 'clsx';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import VariableGrid from './variableGrid';
import { AppContext } from 'context/AppContext';
import { NumericCellEditor } from './numeric-cell-editor';
import { DateCellEditor } from './date-cell-editor';
import '../../assets/grid-styles/styles.scss';
import { RegularExpressionCellEditor } from './regular-expression-editor';
import { ComboBoxCellEditor } from './combo-box-editor';
import { DropdownCellEditor } from './dropdown-cell-editor';
import { DropdownEditCellEditor } from './dropdown-edit-cell-editor';
import { useCustomChannel } from 'components/common/useSignalR';
import StatusBarComponent from './StatusBar';
import Save, { FormValue } from './Save';
import { renameDataset } from 'services/common';
import Loading from 'components/Loading';
import {
  handleSelectRowsWithCell,
  // handleSelectRowsWithCheckbox,
} from './methods';
import { isBoolean } from 'lodash';
import { useDebounce } from 'react-use';
import { RequestQueue } from 'services/AxiosLoader';
import BlockUi from 'react-block-ui';

// interface RowClickEvent {
//   rowIndex: number;
// }

interface GridState {
  jobId: string;
  from: string;
}

// eslint-disable-next-line
const useStyles = makeStyles((theme) => ({
  // eslint-disable-next-line
  root: (props: AgGridProps) => {
    return {
      height: props.height,
      width: props.width,
    };
  },
  autoComplete: {
    marginLeft: 'auto',
    maxWidth: '370px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  counterRow: {
    paddingRight: '5px',
  },
  infobar: {
    backgroundColor: '#f8f8f8',
    paddingBottom: '6px',
    paddingTop: '6px',
  },
  title: {
    fontSize: theme.ptas.typography.bodyLarge.fontSize,
    fontFamily: theme.ptas.typography.bodyFontFamily,
    borderBottom: '1px solid silver',
    display: 'block',
    paddingBottom: theme.spacing(1),
  },
  categoryList: {
    position: 'relative',
    paddingTop: 10,
  },
  saveSearch: {
    margin: 0,
    padding: theme.spacing(2, 4, 4, 4),
  },
  closeButton: {
    fontSize: 40,
  },
  modal: {
    backgroundColor: '#fff',
    width: '450px',
    position: 'relative',
  },
  saveSearchTitle: {
    fontSize: '1.375rem',
    fontFamily: theme.ptas.typography.bodyFontFamily,
  },
  paper: {
    position: 'absolute',
  },
}));
// eslint-disable-next-line
const getModalStyle = () => {
  return {
    top: '50%',
    left: '50%',
    transform: 'translate(-50%,-50%)',
  };
};
let timer: NodeJS.Timeout;

const debounceRequest = (callback: Function, wait = 0): Function => {
  return (...args: Record<string, unknown>[]): void => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
};

const AgGrid = React.forwardRef(
  (props: AgGridProps, ref): JSX.Element => {
    const {
      datasetId: urlDataSetId,
      id,
    }: { datasetId: string; id: string } = useParams();

    const [datasetId, setDatasetId] = useState(props.id || urlDataSetId);

    useEffect(() => {
      setDatasetId(props.id);
    }, [props.id]);

    const {
      shouldDisplayVariablesGrid,
      setSnackBar,
      selectAllRows,
      unselectAllRows,
      shouldHideSelectedRows,
      toggleHideSelectedRows,
      toggleShowSelectedRows,
      shouldShowSelectedRows,
      shouldDisplayAutoFitGrid,
      toggleAutoFitColumns,
      shouldDuplicateDataset,
      toggleDuplicateDataset,
      toggleDeleteSelectedRows,
      shouldDeleteSelectedRows,
      shouldDuplicateFilteredDataset,
      toggleDuplicateFilteredDataset,
      shouldShowColumns,
      toggleShowColumns,
      toogleCountTotalRecords,
      shouldHideDataColumns,
      shouldHideVariablesColumns,
    } = useContext(AppContext);

    const agGrid = React.createRef<AgGridReact>();
    const classes = useStyles(props);

    const { message } = useCustomChannel('DatasetSelectionChanged');

    const [openModal, setOpenModal] = useState<boolean>(false);
    const [inProgress, setInProgress] = useState<boolean>(false);
    const [selectedRows, setSelectedRows] = useState<IdValue[]>([]);

    const [pastedRows, setPastedRows] = useState<IdValue[]>([]);

    const [isDatasetReady, setisDatasetReady] = useState<boolean>(false);
    const [datasetStatusCode, setDatasetStatusCode] = useState<string>(
      'unavailable'
    );
    const [loading, setLoading] = useState<boolean>(true);
    const [startedRow, setStartedRow] = useState<boolean>(false);

    const [hideColumns, sethideColumns] = useState<string[]>([]);
    const [gridVariableData, setGridVariableData] = useState<
      GenericGridRowData[] | undefined
    >([]);

    useEffect(() => {
      props.getLoading && props.getLoading(loading);
      //eslint-disable-next-line
    }, [loading]);

    const siderbarConfig = useCallback(
      (): SideBarDef => {
        return {
          toolPanels: [
            {
              id: 'columns',
              labelDefault: 'Columns',
              labelKey: 'columns',
              iconKey: 'columns',
              toolPanel: 'agColumnsToolPanel',
              toolPanelParams: {
                suppressPivotMode: true,
              },
            },
            {
              id: 'filters',
              labelDefault: 'Filters',
              labelKey: 'filters',
              iconKey: 'filter',
              toolPanel: 'agFiltersToolPanel',
            },
          ],
          defaultToolPanel: 'columns',
        };
      },
      //eslint-disable-next-line
      [isDatasetReady]
    );

    const updateDataRows = async (data: IdValue[]): Promise<IdValue> => {
      const editable = [...data];
      try {
        const s = await agGridService.saveUpdateDatasetData(
          datasetId,
          editable
        );
        if (s.length) {
          if (props.setEnabledRevert) {
            props.setEnabledRevert();
            setUpdateRowCounter((prev) => prev + 1);
          }
        }
        return { data: s[0] };
      } catch (error) {
        return { error: error };
      }
    };
    //eslint-disable-next-line
    const [searchCol, setSearchCol] = useState<AutoCompleteRow>({
      title: '',
      originalRow: null,
    });

    const updateRowsInGrid = (): void => {
      gridOptions?.api?.forEachNode((node) => {
        if (Array.isArray(message?.arg3)) {
          let rowSelected = { Selection: false };
          if (node.data.major && node.data.minor) {
            rowSelected = message?.arg3.find(
              (row) =>
                // node.data.CustomSearchResultId === row.CustomSearchResultId ||
                node.data.major &&
                node.data.minor &&
                node.data.major === row.Major &&
                node.data.minor === row.Minor
            );
          }
          if (node.data.Major && node.data.Minor) {
            rowSelected = message?.arg3.find(
              (row) =>
                // node.data.CustomSearchResultId === row.CustomSearchResultId ||
                node.data.Major &&
                node.data.Minor &&
                node.data.Major === row.Major &&
                node.data.Minor === row.Minor
            );
          }
          if (rowSelected) {
            node?.setDataValue('Selection', rowSelected?.Selection);
            gridOptions?.api?.redrawRows();
          }
        }
      });
    };

    useDebounce(
      (): void => {
        if (pastedRows.length === 0) return;
        updateDatasetPastedRows(pastedRows, updateData).then(() => {
          setPastedRows([]);
        });
      },
      2000,
      [pastedRows]
    );

    const updateDatasetPastedRows = (
      pastedRows: IdValue[],
      callback: Function
    ): Promise<void> => {
      const payload = [...pastedRows];
      if (payload.length <= 250) {
        return callback(payload).then(() => {
          setInProgress(false);
          gridOptions.api?.redrawRows();
        });
      }

      // if (payload.length > 250) {
      const newPayload = payload.slice(0, 250);
      return callback(newPayload).then(() => {
        updateDatasetPastedRows(payload.slice(250, payload.length), callback);
      });
      // }
    };

    const updateData = (payload: IdValue[]): Promise<void> => {
      return agGridService
        .saveUpdateDatasetData(datasetId, payload)
        .then((s) => {
          if (s.length) {
            if (props.setEnabledRevert) {
              props.setEnabledRevert();
              setUpdateRowCounter((prev) => prev + s.length);
            }
          }
          gridOptions?.api?.forEachNode((rowNode) => {
            const rowData = s.find(
              (n: IdValue) =>
                n?.CustomSearchResultId === rowNode?.data?.CustomSearchResultId
            );
            if (rowData) {
              gridOptions.api?.getRowNode(rowNode.id)?.setData(rowData);
            }
          });
        })
        .catch((error) => console.log('error', error));
    };

    useDebounce(
      (): void => {
        if (selectedRows.length === 0) return;
        if (!inProgress) {
          setInProgress(true);
        }
        updateDatasetPastedRows(selectedRows, updateDataRows).then(() => {
          setSelectedRows([]);
          setInProgress(false);
        });
      },
      2000,
      [selectedRows]
    );

    useEffect(() => {
      if (message?.arg1 === datasetId && message?.arg2 !== 'CS') {
        if (!startedRow) {
          return updateRowsInGrid();
        }
        if (startedRow) {
          setSnackBar &&
            setSnackBar({
              severity: 'success',
              text:
                'The selection changed in the dataset, it will refresh the new information when it finishes editing the row.!!',
            });
        }
      }
      //eslint-disable-next-line
    }, [startedRow, message]);

    useEffect(() => {
      if (!shouldShowColumns) return;
      showHideColumns();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowColumns]);

    const showHideColumns = (): void => {
      hideColumns.forEach((columnId) => {
        gridOptions?.columnApi?.setColumnVisible(columnId, true);
      });
      toggleShowColumns && toggleShowColumns();
    };

    useEffect(() => {
      if (shouldHideSelectedRows) {
        hideSelectedRows();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldHideSelectedRows]);

    useEffect(() => {
      if (shouldShowSelectedRows) {
        showSelectedRows();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldShowSelectedRows]);

    // eslint-disable-next-line
    const [colSearchOptions, setColSearchOptions] = useState<AutoCompleteRow[]>(
      []
    );

    //Calculated cols for supplemental grid
    const [calculatedCols, setcalculatedCols] = useState<
      GetDatasetColumnsResponseResultsItem[]
    >();
    const [calculatedColumnData, setCalculatedColumnData] = useState<
      SaveCalculatedColumnType[]
    >([]);

    const [columnVirtualization, setColumnVirtualization] = useState<boolean>(
      true
    );

    const history = useHistory();

    const [rowSelection] = useState('multiple');
    const [rowModelType] = useState('serverSide');
    const [enableSorting, setEnableSorting] = useState(false);
    // const [rowGroupPanelShow] = useState('always');
    const [columnDefs, setColumnDefs] = useState<ColDef[]>([]);
    //eslint-disable-next-line
    const [countTotalSelection, setCountTotalSelection] = useState<number>(0);
    const [gridOptions, setGridOptions] = useState<GridOptions>({});
    // Ag Grid Types
    const [lookupItemsList] = useState({} as LookupItemsListType);
    // Handle variables
    let [isLoadedQty] = useState<number>(0);

    const [editedColumns, setEditedColumns] = useState<
      UpdatedColumnManualType[]
    >([]);

    const location = useLocation<GridState>();

    useEffect(() => {
      if (editedColumns.length) {
        gridOptions.api?.refreshCells({
          force: true,
        });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editedColumns.length]);

    // Ag Grid definition
    const [defaultColDef] = useState<ColDef>({
      flex: 1,
      minWidth: 35,
      // width: 35,
      cellClass: 'cellClassHeigth',
      filter: 'agTextColumnFilter',
      // enableRowGroup: true,
      resizable: true,
    });

    const duplicateDataset = async (): Promise<DuplicateDatasetType | null> => {
      if (!shouldDuplicateDataset) return null;
      try {
        const result = await agGridService.duplicateDataset(datasetId);
        setSnackBar &&
          setSnackBar({
            severity: 'success',
            text: 'Success to create dataset with selected rows',
          });
        toggleDuplicateDataset && toggleDuplicateDataset();
        return result;
      } catch (error) {
        toggleDuplicateDataset && toggleDuplicateDataset();
        setSnackBar &&
          setSnackBar({
            severity: 'error',
            text: 'Error to duplicate dataset with selected rows',
          });
        return null;
      }
    };

    const duplicateFilteredDataset = async (): Promise<DuplicateDatasetType | null> => {
      if (!shouldDuplicateFilteredDataset) return null;
      try {
        const result = await agGridService.duplicateDataset(datasetId, false);
        setSnackBar &&
          setSnackBar({
            severity: 'success',
            text: 'Success to create dataset with filtered rows',
          });
        toggleDuplicateFilteredDataset && toggleDuplicateFilteredDataset();
        return result;
      } catch (error) {
        toggleDuplicateFilteredDataset && toggleDuplicateFilteredDataset();
        setSnackBar &&
          setSnackBar({
            severity: 'error',
            text: 'Error to duplicate dataset with filtered rows',
          });
        return null;
      }
    };

    useEffect(() => {
      if (shouldDuplicateDataset) {
        setOpenModal(shouldDuplicateDataset);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldDuplicateDataset]);

    useEffect(() => {
      if (shouldDuplicateFilteredDataset) {
        setOpenModal(shouldDuplicateFilteredDataset);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldDuplicateFilteredDataset]);

    const deleteRows = async (): Promise<void> => {
      if (!shouldDeleteSelectedRows) return;
      try {
        await agGridService.deleteRows(datasetId);
        setSnackBar &&
          setSnackBar({
            severity: 'success',
            text: 'Success to delete filtered rows',
          });
        props.reloadGrid && props.reloadGrid();
      } catch (error) {
        setSnackBar &&
          setSnackBar({
            severity: 'error',
            text: 'Error to delete filtered rows',
          });
      } finally {
        toggleDeleteSelectedRows && toggleDeleteSelectedRows();
      }
    };

    useEffect(() => {
      deleteRows();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldDeleteSelectedRows]);

    const sizeToFit = (): void => {
      if (gridOptions) {
        const allColIds = gridOptions?.columnApi
          ?.getAllColumns()
          .filter(
            (column) =>
              !['Selection', 'Revert', 'Status', 'ID'].includes(
                column.getColId()
              )
          )
          .map((column) => column?.getColId());
        if (allColIds?.length)
          gridOptions?.columnApi?.autoSizeColumns(allColIds);
        if (shouldDisplayAutoFitGrid)
          toggleAutoFitColumns && toggleAutoFitColumns();
      }
    };

    useEffect(() => {
      sizeToFit();
      if (!props.externalUse) saveConfiguration();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldDisplayAutoFitGrid]);

    const addColumnsDefs = (columnJson: ColDef): void => {
      setColumnDefs((columnDefs) => [...columnDefs, columnJson]);
    };

    // eslint-disable-next-line
    // const [, setAggridColumnsConfig] = useState<ColDef[]>([]);
    // const addAgGridColumnsDefs = (columnConfig: ColDef): void => {
    //   setAggridColumnsConfig((aggridColumnsConfig) => [
    //     ...aggridColumnsConfig,
    //     columnConfig,
    //   ]);
    // };

    const [dataSourceConfig, setDataSourceConfig] = useState({});

    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(
      null
    );

    const [displayMessage, setDisplayMessage] = useState('');

    const [updateRowCounter, setUpdateRowCounter] = useState<number>(0);

    useEffect(() => {
      if (!updateRowCounter) {
        if (props.setEnabledRevert) {
          props.setEnabledRevert(true);
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updateRowCounter]);

    // cell renderers
    const revertRenderer = (params: ValueFormatterParams): HTMLElement => {
      const validated = !!params.data?.Validated;
      const display = document.createElement('div');
      if (validated) {
        display.innerHTML = `↩`;
        display.className = 'revert-button';
        display.addEventListener('click', async () => {
          try {
            const returnedFromRevert = await revertRow(params.data);
            if (!returnedFromRevert) return;
            const newData = {
              ...params.data,
              ...returnedFromRevert.results[0],
            };
            // const showStatus = returnedFromRevert.totalUpdatedRows > 0;
            // const showExported = returnedFromRevert.totalExportedRows > 0;
            // setTimeout(() => {
            //   params.columnApi?.setColumnVisible('Status', showStatus);
            //   params.columnApi?.setColumnVisible('Export', showExported);
            //   params.columnApi?.setColumnVisible(
            //     'Revert',
            //     showStatus || showExported
            //   );
            // }, 0);
            params.node.setData(newData);
          } catch (error) {
            console.log(error);
            setDisplayMessage(error);
          }
        });
      }
      return display;
    };

    const statusCellRenderer = (params: ValueFormatterParams): HTMLElement => {
      const validated = !!params.data?.Validated;
      const display = document.createElement('div');
      if (validated) {
        const isValid = !!params.data?.IsValid;
        const ErrorMessage =
          params.data?.ErrorMessage || (isValid ? 'Valid' : 'Unknown error');
        display.title = ErrorMessage;
        display.className = isValid ? 'valid' : 'invalid';
        display.innerHTML = `${isValid ? '✔' : '❌'}`;
        display.addEventListener('click', function () {
          setDisplayMessage(ErrorMessage);
          setAnchorElement(display);
        });
      }
      return display;
    };

    const exportCellRenderer = (params: ValueFormatterParams): HTMLElement => {
      const exported = !!params.data?.BackendExportState;
      const display = document.createElement('div');
      if (exported) {
        const isValid = params.data?.BackendExportState === 'ExportSuccessful';
        const ErrorMessage =
          params.data?.ExportedToBackEndErrorMessage ||
          (isValid ? 'Valid' : 'Unknown error');
        display.title = ErrorMessage;
        display.className = isValid ? 'valid' : 'invalid';
        display.innerHTML = `${isValid ? '✔' : '❌'}`;
        display.addEventListener('click', function () {
          setDisplayMessage(ErrorMessage);
          setAnchorElement(display);
        });
      }
      return display;
    };

    const booleanCellRendererSelection = (
      params: ValueFormatterParams
    ): HTMLInputElement => {
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = params.value;
      // input.addEventListener('click', () => {});
      return input;
    };

    const updateCalculatedColData = (
      newData: SaveCalculatedColumnType[]
    ): void => {
      setCalculatedColumnData(newData);
    };

    const hideSelectedRows = (): void => {
      gridOptions.api?.forEachNode((node: RowNode) => {
        if (node.data?.Selection) {
          node.setRowHeight(0, true);
        }
      });
      if (toggleHideSelectedRows) toggleHideSelectedRows(false);
    };

    const showSelectedRows = (): void => {
      gridOptions.api?.forEachNode((node) => {
        if (node.data?.Selection) node.setRowHeight(25);
      });
      if (toggleShowSelectedRows) toggleShowSelectedRows(false);
    };

    //Checks if the dataset is ready to decide if the grid should be initialized
    const getDatasetStatus = async (): Promise<void> => {
      const datasetStatus = await agGridService.getDataSetStatus(
        datasetId,
        parseInt(props?.postProcessId || '1')
      );

      const status = datasetStatus?.datasetState === 'Processed';
      if (status) {
        setLoading(false);
        setDatasetStatusCode('');
      } else {
        setDatasetStatusCode(datasetStatus?.datasetState || 'unavailable');
      }
      setisDatasetReady(status);

      if (!status) {
        const debounced = debounceRequest(getDatasetStatus, 1000);
        debounced();
      }
    };

    const addSearchOption = (option: AutoCompleteRow): void => {
      setColSearchOptions((colSearchOptions) => [...colSearchOptions, option]);
    };

    const callGetStatus = (): void => {
      getDatasetStatus();
      return clearTimeout(timer);
    };

    const purgeServerSideCache = (): void => {
      const agGridColumns: AgGridReactProps | null = agGrid?.current;

      if (agGridColumns) {
        agGridColumns.api?.purgeServerSideCache();
      }
    };

    useEffect(callGetStatus, []);

    useEffect(() => {
      const agGridColumns: AgGridReactProps | null = agGrid?.current;

      if (agGridColumns && searchCol.originalRow) {
        const colId = `${searchCol.originalRow}`;
        agGridColumns?.api?.ensureColumnVisible(colId);
      }
    }, [searchCol, agGrid]);

    useEffect(() => {
      gridOptions.api?.refreshCells({
        force: true,
      });
    }, [gridOptions]);

    const revertAllChanges = async (): Promise<void> => {
      await agGridService.revertAllChanges(datasetId);
      if (props.reloadGrid) {
        props.reloadGrid();
      }
    };

    React.useImperativeHandle(
      ref,
      (): AgGridChildType => ({
        saveConfigurationMethod: (): void => {
          saveConfiguration();
        },
        refreshMethod: (): void => {
          refresh();
        },
        saveDataMethod: (): void => {
          //nothing
        },
        purgeServerSideCache: (): void => {
          purgeServerSideCache();
        },
        rebuildGrid: (): void => {
          if (props.reloadGrid) {
            props.reloadGrid();
          }
        },
        saveCalculatedCols: (): void => {
          saveCalculatedColumnData();
        },
        revertChanges: (): void => {
          revertAllChanges();
        },
      })
    );

    const saveConfiguration = (): void => {
      const columnsConfig: ColDefDatasetConfig[] = [];
      const agGridColumns: AgGridReactProps | null = agGrid?.current;

      const cols:
        | Column[]
        | undefined = agGridColumns?.columnApi?.getAllGridColumns();

      cols?.forEach((col: Column, index: number) => {
        const colDef: ColDef = col.getUserProvidedColDef();
        const colConfig: ColDefDatasetConfig = {
          columnId: col.getId(),
          columnName: colDef === null ? 'Group' : String(colDef.headerName),
          isFilterAllowed: col.isFilterAllowed(),
          isFilterActive: col.isFilterActive(),
          getSort: col.getSort(),
          width: col.getActualWidth(),
          isRowGroupActive: col.isRowGroupActive(),
          index: index,
          isVisible: col.isVisible(),
          pinned: col.isPinned(),
          filter: agGridColumns?.api?.getFilterInstance(col.getId()).getModel(),
          sortModel: agGridColumns?.api?.getSortModel(),
          groupModel: [],
        };
        columnsConfig.push(colConfig);
      });

      if (columnsConfig.length)
        saveDataSource({
          dataSourceConfig: dataSourceConfig,
          aggridColumnsConfig: columnsConfig,
        });
    };

    const refresh = (): void => {
      const agGridColumns: AgGridReactProps | null = agGrid?.current;
      agGridColumns?.api?.redrawRows();
      agGridColumns?.api?.refreshCells();
    };

    const compareColumnCategory = (
      a: GetDatasetColumnsResponseResultsItem,
      b: GetDatasetColumnsResponseResultsItem
    ): number => {
      if (a.columnCategory < b.columnCategory) {
        return -1;
      }
      if (a.columnCategory > b.columnCategory) {
        return 1;
      }
      return 0;
    };

    //eslint-disable-next-line
    const compareColumnSearchName = (
      a: AutoCompleteRow,
      b: AutoCompleteRow
    ): number => {
      if (a.title.toLowerCase() < b.title.toLowerCase()) {
        return -1;
      }
      if (a.title.toLowerCase() > b.title.toLowerCase()) {
        return 1;
      }
      return 0;
    };

    //eslint-disable-next-line
    const onCellValueChanged = (params: any): void => {
      setEditedColumns((prev) => [
        ...prev,
        {
          customSearchResultId: params?.data?.CustomSearchResultId,
          updatedColumn: params?.colDef?.headerName,
        },
      ]);
    };

    //eslint-disable-next-line
    const getCellClass = (
      updatedColumns: UpdatedColumnType[],
      dataSetColumnItem: GetDatasetColumnsResponseResultsItem,
      //eslint-disable-next-line
      params: any
    ): string => {
      let classList = '';
      if (
        updatedColumns.some(
          (uc) =>
            uc.customSearchResultId === params.data.CustomSearchResultId &&
            uc.updatedColumns.includes(params?.colDef?.headerName || '')
        )
      ) {
        classList = `${classList} cellClass`;
      }
      if (
        editedColumns?.some(
          (ec) =>
            ec.customSearchResultId === params.data.CustomSearchResultId &&
            ec.updatedColumn === params?.colDef?.headerName
        )
      ) {
        classList = `${classList} cellClass`;
      }
      if (
        updatedColumns.some(
          (uc) => uc.customSearchResultId === params.data.CustomSearchResultId
        ) &&
        dataSetColumnItem.isCalculatedColumn
      ) {
        classList = `${classList} cellClassCalculated`;
      }
      return classList;
    };

    useEffect(() => {
      setGridVariableData(props.gridVariableData);
    }, [props.gridVariableData]);

    const getHeaderClass = (columnName: string): string => {
      if (gridVariableData?.length) {
        const variableData = gridVariableData.find(
          (variableData: GenericGridRowData) => variableData.name === columnName
        );
        if (variableData) {
          switch (variableData.type) {
            case 'Dependent':
              return 'Column-Dependent';
            case 'Independent':
              return 'Column-Independent';
            case 'Calculated':
              return 'Column-Calculated';
            default:
              return '';
          }
        }
        return '';
      }
      return '';
    };

    const getHeaderStyle = (isEditable: boolean): string => {
      if (!isEditable) return 'Header-non-editable';
      return '';
    };

    const getPinned = (columnName: string): string => {
      if (
        gridVariableData?.some(
          (variableData: GenericGridRowData) =>
            variableData.name.toLowerCase() === columnName.toLowerCase()
        )
      ) {
        return 'left';
      }
      return '';
    };

    const getCellEditor = (
      dataSetColumnItem: GetDatasetColumnsResponseResultsItem
    ): string => {
      if (
        dataSetColumnItem.hasEditLookupExpression &&
        !dataSetColumnItem.forceEditLookupExpression
      )
        return 'dropdownCellEditor';
      if (
        dataSetColumnItem.hasEditLookupExpression &&
        dataSetColumnItem.forceEditLookupExpression
      )
        return 'dropdownEditCellEditor';
      return 'comboBoxCellEditor';
    };

    const insertDataSetColumnItem = (
      dataSetColumnItem: GetDatasetColumnsResponseResultsItem,
      groupModel?: ColDef[],
      updatedColumns?: UpdatedColumnType[]
    ): ColDef => {
      let columnJson: ColDef = {
        colId: dataSetColumnItem.columnName,
        headerName: dataSetColumnItem.columnName,
        field: dataSetColumnItem.columnName,
        sortable: dataSetColumnItem.isIndexed,
        editable: dataSetColumnItem.isEditable,
        // pivot: true,
        minWidth: 35,
        // width: 35,
        cellClass: (params) => {
          return getCellClass(updatedColumns || [], dataSetColumnItem, params);
        },
        pinned: getPinned(dataSetColumnItem.columnName),
        onCellValueChanged: onCellValueChanged,
        headerComponentParams: {
          template: `<div id=${
            dataSetColumnItem.columnName
          } class="ag-cell-label-container classheader ${getHeaderClass(
            dataSetColumnItem.columnName
          )} ${getHeaderStyle(
            dataSetColumnItem.isEditable
          )}" role="presentation">
            <span ref="eMenu" class="ag-header-icon ag-header-cell-menu-button"></span>
          <div ref="eLabel" class="ag-header-cell-label" role="presentation">
          <span ref="eSortOrder" class="ag-header-icon ag-sort-order" ></span>
          <span ref="eSortAsc" class="ag-header-icon ag-sort-ascending-icon" ></span>
          <span ref="eSortDesc" class="ag-header-icon ag-sort-descending-icon" ></span>
          <span ref="eSortNone" class="ag-header-icon ag-sort-none-icon" ></span>
          <span ref="eText" class="ag-header-cell-text" role="columnheader"></span>
          <span ref="eFilter" class="ag-header-icon ag-filter-icon"></span>
          </div>
          </div>`,
        },
        enableRowGroup: true,
      };
      columnJson.headerClass = (props.priorPostList?.priorList || []).find(
        (x) => x === columnJson.headerName
      )
        ? 'priorvars'
        : (props.priorPostList?.postList || []).find(
            (x) => x === columnJson.headerName
          )
        ? 'postvars'
        : '';

      switch (dataSetColumnItem.columnType) {
        case 'String': {
          columnJson.filter = 'agTextColumnFilter';
          break;
        }
        case 'DateTime': {
          columnJson.filter = 'agNumberColumnFilter';
          columnJson.cellEditor = 'dateCellEditor';
          columnJson.cellRenderer = (data: ValueFormatterParams): string => {
            return moment(data.value).format('YYYY-MM-DD hh:mm A');
          };
          break;
        }
        case 'Double':
        case 'Decimal': {
          columnJson.filter = 'agNumberColumnFilter';
          columnJson.cellEditor = 'numericCellEditor';
          columnJson.cellEditorParams = { allowDecimal: true };
          break;
        }
        case 'Int16': {
          columnJson.filter = 'agNumberColumnFilter';
          columnJson.cellEditor = 'numericCellEditor';
          columnJson.cellEditorParams = { maxValue: 32767, minValue: -32768 };
          break;
        }
        case 'Int32': {
          columnJson.filter = 'agNumberColumnFilter';
          // columnJson.minWidth = 70;
          // columnJson.width = 70;
          columnJson.cellEditor = 'numericCellEditor';
          columnJson.cellEditorParams = {
            maxValue: 2147483647,
            minValue: -2147483647,
          };
          break;
        }
        case 'Int64': {
          columnJson.filter = 'agNumberColumnFilter';
          columnJson.cellEditor = 'numericCellEditor';
          break;
        }
        case 'Boolean': {
          columnJson.cellEditor = 'agSelectCellEditor';
          columnJson.cellEditorParams = { values: [true, false] };
          break;
        }
        case 'Guid': {
          columnJson.cellEditor = 'regularExpressionCellEditor';
          columnJson.cellEditorParams = {
            className: 'guid-editor',
            regularExpression: /(^([0-9A-Fa-f]{8}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{4}[-][0-9A-Fa-f]{12})$)/,
          };
          break;
        }
      }

      const lkptemsList = lookupItemsList[dataSetColumnItem.columnName];

      if (dataSetColumnItem.isEditable && lkptemsList?.length) {
        if (lkptemsList) {
          columnJson.cellEditor = getCellEditor(dataSetColumnItem);
          columnJson.cellEditorParams = {
            values: lkptemsList || [],
          };
          columnJson.cellClass = (_params: unknown): string => {
            if (getCellEditor(dataSetColumnItem) === 'dropdownEditCellEditor')
              return 'Grid';
            return '';
          };
        }
      }

      columnJson = ((key: string): ColDef => {
        switch (key) {
          case 'ErrorMessage':
          case 'IsValid':
          case 'Validated':
          case 'BackendExportState':
          case 'ExportedToBackEndErrorMessage':
            return {
              ...columnJson,
              hide: true,
            };
          case 'Selection':
            return {
              ...columnJson,
              editable: false,
              minWidth: 0,
              width: 30,
              // minWidth: 0,
              // width: 0,
              // cellStyle: (params) => {
              //   return { innerWidth: 25 }
              // },
              lockPosition: true,
              lockPinned: true,
              pinned: 'left',
              cellRenderer: booleanCellRendererSelection,
              headerName: '',
              resizable: true,
            };
          default:
            break;
        }
        return columnJson;
      })(dataSetColumnItem.columnName);

      if (typeof groupModel !== 'undefined')
        groupModel.forEach((groupItem: ColDef, index: number) => {
          if (groupItem.headerName === dataSetColumnItem.columnName) {
            columnJson = {
              ...columnJson,
              rowGroupIndex: index + 1,
              resizable: true,
            };
          }
        });

      const searchOption = {
        title: dataSetColumnItem.columnName,
        originalRow: `${dataSetColumnItem.columnName}`,
      };

      addSearchOption(searchOption);
      return columnJson;
    };

    const getLookupValues = async (): Promise<
      GetDatasetColumnsResponseResultsItem[]
    > => {
      let getDataSetUserState = null;
      try {
        if (props.postProcessId) {
          getDataSetUserState = await agGridService.getDatasetColumns(
            datasetId,
            true,
            parseInt(props.postProcessId),
            true
          );
        } else {
          getDataSetUserState = await agGridService.getDatasetColumns(
            datasetId,
            false,
            0,
            true
          );
        }
      } catch (error) {
        setSnackBar &&
          setSnackBar({
            severity: 'error',
            text: 'Error getting dataset columns, please reload page',
          });
      }
      if (getDataSetUserState) {
        getDataSetUserState.datasetColumns?.forEach(
          async (dataSetColumnItem: GetDatasetColumnsResponseResultsItem) => {
            if (
              dataSetColumnItem.isEditable &&
              dataSetColumnItem.canBeUsedAsLookup
            ) {
              try {
                const getDataSetColumnEditValues = await agGridService.getDataSetColumnEditLookupValues(
                  datasetId,
                  dataSetColumnItem.columnName
                );
                if (getDataSetColumnEditValues) {
                  lookupItemsList[
                    dataSetColumnItem.columnName
                  ] = getDataSetColumnEditValues.results.map((itm) => ({
                    Key: `${itm.Value}`,
                    ...itm,
                  }));
                }
              } catch (error) {
                console.log(error);
              }
            }
          }
        );
        return getDataSetUserState.datasetColumns;
      }
      return [];
    };

    const saveDataSource = async (
      saveConfig: SaveDataSetUserStateParamType
    ): Promise<void> => {
      await agGridService.saveDataSetUserState(datasetId, saveConfig);
    };

    const revertRow = async ({
      CustomSearchResultId,
    }: {
      CustomSearchResultId: number;
    }): Promise<ReturnFromRevert | null> => {
      const r = await agGridService.revertRows(datasetId, [
        CustomSearchResultId,
      ]);
      if (r?.results.length) {
        if (props.setEnabledRevert) {
          props.setEnabledRevert();
          setUpdateRowCounter((prev) => prev - 1);
        }
      }

      if (!r || !r.results || r.results.length <= 0) return null;

      return r;
    };

    //eslint-disable-next-line
    const saveDataRows = async (data: IdValue): Promise<IdValue> => {
      const editable: IdValue = Object.keys(data)
        .map((key) => ({
          key,
          cd: columnDefs.find((cd) => cd.field === key),
        }))
        .filter((value) => !value.cd)
        .map((value) => value.key)
        .reduce((accumulator: IdValue, key): {} => {
          accumulator[key] = data[key];
          return { ...accumulator };
        }, {});

      editable['CustomSearchResultId'] = data['CustomSearchResultId'];
      try {
        const s = await agGridService.saveUpdateDatasetData(datasetId, [
          editable,
        ]);
        if (s.length) {
          if (props.setEnabledRevert) {
            props.setEnabledRevert();
            setUpdateRowCounter((prev) => prev + 1);
          }
        }
        return s[0];
      } catch (error) {
        console.log(error);
        throw error;
      }
    };

    const dataSource = (
      dataSoureParams: GetDataUserStateResponseResultsItem[] | null | JSON,
      datasetColumns: GetDatasetColumnsResponseResultsItem[]
    ): IServerSideDatasource => {
      return {
        getRows: async (params: IServerSideGetRowsParams): Promise<void> => {
          const dataSourceParamsJson =
            dataSoureParams === null ||
            typeof dataSoureParams === 'undefined' ||
            JSON.stringify(dataSoureParams) === '{}'
              ? undefined
              : JSON.parse(JSON.stringify(dataSoureParams));

          const isLoaded =
            typeof dataSourceParamsJson !== 'undefined' &&
            dataSourceParamsJson.dataSourceConfig !== null
              ? true
              : false;
          const request =
            isLoaded && isLoadedQty === 0
              ? dataSourceParamsJson.dataSourceConfig
              : params.request;

          //If the dataset status is "ExecutingPostProcess", usePostProcess should be false
          const usePostProcess =
            datasetStatusCode === 'ExecutingPostProcess' ? false : true;
          let getDataset: GetDataSetDataResponseResults | null = null;
          try {
            getDataset = await agGridService.getDataSetData(
              datasetId,
              request,
              usePostProcess,
              props.postProcessId
            );
          } catch (error) {
            setSnackBar &&
              setSnackBar({
                severity: 'error',
                text: 'Error getting dataset data, please reload page',
              });
          }

          if (getDataset?.updatedColumns?.length) {
            if (props.setEnabledRevert) {
              props.setEnabledRevert();
              setUpdateRowCounter(getDataset?.totalUpdatedRows || 0);
            }
          }
          let dataSourceColumnsConfig = [];
          if (getDataset) {
            const hasStatus: boolean = (getDataset.totalUpdatedRows || 0) > 0;
            const hasExported: boolean =
              (getDataset.totalExportedRows || 0) > 0;
            getTotalRecords(getDataset.totalRows);
            // FIRST RUN
            if (isLoadedQty === 0) {
              setColumnDefs((columnDefs) => [
                ...columnDefs,
                {
                  headerName: '',
                  colId: 'ID',
                  editable: false,
                  lockPosition: true,
                  valueGetter: 'node.rowIndex+1',
                  cellClass: 'locked-col',
                  minWidth: 0,
                  width: 30,
                  // width: 35,
                  suppressNavigable: true,
                  lockPinned: true,
                  suppressMovable: true,
                  pinned: 'left',
                  // rowDrag: true,
                  // enableRowGroup: true,
                },
                {
                  headerName: 'RowNum',
                  field: 'RowNum',
                  editable: false,
                  filter: 'agNumberColumnFilter',
                  minWidth: 0,
                  // width: 150,
                  width: 35,
                  hide: true,
                  // enableRowGroup: true,
                  lockPosition: true,
                  lockPinned: true,
                  suppressMovable: true,
                  pinned: true,
                },
                {
                  headerName: '',
                  valueGetter: (v): string =>
                    v.node?.data?.Validated + ' ' + v.node?.data?.IsValid,
                  cellRenderer: statusCellRenderer,
                  editable: false,
                  filter: 'agNumberColumnFilter',
                  minWidth: 0,
                  width: 30,
                  hide: !hasStatus,
                  lockPinned: true,
                  suppressMovable: true,
                  pinned: 'left',
                  colId: 'Status',
                  // enableRowGroup: true,
                },
                {
                  headerName: 'Committed',
                  valueGetter: (v): string => v.node?.data?.BackendExportState,
                  cellRenderer: exportCellRenderer,
                  editable: false,
                  hide: !hasExported,
                  lockPinned: true,
                  suppressMovable: true,
                  pinned: 'left',
                  colId: 'Export',
                  width: 85,
                  // enableRowGroup: true,
                  minWidth: 0,
                  // width: 0,
                  // minWidth: 0,
                },
                {
                  headerName: '',
                  valueGetter: (v): string => v.node?.data?.Validated,
                  cellRenderer: revertRenderer,
                  editable: false,
                  hide: !hasStatus,
                  lockPinned: true,
                  suppressMovable: true,
                  pinned: 'left',
                  colId: 'Revert',
                  minWidth: 0,
                  width: 30,
                },
              ]);

              if (typeof dataSourceParamsJson !== 'undefined') {
                const column = dataSourceParamsJson?.aggridColumnsConfig?.find(
                  (x: GetDataUserStateResponseResultsItem) =>
                    x.columnId === 'ag-Grid-AutoColumn'
                );

                if (column) {
                  const columnAdd: ColDef = {
                    headerName: column.columnName,
                    field: column.column,
                    sortable: false,
                    editable: false,
                    // minWidth: 150,
                    // width: 150,
                    // enableRowGroup: true,
                    resizable: true,
                  };
                  addColumnsDefs(columnAdd);
                  // addAgGridColumnsDefs(columnAdd);
                }
              }

              // let getDatasetColumnsObj = null;

              // Each columns from dataset typing.
              // if (props.postProcessId) {
              //   getDatasetColumnsObj = await agGridService.getDatasetColumns(
              //     datasetId,
              //     true,
              //     parseInt(props.postProcessId),
              //     true
              //   );
              // } else {
              //   getDatasetColumnsObj = await agGridService.getDatasetColumns(
              //     datasetId,
              //     false,
              //     0,
              //     true
              //   );
              // }

              const calculated = datasetColumns?.filter(
                (c: GetDatasetColumnsResponseResultsItem) => {
                  return c.isCalculatedColumn;
                }
              );

              // Calculated cols
              setcalculatedCols(
                calculated as GetDatasetColumnsResponseResultsItem[]
              );

              const categoryList = datasetColumns
                // .sort(compareColumnName)
                .filter(
                  (x: GetDatasetColumnsResponseResultsItem) =>
                    x.columnCategory !== null
                );
              let localColumnDefs: ColDef[] = [];
              if (
                typeof categoryList !== 'undefined' &&
                categoryList.length > 0
              ) {
                const categoryListSort = categoryList.sort(
                  compareColumnCategory
                );
                // ?.sort(compareColumnName);
                const restList = datasetColumns?.filter(
                  (x: GetDatasetColumnsResponseResultsItem) =>
                    x.columnCategory === null
                );
                // ?.sort(compareColumnName);
                let index = 0;

                while (index < categoryListSort.length - 1) {
                  const columnCategory = categoryListSort[index].columnCategory;
                  // const categoryItem = {
                  //   headerName: categoryListSort[index].columnCategory,
                  //   children: [] as ColDef[],
                  // };
                  const categoryChildrenList: ColDef[] = [];
                  let isChildren = false;

                  while (
                    index <= categoryListSort.length - 1 &&
                    columnCategory === categoryListSort[index].columnCategory
                  ) {
                    categoryChildrenList.push(
                      insertDataSetColumnItem(
                        categoryListSort[index],
                        undefined,
                        getDataset?.updatedColumns
                      )
                    );

                    index++;
                    isChildren = true;
                  }

                  // categoryItem.children = categoryChildrenList;
                  categoryChildrenList.forEach((item) => {
                    // addColumnsDefs(item);
                    // addAgGridColumnsDefs(item);
                  });
                  localColumnDefs = [
                    ...localColumnDefs,
                    ...categoryChildrenList,
                  ];
                  // addColumnsDefs(categoryItem);
                  // addAgGridColumnsDefs(categoryItem);

                  if (!isChildren) index++;
                }

                restList?.forEach(
                  (dataSetColumnItem: GetDatasetColumnsResponseResultsItem) => {
                    const columnJson = insertDataSetColumnItem(
                      dataSetColumnItem,
                      undefined,
                      getDataset?.updatedColumns
                    );
                    localColumnDefs.push(columnJson);
                    // addColumnsDefs(columnJson);
                    // addAgGridColumnsDefs(columnJson);
                  }
                );
              } else {
                datasetColumns?.forEach(
                  (dataSetColumnItem: GetDatasetColumnsResponseResultsItem) => {
                    const columnJson = insertDataSetColumnItem(
                      dataSetColumnItem,
                      undefined,
                      getDataset?.updatedColumns
                    );
                    localColumnDefs.push(columnJson);
                    // addColumnsDefs(columnJson);
                    // addAgGridColumnsDefs(columnJson);
                  }
                );
              }
              setColumnDefs((prev) => [...prev, ...localColumnDefs]);
              if (isLoaded) {
                //TODO: Terminar
                let sortModel;
                const dataSource = JSON.parse(dataSourceParamsJson);
                // if (!props.gridVariableData) {
                dataSourceColumnsConfig = dataSource.aggridColumnsConfig || [];
                dataSource.aggridColumnsConfig.forEach(
                  (item: GetDataUserStateResponseResultsItem) => {
                    params.columnApi.setColumnWidth(
                      String(item.columnId),
                      item.width,
                      true
                    );
                    params.columnApi.moveColumn(item.columnId, item.index);
                    params.columnApi.setColumnVisible(
                      item.columnId,
                      item.isVisible
                    );
                    params.columnApi.setColumnPinned(
                      item.columnId,
                      item.pinned
                    );
                    if (item.filter)
                      params.api
                        .getFilterInstance(item.columnId)
                        .setModel(item.filter);
                    sortModel = item.sortModel;
                  }
                );
                params.api.setSortModel(sortModel);
                params.api.onFilterChanged();
                params.api.onSortChanged();
                params.columnApi.moveColumn('Selection', 2);
                params.columnApi.setColumnPinned('Selection', 'left');
                if (props.gridVariableData) {
                  props.gridVariableData.forEach((grid) => {
                    params.columnApi.setColumnPinned(grid.name, 'left');
                    params?.columnApi?.setColumnWidth(grid.name, 100);
                  });
                }
              }
            } else {
              // todo: refactor this, appears several times.
              setTimeout(() => {
                params.columnApi.setColumnVisible('Status', hasStatus);
                params.columnApi.setColumnVisible('Export', hasExported);
                params.columnApi.setColumnVisible(
                  'Revert',
                  hasStatus || hasExported
                );
              }, 0);
            }

            isLoadedQty++;

            const requestedRows = getDataset.results;
            if (!requestedRows) return undefined;
            const currentLastRow = request?.startRow + requestedRows.length;
            const lastRow =
              currentLastRow < request?.endRow ? currentLastRow : null;
            setDataSourceConfig(request);
            params.successCallback(requestedRows, lastRow);
          }
          if (!dataSourceColumnsConfig.length) sizeToFit();
          setColumnVirtualization(false);
        },
      };
    };

    const getTotalRecords = (x: number): void => {
      toogleCountTotalRecords && toogleCountTotalRecords(x);
    };

    // const getTotalSelection = (x: number): void => {
    //   setCountTotalSelection(
    //     (prevCountTotalSelection) => prevCountTotalSelection + x
    //   );
    // };

    const onRowEditingStarted = (): void => {
      setStartedRow(true);
    };

    const saveDataEditedRows = async (
      data: IdValue,
      e: RowEditingStoppedEvent
    ): Promise<IdValue> => {
      const payload = { ...data };
      const columnsEditable = columnDefs.filter((col) => !col.editable);
      columnsEditable.forEach((col) => {
        delete payload[col?.field || ''];
      });
      payload['CustomSearchResultId'] = data['CustomSearchResultId'];
      const editable = [payload];
      try {
        const s = await agGridService.saveUpdateDatasetData(
          datasetId,
          editable
        );
        if (s.length) {
          if (props.setEnabledRevert) {
            props.setEnabledRevert();
            setUpdateRowCounter((prev) => prev + 1);
          }
        }
        if (s[0]) {
          e.node.setData(s[0]);
          setTimeout(() => {
            e.columnApi.setColumnVisible('Status', true);
            e.columnApi.setColumnVisible('Revert', true);
          }, 100);
        }
        return s[0];
      } catch (error) {
        console.log(error);
        throw error;
      }
    };

    const onRowEditingStopped = async (
      e: RowEditingStoppedEvent
    ): Promise<void> => {
      await saveDataEditedRows(e.data, e);
      setStartedRow(false);
    };

    const onGridReady = async (params: GridOptions): Promise<void> => {
      const datasetColumns = await getLookupValues();

      const getDataSetUserStateObj = await agGridService.getDataSetUserState(
        datasetId
      );

      if (getDataSetUserStateObj) {
        params?.api?.setServerSideDatasource(
          dataSource(getDataSetUserStateObj.datasetUserState, datasetColumns)
        );
      }
      setGridOptions(params);
      // setEnableSorting(true);
    };

    const saveCalculatedColumnData = async (): Promise<boolean> => {
      try {
        await agGridService.saveCalculatedColumnsChanges(
          datasetId,
          calculatedColumnData
        );
        setSnackBar &&
          setSnackBar({
            severity: 'success',
            text: 'Your changes have been saved',
          });
        if (props.reloadGrid) {
          props.reloadGrid();
        }

        return true;
      } catch (error) {
        console.info('calculated cols save error', error);
        setSnackBar &&
          setSnackBar({
            severity: 'error',
            text: 'An error has ocurred, please try again later.',
          });
        return false;
      }
    };

    const onSortChanged = (_event: SortChangedEvent): void => {
      if (enableSorting) {
        saveConfiguration();
      } else {
        setEnableSorting(true);
      }
    };

    const onDragStopped = (_event: DragStoppedEvent): void => {
      saveConfiguration();
    };

    const hideDataColumns = (): void => {
      const columns =
        gridOptions?.columnApi
          ?.getAllColumns()
          ?.filter(
            (col: Column) =>
              col.isVisible() &&
              calculatedCols?.some((cal) => cal.columnName !== col.getColId())
          )
          .map((col: Column) => col.getColId()) || [];
      if (shouldHideDataColumns) {
        if (columns) gridOptions?.columnApi?.setColumnsVisible(columns, false);
        return;
      }
      if (columns) gridOptions?.columnApi?.setColumnsVisible(columns, true);
    };

    useEffect(hideDataColumns, [shouldHideDataColumns]);

    const hideVariableColumns = (): void => {
      const columns = calculatedCols?.map((col) => col.columnName);
      if (shouldHideVariablesColumns) {
        if (columns) gridOptions?.columnApi?.setColumnsVisible(columns, false);
        return;
      }
      if (columns) gridOptions?.columnApi?.setColumnsVisible(columns, true);
    };

    useEffect(hideVariableColumns, [shouldHideVariablesColumns]);

    //eslint-disable-next-line
    const getMainMenuItems = (params: any): any[] => {
      const column = gridOptions?.columnDefs?.find(
        //eslint-disable-next-line
        (cl: any) =>
          cl?.field === params.column.getId() ||
          //eslint-disable-next-line
          cl?.children?.some((c: any) => c.colId === params.column.getId())
      );
      if (column) {
        const athleteMenuItems = params.defaultItems.slice(0);
        athleteMenuItems.push({
          name: 'Hide Column',
          action: () => hideColumnMenu(params.column.getId()),
        });
        return athleteMenuItems;
      }
      return params.defaultItems;
    };

    const hideColumnMenu = (colId: string): void => {
      gridOptions?.columnApi?.setColumnVisible(colId, false);
      sethideColumns((prev) => [...prev, colId]);
    };

    useEffect(() => {
      if (selectAllRows) selectAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectAllRows]);

    useEffect(() => {
      if (unselectAllRows) unselectAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [unselectAllRows]);

    const selectAll = async (): Promise<void> => {
      const ids: IdValue[] = [];
      gridOptions.api?.forEachNode((node) => {
        node.setDataValue('Selection', true);
        // node.setSelected(true);
        ids.push({
          Selection: true,
          CustomSearchResultId: node.data['CustomSearchResultId'],
        });
      });
      const count = ids.length;
      for (let index = 0; index < count; index += 250) {
        await updateDataRows(ids.slice(index, index + 250));
      }
    };

    const unselectAll = async (): Promise<void> => {
      const ids: IdValue[] = [];
      gridOptions.api?.forEachNode((node) => {
        node.setDataValue('Selection', false);
        // node.setSelected(false);
        ids.push({
          Selection: false,
          CustomSearchResultId: node.data['CustomSearchResultId'],
        });
      });

      const count = ids.length;
      for (let index = 0; index < count; index += 250) {
        await updateDataRows(ids.slice(index, index + 250));
      }
    };

    const onSave = async ({ name, comments }: FormValue): Promise<void> => {
      const selectedResult = await duplicateDataset();
      const filteredResult = await duplicateFilteredDataset();
      const datasetId =
        selectedResult?.datasetId || filteredResult?.datasetId || null;
      if (!datasetId) return;
      await renameDataset(datasetId, {
        newName: name || '',
        newComments: comments || '',
      });
      let useModel = false;
      if (location?.pathname.includes('models')) {
        useModel = true;
      }
      history.push({
        pathname: `${useModel ? `/model` : ''}/duplicate/${
          useModel ? `${id}/` : ''
        }${selectedResult?.datasetId || filteredResult?.datasetId}`,
        state: {
          from: location.pathname,
          jobId: selectedResult?.jobId || filteredResult?.jobId,
        },
      });
    };

    //eslint-disable-next-line
    const onRangeSelectionChanged = async (
      _event: RangeSelectionChangedEvent
    ): Promise<void> => {
      if (gridOptions) {
        const localSelectedRows = handleSelectRowsWithCell(gridOptions);
        if (localSelectedRows.length === 1) {
          RequestQueue.callQueued(
            `CustomSearches/UpdateDatasetData/${datasetId}`,
            localSelectedRows,
            { includeUpdatedRows: true, clientId: 'CS' }
          ).then(() => gridOptions.api?.redrawRows());
        } else {
          setSelectedRows((prev) => [...prev, ...localSelectedRows]);
        }
      }
    };

    const validateCell = (params: ProcessCellForExportParams): boolean => {
      const newValue = params.value;
      const oldValue = params?.node?.data[params.column.getColId()];
      if (
        typeof newValue === 'string' &&
        ['true', 'false'].includes(newValue) &&
        isBoolean(oldValue)
      )
        return true;
      if (
        typeof newValue === 'string' &&
        ['true', 'false'].includes(newValue) &&
        !isBoolean(oldValue)
      )
        return false;
      if (isBoolean(oldValue) && parseInt(newValue)) return false;
      if (!isNaN(Date.parse(newValue)) && !isNaN(Date.parse(oldValue)))
        return true;
      if (
        isNaN(newValue) &&
        isNaN(oldValue) &&
        !Date.parse(newValue) &&
        !Date.parse(oldValue)
      )
        return true;
      if (!isNaN(newValue) && !isNaN(oldValue)) return true;
      setSnackBar &&
        setSnackBar({
          severity: 'warning',
          text:
            'The data type of the copied value is incompatible with the target field',
        });
      return false;
    };

    const processCellFromClipboard = (
      params: ProcessCellForExportParams
    ): string => {
      if (!validateCell(params))
        return params?.node?.data[params.column.getColId()];

      // debounceLoading();
      const value = params.value;
      const rowData = params.node?.data;
      const payload = { ...rowData };
      const columns = params.columnApi?.getAllColumns();
      const columnsEditable = columns?.filter(
        (col: Column) => !col.getColDef().editable
      );
      columnsEditable?.forEach((col) => {
        delete payload[col?.getColDef().field || ''];
      });
      payload[params.column.getColId()] = params.value;
      payload['CustomSearchResultId'] = rowData['CustomSearchResultId'];
      setPastedRows((prev) => [...prev, { ...payload }]);
      const columnsToVisible =
        columns?.filter((col) =>
          ['Revert', 'Status'].includes(col.getColId())
        ) || [];
      params.columnApi?.setColumnsVisible(columnsToVisible, true);
      if (!inProgress) {
        setInProgress(true);
      }
      return value;
    };

    if (loading && props.showSpinner !== false) return <Loading />;

    return (
      <Fragment>
        <Modal open={openModal} onClose={(): void => setOpenModal(false)}>
          <div style={getModalStyle()} className={classes.paper}>
            <Save
              onSave={onSave}
              onClose={(): void => {
                setOpenModal(false);
                if (shouldDuplicateDataset)
                  toggleDuplicateDataset && toggleDuplicateDataset();
                if (shouldDuplicateFilteredDataset)
                  toggleDuplicateFilteredDataset &&
                    toggleDuplicateFilteredDataset();
              }}
              classes={{
                root: `${classes.saveSearch} ${classes.modal}`,
                closeIcon: classes.closeButton,
                title: classes.saveSearchTitle,
              }}
            />
          </div>
        </Modal>
        <div className={clsx('ag-theme-alpine', classes.root)}>
          <div className={classes.infobar}>
            {shouldDisplayVariablesGrid && (
              <VariableGrid
                datasetId={datasetId}
                calculatedCols={
                  calculatedCols as GetDatasetColumnsResponseResultsItem[]
                }
                updateColData={updateCalculatedColData}
                saveColData={saveCalculatedColumnData}
              />
            )}
          </div>

          {isDatasetReady && (
            <div className="MainGrid">
              <BlockUi blocking={inProgress} className="blockui">
                <AgGridReact
                  ref={agGrid}
                  rowHeight={25}
                  headerHeight={25}
                  sideBar={siderbarConfig()}
                  suppressColumnVirtualisation={columnVirtualization}
                  // pivotMode={true}
                  defaultColDef={defaultColDef}
                  columnDefs={columnDefs}
                  rowModelType={rowModelType}
                  rowSelection={rowSelection}
                  onRangeSelectionChanged={onRangeSelectionChanged}
                  // onCellValueChanged={onRowChanged}
                  suppressRowClickSelection={true}
                  processCellFromClipboard={processCellFromClipboard}
                  // rowGroupPanelShow={rowGroupPanelShow}
                  rowMultiSelectWithClick={true}
                  enableRangeSelection={true}
                  groupHideOpenParents={true}
                  gridOptions={gridOptions}
                  onGridReady={onGridReady}
                  animateRows={true}
                  getMainMenuItems={getMainMenuItems}
                  editType="fullRow"
                  onRowEditingStopped={onRowEditingStopped}
                  onRowEditingStarted={onRowEditingStarted}
                  onSortChanged={onSortChanged}
                  onDragStopped={onDragStopped}
                  components={{
                    numericCellEditor: NumericCellEditor,
                    dateCellEditor: DateCellEditor,
                    regularExpressionCellEditor: RegularExpressionCellEditor,
                    comboBoxCellEditor: ComboBoxCellEditor,
                    dropdownCellEditor: DropdownCellEditor,
                  }}
                  frameworkComponents={{
                    dropdownEditCellEditor: DropdownEditCellEditor,
                    statusBarComponent: StatusBarComponent,
                  }}
                  statusBar={{
                    statusPanels: [
                      {
                        statusPanel: 'statusBarComponent',
                      },
                      { statusPanel: 'agFilteredRowCountComponent' },
                      { statusPanel: 'agSelectedRowCountComponent' },
                      { statusPanel: 'agAggregationComponent' },
                    ],
                  }}
                ></AgGridReact>
              </BlockUi>
            </div>
          )}
        </div>
        <CustomPopover
          border
          anchorEl={anchorElement}
          onClose={(): void => {
            setAnchorElement(null);
          }}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        >
          <div
            className="display-message"
            onClick={(): void => setAnchorElement(null)}
          >
            {displayMessage}
          </div>
        </CustomPopover>
      </Fragment>
    );
  }
);

export default AgGrid;
