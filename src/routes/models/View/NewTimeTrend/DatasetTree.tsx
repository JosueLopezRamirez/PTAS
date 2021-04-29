// DatasetTree.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect, useState } from 'react';
import { TreeView, OptionsMenu } from '@ptas/react-ui-library';
import { DataTypeProvider } from '@devexpress/dx-react-grid';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import { NewTimeTrendContext } from 'context/NewTimeTrendContext';
import { TreeData } from './typings';
import { getDatasetFoldersForUser } from 'services/common';
import { AppContext } from 'context/AppContext';
import { Folder } from 'services/map.typings';
import { useHistory } from 'react-router-dom';

interface Props<T> {
  onRowClick?: (e: T) => void;
  type?: 'sales' | 'population';
}

// const useStyles = makeStyles((theme) => ({
//   lockComponentIcon: {
//     '&:hover': {
//       cursor: 'pointer',
//     },
//   },
// }));

/**
 * DatasetTree
 *
 * @param props - Component props
 * @returns A JSX element
 */
function DatasetTree(props: Props<TreeData>): JSX.Element {
  //const classes = useStyles();
  const context = useContext(NewTimeTrendContext);
  const appContext = useContext(AppContext);
  const [rows, setRows] = useState<TreeData[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<React.ReactText[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const history = useHistory();

  useEffect(() => {
    setUp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context.selectedProjectType]);

  const setUp = async (): Promise<void> => {
    if (
      !appContext.currentUserId ||
      (context.selectedProjectType &&
        !context.selectedProjectType.projectTypeCustomSearchDefinitions)
    ) {
      setIsLoading(false);
      setRows([]);

      return;
    }
    let rowsToAdd: TreeData[] = [];

    if (!context.selectedProjectType) return;
    const definitionId = context.selectedProjectType.projectTypeCustomSearchDefinitions.find(
      (p) => p.datasetRole.toLocaleLowerCase() === props.type
    )?.customSearchDefinitionId;

    try {
      const foldersArray = await getDatasetFoldersForUser(
        appContext.currentUserId
      );
      if (!foldersArray) return;
      flatFolderList(foldersArray?.folders, rowsToAdd);
    } catch (error) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          text: 'Failed getting the datasets for user',
          severity: 'error',
        });
    }

    const userDetails = context.treeDatasets?.usersDetails;
    context.treeDatasets?.datasets.forEach((d) => {
      const row = {
        id: d.datasetId,
        dataSetId: d.datasetId,
        parent: d.parentFolderId,
        name: d.datasetName,
        usingSearch: 'Sales > Sales',
        dataSets: d.totalRows,
        lastModifiedBy:
          userDetails?.find((u) => u.id === d.lastModifiedBy)?.fullName ??
          'John Doe',
        isLocked: d.isLocked,
        folderPath: d.folderPath,
        comments: d.comments,
        isEditable: false,
        folder: false,
        linkTo: `/search/results/${d.datasetId}`,
      };
      if (
        !context.selectedProjectType ||
        d.customSearchDefinitionId === definitionId
      ) {
        rowsToAdd.push(row);
      }
    });

    if (!rowsToAdd.find((r) => r.folder === false)) {
      setRows([]);
      setIsLoading(false);
      return;
    }

    const folders = rowsToAdd.filter((r) => r.folder);
    folders.forEach((f) => {
      const hasChilds = rowsToAdd.find((r) => r.parent === f.id);
      if (!hasChilds) rowsToAdd = rowsToAdd.filter((r) => r.id !== f.id);
    });

    const rowIdsToExpand: number[] = [];

    if (props.type === 'sales' && context.salesTreeSelection) {
      let parentSales = rowsToAdd.find(
        (r) => r.id === context.salesTreeSelection?.id
      )?.parent;
      while (parentSales) {
        // eslint-disable-next-line no-loop-func
        const index = rowsToAdd.findIndex((r) => r.id === parentSales);
        rowIdsToExpand.push(index);
        parentSales = rowsToAdd[index]?.parent;
      }
    } else if (context.populationTreeSelection) {
      let parentPopu = rowsToAdd.find(
        (r) => r.id === context.populationTreeSelection?.id
      )?.parent;
      while (parentPopu) {
        // eslint-disable-next-line no-loop-func
        const index = rowsToAdd.findIndex((r) => r.id === parentPopu);
        rowIdsToExpand.push(index);
        parentPopu = rowsToAdd[index]?.parent;
      }
    }

    setRows(rowsToAdd);
    setExpandedGroups([
      ...rowsToAdd.flatMap((r, i) => (r.parent === null ? i : [])),
      ...rowIdsToExpand,
    ]);
    setIsLoading(false);
  };

  const flatFolderList = (folders: Folder[], flatList: TreeData[]): void => {
    folders.forEach((f) => {
      if (f.children) {
        flatFolderList(f.children, flatList);
      }
      flatList.push({
        id: f.folderId,
        dataSetId: '',
        parent: f.parentFolderId,
        name: f.folderName,
        usingSearch: '',
        dataSets: null,
        folderPath: ``,
        lastModifiedBy: '',
        isLocked: false,
        comments: '',
        isEditable: false,
        folder: true,
      });
    });
  };

  const columns = [
    { name: 'name', title: 'Name' },
    { name: 'menu', title: '...' },
    { name: 'usingSearch', title: 'Using search' },
    { name: 'dataSets', title: 'Dataset' },
    { name: 'charts', title: 'Charts' },
    { name: 'lastModifiedBy', title: 'Last modified by' },
    { name: 'isLocked', title: 'Lock' },
    { name: 'comments', title: 'Comments' },
  ];

  const columnSizes = [
    { columnName: 'name', width: 400 },
    { columnName: 'menu', width: 40 },
    { columnName: 'usingSearch', width: 100 },
    { columnName: 'dataSets', width: 90 },
    { columnName: 'charts', width: 90 },
    { columnName: 'lastModifiedBy', width: 300 },
    { columnName: 'isLocked', width: 40 },
    { columnName: 'comments', width: 500 },
  ];

  //classes={{ root: classes.lockComponentIcon }}
  const lockedComponent = (
    props: DataTypeProvider.ValueFormatterProps
  ): JSX.Element => {
    return (
      <span>
        {props.row.isLocked && <LockIcon />}
        {props.row.isLocked === false && <LockOpenIcon />}
      </span>
    );
  };

  const dataTypeProviders = [
    <DataTypeProvider
      key="isLocked"
      for={['isLocked']}
      formatterComponent={lockedComponent}
    />,
  ];

  return (
    <TreeView<TreeData>
      setSelectedItem={
        props.type === 'sales'
          ? [
              rows.findIndex(
                (r) => r.id === context.salesTreeSelection?.id
              ) as number,
            ]
          : [
              rows.findIndex(
                (r) => r.id === context.populationTreeSelection?.id
              ) as number,
            ]
      }
      disableFolderSelection
      noDataMessage={`No existing ${props.type} datasets`}
      isLoading={isLoading}
      onNameClick={(row): void => history.push(row.linkTo ?? '')}
      enableColumnResize
      resizeDefaultColumnWidths={columnSizes}
      expandedRowIds={expandedGroups}
      disableGrouping
      columns={columns}
      dataTypeProviders={dataTypeProviders}
      rows={rows}
      virtualTableProps={{ height: 200 }}
      displayGroupInColumn="name"
      onSelect={(r): void => {
        if (!r) return;
        props.onRowClick && props.onRowClick(r);
      }}
      renderMenu={(row): JSX.Element =>
        row.parent === null ? (
          <Fragment />
        ) : (
          <OptionsMenu<TreeData>
            row={row}
            onItemClick={(action, row): void => console.log(row)}
            items={[
              { id: 1, label: 'Edit' },
              { id: 2, label: 'Delete', disabled: true },
              { id: 3, label: 'Rename', disabled: true },
            ]}
          ></OptionsMenu>
        )
      }
      hideEye
      virtual
    />
  );
}

export default DatasetTree;
