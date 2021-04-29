// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import {
  GetDatasetColumnsResponseResultsItem,
  CalculatedColExpression,
  SaveCalculatedColumnType,
  ExcelSheetJson,
} from 'services/map.typings';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import {
  CellValueChangedEvent,
  GridApi,
  GridOptions,
  RowNode,
  SelectionChangedEvent,
} from 'ag-grid-community';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { CustomIconButton } from '@ptas/react-ui-library';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteIcon from '@material-ui/icons/Delete';
import GetApp from '@material-ui/icons/GetApp';
import useJsonTools from 'components/common/useJsonTools';
import { LinearProgress } from '@material-ui/core';
import useDisableVariablesMenu from 'components/common/useDisableVariablesMenu';
import { useLifecycles } from 'react-use';
import { AppContext } from 'context/AppContext';

interface VariableGridProps {
  calculatedCols: GetDatasetColumnsResponseResultsItem[];
  datasetId: string;
  saveColData: () => Promise<boolean>;
  updateColData: (newData: SaveCalculatedColumnType[]) => void;
}

interface VariableGridRowData {
  name: string;
  transformation?: string;
  category?: string;
  note?: string;
  isNewRow?: boolean;
}

const VariableGrid = (props: VariableGridProps): JSX.Element => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const [rowData, setRowData] = useState<VariableGridRowData[]>([]);
  const [rowsToDelete, setRowsToDelete] = useState<string[]>([]);

  const [blankRow] = useState<VariableGridRowData | undefined>({
    name: 'defaultNewVariable',
    isNewRow: true,
  });

  const { getExcelFromJson, isLoading } = useJsonTools();
  const disableVariables = useDisableVariablesMenu();

  useLifecycles(() => disableVariables(false), () => disableVariables(true));
  const context = useContext(AppContext);

  //add variables selected from modals
  useEffect(() => {
    const variables = context.globalVariablesToAdd;
    if(!variables || variables.length < 1 || !gridApi) return;

    setRowData(data => [...data, ...variables]);
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.globalVariablesToAdd]);

  useEffect(() => {
    if (rowData) {
      const columnData: SaveCalculatedColumnType[] = rowData.map(
        (r: VariableGridRowData) => {
          return {
            columnName: r.name,
            script: r.transformation || '',
          };
        }
      );

      props.updateColData(columnData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowData]);

  useEffect((): void => {
    const newRowData = props.calculatedCols?.map(
      (col: GetDatasetColumnsResponseResultsItem) => {
        const expressions: CalculatedColExpression[] = col.expressions as CalculatedColExpression[];

        if (expressions[0]) {
          return {
            name: col.columnName,
            transformation: expressions[0].script || '',
            category: expressions[0].expressionType || '',
            notes: expressions[0].note || '',
          };
        }

        return {
          name: col.columnName,
          transformation: '',
          category: '',
          notes: '',
        };
      }
    );

    setRowData(newRowData as VariableGridRowData[]);
  }, [props.calculatedCols]);

  const onGridReady = (params: GridOptions): void => {
    setGridApi(params.api as GridApi);
  };

  const addItem = (): void => {
    const newIndex = rowData.length;
    const nv = [...rowData, blankRow];

    setRowData(nv as VariableGridRowData[]);
    setTimeout(() => {
      try {
        gridApi?.setFocusedCell(newIndex, 'name');
        gridApi?.startEditingCell({
          rowIndex: newIndex,
          colKey: 'name',
        });
      } catch (error) {
        console.log(error);
      }
    }, 100);
  };

  const onRowChanged = async (
    _params: CellValueChangedEvent
  ): Promise<void> => {
    const tempRowData: VariableGridRowData[] = [];

    if (gridApi) {
      gridApi.forEachNodeAfterFilterAndSort(({ data }) => {
        tempRowData.push({
          name: data.name,
          transformation: data.transformation,
          category: data.category || '',
          note: data.note || '',
        });
      });
    }

    setRowData(tempRowData);
  };

  const onSelectionChanged = (event: SelectionChangedEvent): void => {
    const selectedNodes = event.api.getSelectedNodes();
    const colNames = selectedNodes.map((n: RowNode) => n.data.name);
    setRowsToDelete(colNames as string[]);
  };

  const deleteRows = (): void => {
    if (!rowsToDelete || rowsToDelete.length === 0) {
      return;
    }

    const tempRowData: VariableGridRowData[] = [];

    if (gridApi) {
      gridApi.forEachNodeAfterFilterAndSort(({ data }) => {
        if (rowsToDelete.indexOf(data.name) === -1) {
          tempRowData.push({
            name: data.name,
            transformation: data.transformation,
            category: data.category || '',
            note: data.note || '',
          });
        }
      });
    }

    setRowData(tempRowData);
  };

  const saveGridChanges = async (): Promise<void> => {
    await props.saveColData();
  };

  const toExcel = async (): Promise<void> => {
    const columns: string[] = ['Name', 'Transformation', 'Category', 'Note'];

    const rows = rowData.map((data) => {
      return [
        data.name,
        data.transformation ?? '',
        data.category ?? '',
        data.note ?? '',
      ];
    });

    const toSend: ExcelSheetJson = {
      Sheet1: {
        headers: columns,
        rows: rows,
      },
    };

    await getExcelFromJson(toSend, 'variables.xlsx');
  };

  return (
    <Fragment>
      {isLoading && <LinearProgress />}
      <div className="grid-buttons">
        <CustomIconButton
          text="New Item"
          icon={<AddCircleOutlineOutlinedIcon />}
          onClick={addItem}
        />
        <CustomIconButton
          text="Delete rows"
          icon={<DeleteIcon />}
          onClick={deleteRows}
          style={{ marginLeft: 20 }}
          disabled={!rowsToDelete || rowsToDelete.length === 0}
        />
        <CustomIconButton
          text="Update rows"
          icon={<VisibilityIcon />}
          onClick={saveGridChanges}
          style={{ marginLeft: 20 }}
        />
        <CustomIconButton
          text="Export"
          icon={<GetApp />}
          onClick={(): void => {
            toExcel();
          }}
          style={{ marginLeft: 20 }}
          disabled={!rowData || rowData.length < 1}
        />
      </div>
      <div
        className="ag-theme-alpine MainGrid"
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
          onSelectionChanged={onSelectionChanged}
          rowData={rowData}
          rowHeight={25}
          headerHeight={25}
        >
          <AgGridColumn
            width={25}
            checkboxSelection
          ></AgGridColumn>
          <AgGridColumn editable field="name"></AgGridColumn>
          <AgGridColumn flex={1} editable field="transformation"></AgGridColumn>
          <AgGridColumn editable field="category"></AgGridColumn>
          <AgGridColumn editable field="note"></AgGridColumn>
        </AgGridReact>
      </div>
    </Fragment>
  );
};

export default VariableGrid;
