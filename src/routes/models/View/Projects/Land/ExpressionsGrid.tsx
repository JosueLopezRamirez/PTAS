/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useEffect, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  CellValueChangedEvent,
  ColDef,
  Column,
  ColumnApi,
  GridApi,
  GridOptions,
  RowNode,
  SelectionChangedEvent,
} from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { CustomIconButton } from '@ptas/react-ui-library';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import EditIcon from '@material-ui/icons/Edit';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import { makeStyles } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import BlockUi from 'react-block-ui';

interface GenericGridProps {
  rowData: ExpressionGridData[];
  updateGridData: (data: ExpressionGridData[]) => void;
  title: string;
  blocking?: boolean;
  editing: boolean;
  editOrSave?: () => void;
  cancel?: () => void;
}

const useStyles = makeStyles({
  icons: {
    paddingLeft: '0',
    marginBottom: '15px',
  },
});

export interface ExpressionGridData {
  filter: string;
  expression: string;
  note?: string;
  isNewRow?: boolean;
}

const GrossLandGrid = (props: GenericGridProps): JSX.Element => {
  const classes = useStyles();
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [columnApi, setColumnApi] = useState<ColumnApi | null>();
  const [rowData, setrowData] = useState<ExpressionGridData[]>([]);
  const [rowsToDelete, setRowsToDelete] = useState<string[]>([]);
  const [rowsChange, setrowsChange] = useState<boolean>(false);

  const [columnDef] = useState<ColDef[]>([
    {
      headerName: '',
      colId: 'select',
      minWidth: 25,
      maxWidth: 25,
      width: 25,
      editable: false,
    },
    {
      headerName: 'Filter',
      field: 'filter',
      flex: 4,
      colId: 'filter',
      editable: false,
    },
    {
      headerName: 'Expression',
      field: 'expression',
      flex: 3,
      colId: 'expression',
      editable: false,
    },
    {
      headerName: 'Note',
      field: 'note',
      editable: false,
      flex: 3,
      colId: 'note',
    },
  ]);

  const getCheckboxSelection = (col: Column): ColDef => {
    if (col.getColId() === 'select') {
      return { checkboxSelection: props.editing };
    }
    return {};
  };

  const validateIsEditing = (): void => {
      columnApi?.getAllColumns().forEach((col) => {
        col.setColDef(
          {
            ...col.getColDef(),
            ...getCheckboxSelection(col),
            editable: props.editing,
          },
          null
        );
      });
      gridApi?.redrawRows();
  }

  useEffect(validateIsEditing, [props.editing]);

  const onSelectionChanged = (event: SelectionChangedEvent): void => {
    const selectedNodes = event.api.getSelectedNodes();
    const colNames = selectedNodes.map((n: RowNode) => n.data.filter);
    setRowsToDelete(colNames as string[]);
  };

  useEffect(() => {
    setrowData(props.rowData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.rowData]);

  useEffect(() => {
    if (props.updateGridData && rowsChange) {
      props.updateGridData(rowData);
      setrowsChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData]);

  const onGridReady = (params: GridOptions): void => {
    setGridApi(params.api as GridApi);
    setColumnApi(params.columnApi as ColumnApi);
  };

  const onRowChanged = async (
    _params: CellValueChangedEvent
  ): Promise<void> => {
    const tempRowData: ExpressionGridData[] = [];

    if (gridApi) {
      gridApi.forEachNodeAfterFilterAndSort(({ data }) => {
        tempRowData.push({
          expression: data.expression,
          filter: data.filter,
          note: data.note || '',
        });
      });
    }
    setrowsChange(true);
    setrowData(tempRowData);
  };

  const addItem = (): void => {
    const newIndex = rowData.length;
    const newRow = {
      filter: '',
      expression: '',
      note: '',
      isNewRow: true,
    };
    const nv = [...rowData, { ...newRow }];
    setrowData(nv as ExpressionGridData[]);
    setrowsChange(true);
    setTimeout(() => {
      try {
        gridApi?.setFocusedCell(newIndex, 'expression');
        gridApi?.startEditingCell({
          rowIndex: newIndex,
          colKey: 'filter',
        });
      } catch (error) {
        console.log(error);
      }
    }, 100);
  };

  const deleteRows = (): void => {
    if (!rowsToDelete || rowsToDelete.length === 0) {
      return;
    }

    const tempRowData: ExpressionGridData[] = [];

    if (gridApi) {
      gridApi.forEachNodeAfterFilterAndSort(({ data }) => {
        if (rowsToDelete.indexOf(data.filter) === -1) {
          tempRowData.push({
            expression: data.expression,
            filter: data.filter,
            note: data.note || '',
          });
        }
      });
    }
    setrowsChange(true);
    setrowData(tempRowData);
  };

  const renderButtons = (): JSX.Element => {
    // if (props.blocking) return <></>;
    if (!props.editing)
      return (
        <CustomIconButton
          text="Edit"
          icon={<EditIcon />}
          onClick={props.editOrSave}
          style={{ marginLeft: 20 }}
        />
      );
    if (props.editing)
      return (
        <Fragment>
          <CustomIconButton
            text="Save"
            icon={<SaveIcon />}
            onClick={props.editOrSave}
            style={{ marginLeft: 20 }}
          />
          <CustomIconButton
            text="Cancel"
            icon={<CancelIcon />}
            onClick={props.cancel}
            style={{ marginLeft: 20 }}
          />
        </Fragment>
      );
    return <></>;
  };

  return (
    <Fragment>
      <div className={classes.icons}>
        <CustomIconButton
          text={props.title}
          icon={<AddCircleOutlineOutlinedIcon />}
          onClick={addItem}
          disabled={!props.editing}
        />
        <CustomIconButton
          text="Delete rows"
          icon={<DeleteIcon />}
          onClick={deleteRows}
          style={{ marginLeft: 20 }}
          disabled={
            !rowsToDelete || rowsToDelete.length === 0 || !props.editing
          }
        />
        {renderButtons()}
      </div>
      <BlockUi tag="div" blocking={props.blocking} loader={<></>}>
        <div
          className="ag-theme-alpine custom-land-grid"
          style={{
            height: '320px',
            width: '100%',
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          <AgGridReact
            rowSelection="multiple"
            onGridReady={onGridReady}
            onCellValueChanged={onRowChanged}
            rowData={rowData}
            columnDefs={columnDef}
            onSelectionChanged={onSelectionChanged}
            rowStyle={{ background: 'white' }}
          />
        </div>
      </BlockUi>
    </Fragment>
  );
};

export default GrossLandGrid;
