import { GridOptions } from 'ag-grid-community';
// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { ValueFormatterParams } from "ag-grid-community";
import { IdValue } from "services/map.typings";

const getSelectValue = (
  index: number,
  rowIndex: number,
  endRow: number,
  value: boolean
): boolean => {
  if (index === 0) return value;
  // if (rowIndex === endRow) return value;
  // if (index > 0 && index < endRow) return !value;
  return !value;
};

export const handleSelectRowsWithCheckbox = (params: ValueFormatterParams): IdValue[] => {
  const sel = !params.value;
  const rangeSelection = params.api?.getCellRanges();
  const localSelectedRows: IdValue[] = [];
  rangeSelection?.forEach(async (range) => {
    const [startRow, endRow] = [range?.startRow?.rowIndex || 0, range?.endRow?.rowIndex || 0].sort((a: number, b: number): number => {
      if (a > b) return 1;
      if (b > a) return -1;
      return 0;
    });

    if (startRow === endRow) {
      const data = {
        Selection: sel,
        CustomSearchResultId: params.data['CustomSearchResultId'],
      };
      localSelectedRows.push(data);
      return localSelectedRows;
    }
    let index = 0;
    const column = range.columns.find(col => col.getColId() === "Selection");
    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
      //eslint-disable-next-line
      if (!column) return;
      const rowModel = params.api?.getModel();
      const rowNode = rowModel?.getRow(rowIndex);
      if (rowNode) {
        const value = params.api?.getValue(column, rowNode);
        const id = rowNode.data.CustomSearchResultId;
        const data = {
          Selection: getSelectValue(index, rowIndex, endRow, value),
          CustomSearchResultId: id,
        };
        rowNode.data.Selection = data.Selection;
        localSelectedRows.push(data);
        index++;
      }
    }
  });
  return localSelectedRows;
}

export const handleSelectRowsWithCell = (gridOptions: GridOptions): IdValue[] => {
  const rangeSelection = gridOptions.api?.getCellRanges();
  const localSelectedRows: IdValue[] = [];
  
  rangeSelection?.forEach(async (range) => {
    const column = range.columns.find(col => col.getColId() === "Selection");
    if (!column) return;
    const [startRow, endRow] = [range?.startRow?.rowIndex || 0, range?.endRow?.rowIndex || 0].sort((a: number, b: number): number => {
      if (a > b) return 1;
      if (b > a) return -1;
      return 0;
    });

    if (startRow === endRow) {
      const rowModel = gridOptions.api?.getModel();
      const rowNode = rowModel?.getRow(startRow);
      if (rowNode) {
        const value = rowNode.data.Selection;
        const id = rowNode.data.CustomSearchResultId;
        const data = {
          Selection: !value,
          CustomSearchResultId: id,
        };
        rowNode.data.Selection = data.Selection;
        localSelectedRows.push(data);
      }
    } else {
      let index = 0;
      for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
        const rowModel = gridOptions.api?.getModel();
        const rowNode = rowModel?.getRow(rowIndex);
        if (rowNode) {
          const value = rowNode.data.Selection;
          const id = rowNode.data.CustomSearchResultId;
          const data = {
            Selection: getSelectValue(index, rowIndex, endRow, value),
            CustomSearchResultId: id,
          };
          rowNode.data.Selection = data.Selection;
          localSelectedRows.push(data);
          index++;
        }
      }
    }
  });
  return localSelectedRows;
}