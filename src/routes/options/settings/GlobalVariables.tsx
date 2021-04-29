// GlobalVariables.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import CustomHeader from 'components/common/CustomHeader';
import { Link } from 'react-router-dom';
import GenericGrid from 'components/GenericGrid/GenericGrid';
import { GridOptions } from 'ag-grid-community';
import SaveIcon from '@material-ui/icons/Save';
import {
  CommonValue,
  GenericGridRowData,
  GlobalVariables as GV,
} from 'services/map.typings';
import { AppContext } from 'context/AppContext';
import {
  getMetadataStoreItem,
  importMetadataStoreItems,
} from 'services/common';
import { useLifecycles, useToggle } from 'react-use';
import useLoaderCursor from 'components/common/useLoaderCursor';
import useToast from 'components/common/useToast';
import { cloneDeep } from 'lodash';
import useDisableVariablesMenu from 'components/common/useDisableVariablesMenu';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2.5),
  },
  treeNogroups: {
    fontWeight: 'normal',
  },
  tableContainer: {
    '& table': {
      '& thead tr th': {
        fontWeight: 'bolder',
        borderBottom: '1px solid #d6d6d6',
      },
    },
  },
  tableRoot: {
    '& tbody tr': {},
    '& tbody tr td': {
      borderBottom: '1px solid #d6d6d6',
      fontSize: '1rem',
    },
  },
  miscContent: {
    position: 'absolute',
    left: '50%',
    fontSize: '1rem',
  },
  link: {
    color: 'black',
  },
}));

/**
 * GlobalVariables
 *
 * @param props - Component props
 * @returns A JSX element
 */
function GlobalVariables(): JSX.Element {
  const classes = useStyles();
  const [numVariabales, setNumVariables] = useState<string>();
  const appContext = useContext(AppContext);

  const [types, setTypes] = useState<string[]>([]);
  const [on, toggle] = useToggle(false); // prevents multiple grid creation calls
  const [isDirty, toggleIsDirty] = useToggle(false);
  const isLoading = useLoaderCursor();
  const toast = useToast();
  const [toSave, setToSave] = useState<GenericGridRowData[]>([]);
  const disableVariables = useDisableVariablesMenu();
  useLifecycles(
    () => disableVariables(true),
    () => disableVariables(true)
  );

  const [gridOptions] = useState<GridOptions>({
    rowData: [],
    editType: 'fullRow',
    stopEditingWhenGridLosesFocus: true,
    suppressCellSelection: true,
    defaultColDef: {
      sortable: true,
      resizable: true,
      suppressSizeToFit: true,
      editable: true,
    },
  });

  useEffect(() => {
    getVariablesType();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!gridOptions.api) return;
    gridOptions.api.showLoadingOverlay();
  }, [gridOptions]);

  const getVariablesType = async (): Promise<void> => {
    try {
      const response = await getMetadataStoreItem('globalVariables', 'type');
      if (!response) return;
      const types = response.metadataStoreItems[0].value as CommonValue;
      setTypes(types.data.map((t) => t.toUpperCase()));
    } catch (error) {
      toast('Getting metadata failed: types', 'error');
    }
  };

  const saveChanges = async (): Promise<void> => {
    try {
      isLoading(true);
      await importMetadataStoreItems({
        metadataStoreItems: [
          {
            version: 1,
            itemName: 'variables',
            storeType: 'globalVariables',
            value: { data: toSave },
          },
        ],
      });
      appContext.globalVariablesMethods?.set(toSave as GV[]);
      toggleIsDirty();
      isLoading(false);
      toast('Changes saved', 'success');
    } catch (error) {
      toast('Failed saving the changes', 'error');
      isLoading(false);
    }
  };

  const headerIcons = [
    {
      icon: <SaveIcon />,
      text: 'Save',
      onClick: saveChanges,
      disabled: !isDirty,
    },
  ];

  const MiscContent = (): JSX.Element => {
    return <div className={classes.miscContent}>{numVariabales}</div>;
  };

  useEffect(() => {
    if (!on) {
      setNumVariables('Loading...');
      return;
    }
    if (!appContext.globalVariables) return;

    const variablesLength = appContext.globalVariables.length;
    const text = variablesLength > 1 ? 'Variables' : 'Variable';
    const finalText =
      variablesLength < 1
        ? `No variables to show`
        : `${variablesLength} ${text}`;
    setNumVariables(finalText);
  }, [appContext.globalVariables, on]);

  useEffect(() => {
    if (
      !appContext.globalVariablesCategories ||
      appContext.globalVariablesCategories.length < 1 ||
      !types ||
      types.length < 1 ||
      !appContext.globalVariables ||
      appContext.globalVariables.length < 1 ||
      on
    )
      return;
    const variablesClone = cloneDeep(appContext.globalVariables);
    gridOptions.api?.applyTransaction({ add: variablesClone });
    gridOptions?.api?.setColumnDefs([
      { field: 'name' },
      { field: 'transformation', suppressSizeToFit: false },
      {
        field: 'category',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: appContext.globalVariablesCategories,
        },
        cellStyle: { 'text-transform': 'uppercase' },
      },
      {
        field: 'type',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: {
          values: types,
        },
        cellStyle: { 'text-transform': 'uppercase' },
      },
      { field: 'note' },
    ]);
    gridOptions.api?.sizeColumnsToFit();
    toggle();
    gridOptions.api?.hideOverlay();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appContext.globalVariablesCategories, types, appContext.globalVariables]);

  return (
    <Fragment>
      <CustomHeader
        route={[
          <Link to="/settings" className={classes.link}>
            Settings
          </Link>,
          <label>Global Variables</label>,
        ]}
        icons={headerIcons}
        detailTop="‎‎ ‎"
        detailBottom=" "
        miscContent={MiscContent()}
      />
      <div className={classes.root}>
        <GenericGrid
          height="70vh"
          gridOptions={gridOptions}
          saveColData={(): boolean => true}
          updateColData={(newData): void => {
            setToSave(newData);
            toggleIsDirty(true);
          }}
          hideTitle
          globalVariablesExportOrder
        />
      </div>
    </Fragment>
  );
}

export default GlobalVariables;
