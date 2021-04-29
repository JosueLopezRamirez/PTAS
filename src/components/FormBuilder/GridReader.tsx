// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useEffect, useState } from 'react';
import {
  Field,
  dataTypes,
  SetField,
  VariableValue,
  FormValues,
} from './FormBuilder';

import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import Delete from '@material-ui/icons/Delete';

import {
  RowValueChangedEvent,
  GridReadyEvent,
  GridApi,
  ColDef,
  SelectionChangedEvent,
} from 'ag-grid-community';
import { CheckValidation } from './shared';
import { CustomIconButton } from '@ptas/react-ui-library';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import '../../assets/form-styles/styles.scss';

const GridReader = (
  field: Field,
  value: dataTypes,
  setField: SetField
): JSX.Element => {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const blank = field?.vars?.reduce(
    (prev, curr) => ({
      ...prev,
      [curr.fieldName]: `${curr.defaultValue || curr.fieldName}`,
    }),
    {}
  ) as VariableValue;

  const values = (value || []) as VariableValue[];

  // useEffect(() => {
  //   return (): void => setBlankRow(blank);
  // }, [value, blank]);

  const fields: ColDef[] =
    field?.vars?.map((t) => ({
      headerName: t.title,
      field: t.fieldName,
      sortable: false,
      filter: false,
      editable: (e: { data: FormValues }): boolean => {
        if (!t.readonly) return true;
        return !t.readonly(e);
      },
      minWidth: t.minWidth,
      // width: 200,
      flex: t.flex || 1,
      autoHeight: !!t.autoHeight,
      resizable: true,
      cellEditorParams: { values: t.values },
      cellEditor: t.values ? 'agSelectCellEditor' : 'agTextCellEditor',
      colSpan: t.colSpan,
    })) || [];

  const columnDefs = [
    {
      headerName: '',
      minWidth: 25,
      maxWidth: 25,
      width: 25,
      resizable: false,
      checkboxSelection: true,
    },
    ...fields,
  ];

  const onRowValueChanged = (r: RowValueChangedEvent): void => {
    if (!r.data) return;
    const result = CheckValidation(field, r.data);
    setErrorMessages(() => {
      return result.passed ? [] : result.messages.filter((msg) => !!msg);
    });
    const newValues = [...values];
    const index = r.node.rowIndex;
    newValues[index] = { ...r.data };
    setField(field.fieldName, newValues);
  };

  const [gridApi, setGridApi] = useState<GridApi | null>(null);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [deleteDisabled, setDeleteDisabled] = useState<boolean>(true);

  const onGridReady = (event: GridReadyEvent): void => {
    setGridApi(event.api);
    // this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
  };

  const addItem = (newItem: VariableValue): void => {
    const nv = [...values, newItem];
    setField(field.fieldName, nv);

    const fieldName = fields[0].field || '';
    const newIndex = nv.length - 1;
    setTimeout(() => {
      try {
        gridApi?.setFocusedCell(newIndex, fieldName);
        gridApi?.startEditingCell({
          rowIndex: newIndex,
          colKey: fieldName,
        });
      } catch (error) {
        console.log(error);
      }
    }, 100);
  };

  const buttons = field.itemTemplates?.map((itm, i) => (
    <CustomIconButton
      text={itm.title}
      key={i}
      icon={<AddCircleOutlineOutlinedIcon />}
      onClick={(): void => {
        const newItem = { ...blank, ...itm.newItem };
        addItem(newItem);
      }}
    />
  ));

  useEffect(() => {
    setDeleteDisabled(selectedRows.length === 0);
  }, [selectedRows]);

  const selectionChanged = (evt: SelectionChangedEvent): void => {
    const selectedNodes: number[] = evt.api
      .getSelectedNodes()
      .map((sn) => sn.rowIndex);
    setSelectedRows(selectedNodes);
  };

  return (
    <div>
      {field.title && <h3>{field.title}</h3>}
      <div className="grid-buttons">
        {buttons || (
          <CustomIconButton
            text="New Item"
            icon={<AddCircleOutlineOutlinedIcon />}
            onClick={(): void => {
              addItem({ ...blank });
            }}
          />
        )}

        <CustomIconButton
          text={`Delete items`}
          icon={<Delete />}
          disabled={deleteDisabled}
          onClick={(): void => {
            const nv = values
              .filter((v, index) => !selectedRows.includes(index))
              .map((itm) => ({ ...itm }));
            setField(field.fieldName, nv);
            // values = [...nv];
            setSelectedRows([]);
          }}
        />
      </div>
      <div
        className="ag-theme-alpine custom-land-grid"
        style={{
          minHeight: '20em',
          height: '20em',
        }}
      >
        <AgGridReact
          onRowValueChanged={onRowValueChanged}
          columnDefs={columnDefs}
          rowData={values}
          editType="fullRow"
          rowSelection="multiple"
          onGridReady={onGridReady}
          onSelectionChanged={selectionChanged}
          suppressRowClickSelection={true}
          // frameworkComponents={frameworkComponents}
          // rowClassRules={{
          //   'is-title': (params): boolean => {
          //     return false;
          //   },
          // }}
          defaultColDef={{
            resizable: true,
            autoHeight: true,
          }}
        ></AgGridReact>
      </div>
      {errorMessages && (
        <div>
          <ul>
            {errorMessages.map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default GridReader;
