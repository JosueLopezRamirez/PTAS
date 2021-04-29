// Settings
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core';
import CustomHeader from 'components/common/CustomHeader';
import { CustomIconButton, TreeView, TreeViewRow } from '@ptas/react-ui-library';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import EditIcon from '@material-ui/icons/Edit';
import { useHistory } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2.5),
  },
  treeNogroups: {
      fontWeight: "normal",
  },
  tableContainer: {
    '& table': {
      '& thead tr th': {
        fontWeight: "bolder",
        borderBottom: "1px solid #d6d6d6",
      },
    },
  },
  tableRoot: {
    "& tbody tr": {
        height: 90
      },
      "& tbody tr td": {
        borderBottom: "1px solid #d6d6d6",
        fontSize: "1rem",
      }
  }
}));

interface SettingsData extends TreeViewRow {
  name: string;
  description: string;
  action: string;
}

/**
 * Settings
 *
 * @param props - Component props
 * @returns A JSX element
 */
function Settings(): JSX.Element {
  const classes = useStyles();
  const history = useHistory();

  const columns = [
    { name: 'name', title: 'Name' },
    { name: 'description', title: 'Description' },
    { name: 'action', title: 'Action' },
  ];

  const columnSizes = [
    { columnName: 'name', width: 400 },
    { columnName: 'description', width: 1000 },
    { columnName: 'action', width: 400 },
  ];

  const tempRows: SettingsData[] = [
    {
      id: 1,
      parent: null,
      name: 'Global variables',
      description:
        'Edit the variables that are used by all the different projects.',
      action: "/settings/global-variables"
    },
  ];

  
  const ActionComponent = (
    props: DataTypeProvider.ValueFormatterProps
  ): JSX.Element => {
    return (
      <CustomIconButton icon={<EditIcon/>} text="Edit variables" onClick={(): void => history.push(props.row.action)}/>
    );
  };

  const dataTypeProviders = [
    <DataTypeProvider
      key="action"
      for={['action']}
      formatterComponent={ActionComponent}
    />,
  ];

  return (
    <Fragment>
      <CustomHeader
        route={[<label>Settings</label>]}
        icons={[]}
        detailBottom={''}
      />
      <div className={classes.root}>
        <TreeView<SettingsData>
          resizeDefaultColumnWidths={columnSizes}
          dataTypeProviders={dataTypeProviders}
          columns={columns}
          rows={tempRows}
          classes={{noGroups: classes.treeNogroups, tableContainer: classes.tableContainer, root: classes.tableRoot}}
          displayGroupInColumn="name"
          disableGrouping
          enableColumnResize
          hideEye
          hideSelectionHighlight
          virtual
        />
      </div>
    </Fragment>
  );
}

export default Settings;
