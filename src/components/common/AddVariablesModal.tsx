// AddVariablesModal.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useContext } from 'react';
import { ModalGrid } from '@ptas/react-ui-library';
import { makeStyles } from '@material-ui/core';
import { GridOptions } from 'ag-grid-community';
import { AppContext } from 'context/AppContext';
import { GlobalVariables } from 'services/map.typings';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  search: {
    width: '23%',
    marginBottom: 16,
  },
}));

/**
 * AddVariablesModal
 *
 * @param props - Component props
 * @returns A JSX element
 */
function AddVariablesModal(props: Props): JSX.Element {
  const classes = useStyles();
  const context = useContext(AppContext);

  const gridOptions: GridOptions = {
    defaultColDef: {
      sortable: true,
      resizable: true,
      suppressSizeToFit: true,
    },
    columnDefs: [
      { field: 'select', checkboxSelection: true },
      { field: 'name' },
      { field: 'transformation', suppressSizeToFit: false },
      { field: 'category' },
      { field: 'note' },
    ],
  };

  const onAddVariables = (selectedRows: unknown[]): void => {
    context.setGlobalVariablesToAdd &&
      context.setGlobalVariablesToAdd(selectedRows as GlobalVariables[]);
    props.onClose();
  };

  return (
    <ModalGrid
      rows={context.globalVariables ?? []}
      buttonText="Add variables"
      isOpen={props.isOpen}
      onClose={props.onClose}
      onButtonClick={onAddVariables}
      TextFieldProps={{
        placeholder: 'Filter by name, transformation, category or note',
        className: classes.search,
      }}
      gridOptions={gridOptions}
    />
  );
}

export default AddVariablesModal;
