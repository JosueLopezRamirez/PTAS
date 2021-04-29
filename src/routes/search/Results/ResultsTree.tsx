// ResultsTree.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useContext, useEffect, useState, Fragment } from 'react';
import { makeStyles } from '@material-ui/core';
import {
  TreeView,
  OptionsMenu,
  MenuOption,
  Alert,
  Save,
  DropdownTreeRow,
  SaveAcceptEvent,
  NewFolderAcceptEvt,
} from '@ptas/react-ui-library';
import { DataTypeProvider, EditingCell } from '@devexpress/dx-react-grid';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import { TreeData } from 'routes/models/View/NewTimeTrend/typings';
import { AppContext } from 'context/AppContext';
import { Folder, Folders } from '../NewSearch/typings';
import { useHistory } from 'react-router-dom';
import CustomHeader from 'components/common/CustomHeader';
import AddCircleOutlineOutlinedIcon from '@material-ui/icons/AddCircleOutlineOutlined';
import { uniqueId } from 'lodash';
import {
  assignFolderToDataset,
  createDatasetFolder,
  deleteDataset,
  getDatasetFoldersForUser,
  renameDataset,
  renameFolder,
  setDatasetLockLevel,
} from 'services/common';

const useStyles = makeStyles((theme) => ({
  lockComponentIcon: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  popover: {
    width: 308,
    borderRadius: 9,
    padding: theme.spacing(4),
    backgroundColor: theme.ptas.colors.utility.danger,
  },
  popoverText: {
    color: theme.ptas.colors.theme.white,
  },
  optionMenuContent: {
    padding: 32,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  saveSearch: {
    margin: 0,
    padding: theme.spacing(2, 4, 4, 4),
  },
  closeButton: {
    fontSize: 40,
  },
  saveSearchTitle: {
    fontSize: '1.375rem',
    fontFamily: theme.ptas.typography.bodyFontFamily,
  },
  rootComponent: {
    position: 'fixed',
  },
}));

let foldersData: DropdownTreeRow[] = [];

/**
 * ResultsTree
 *
 * @param _props - Component props
 * @returns A JSX element
 */
function ResultsTree(): JSX.Element {
  const classes = useStyles();
  const context = useContext(AppContext);
  const [rows, setRows] = useState<TreeData[]>([]);
  const [cellToEdit, setCellToEdit] = useState<EditingCell[]>([]);
  const [isNewFolder, setIsNewFolder] = useState<boolean>(false);
  const [enableEditing, setEnableEditing] = useState<boolean>(false);
  const [isRename, setIsRename] = useState<boolean>(false);
  const [folders, setFolders] = useState<Folders | null>();
  const [selectedRow, setSelectedRow] = useState<TreeData>();
  const [expandedGroups, setExpandedGroups] = useState<React.ReactText[]>([]);
  const history = useHistory();

  const [dummyState, setDummyState] = useState<boolean>(false);
  const [highlightedItem, setHighlightedItem] = useState<number[]>([-1]);

  useEffect(() => {
    setIsLoading(true);
    setTreeFolders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setTreeFolders = async (): Promise<void> => {
    if (!context.currentUserId) return;
    try {
      setFolders(await getDatasetFoldersForUser(context.currentUserId));
    } catch (error) {
      context.setSnackBar &&
        context.setSnackBar({
          text: 'Error getting the folders for user',
          severity: 'error',
        });
    }
  };

  useEffect(() => {
    if (!folders) return;
    const datasets = context.treeDatasets?.datasets;
    const userDetails = context.treeDatasets?.usersDetails;
    if (!datasets || datasets.length === 0) return;

    const otherRows: TreeData[] = [];
    const toAdd: DropdownTreeRow[] = [];

    flatFolderList(folders.folders, otherRows, toAdd);

    foldersData = toAdd;
    //setFoldersData(toAdd);
    datasets.forEach((d) => {
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
      otherRows.push(row);
    });
    setRows(otherRows);

    setExpandedGroups(toAdd.flatMap((r, i) => (r.parent === null ? i : [])));
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders, context.treeDatasets]);

  const flatFolderList = (
    folders: Folder[],
    flatList: TreeData[],
    dropdown: DropdownTreeRow[]
  ): void => {
    folders.forEach((f) => {
      if (f.children) {
        flatFolderList(f.children, flatList, dropdown);
      }
      if(!f.folderName.trim()) return;
      flatList.push({
        id: f.folderId,
        dataSetId: '',
        parent: f.parentFolderId,
        name: f.folderName,
        usingSearch: '',
        dataSets: null,
        folderPath: `${getPath(f.parentFolderId)}/${f.folderName}`,
        lastModifiedBy: '',
        isLocked: false,
        comments: '',
        isEditable: false,
        folder: true,
      });
      dropdown.push({
        id: f.folderId,
        parent: f.parentFolderId,
        title: f.folderName,
        subject: f.folderName,
        folder: true,
      });
    });
  };

  const getPath = (parentId: React.ReactText | null): string => {
    if (!parentId || !folders) return '';
    let route = '';
    let parent = folders.folders.find((f) => f.folderId === parentId);
    route += `/${parent?.folderName}`;
    while (parent?.parentFolderId) {
      parent = folders.folders.find((f) => f.folderId === parentId);
      route += `/${parent?.folderName}`;
    }

    return route;
  };

  const addNewFolder = (): void => {
    if (!selectedRow) return;
    if (!selectedRow.folder) return;
    if (rows.length < 1) return;
    const newId = uniqueId('tempId_');
    const newRow: TreeData = {
      id: newId,
      dataSetId: 'deleteMe',
      parent: selectedRow.id,
      name: 'Folder Name',
      usingSearch: '',
      dataSets: 0,
      lastModifiedBy: '',
      isLocked: false,
      folderPath: selectedRow.folderPath,
      comments: '',
      isEditable: true,
      folder: true,
    };
    setEnableEditing(true);
    setIsNewFolder(true);
    setRows((old) => [...old, newRow]);
    setExpandedGroups((e) => [
      ...e,
      rows.findIndex((r) => r.id === selectedRow.id),
    ]);
  };

  useEffect(() => {
    if (isNewFolder) {
      setCellToEdit([
        {
          rowId: rows.findIndex((r) => r.name === 'Folder Name'),
          columnName: 'name',
        },
      ]);
      setIsNewFolder(false);
    }
  }, [rows, isNewFolder]);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && enableEditing) {
        const tempRow = rows.find((r) => r.name === 'Folder Name');
        if (tempRow) {
          setRows(rows.filter((r) => r.id !== tempRow.id));
          setEnableEditing(false);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleEsc);

    return (): void => {
      window.removeEventListener('keydown', handleEsc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableEditing]);

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

  const lockedComponent = (
    props: DataTypeProvider.ValueFormatterProps
  ): JSX.Element => {
    if(props.row.parent === null) return <></>;
    return (
      <span>
        {props.row.isLocked && (
          <i onClick={(): Promise<void> => setLockLevel(props.row)}>
            <LockIcon classes={{ root: classes.lockComponentIcon }} />
          </i>
        )}
        {props.row.isLocked === false && (
          <i onClick={(): Promise<void> => setLockLevel(props.row)}>
            <LockOpenIcon classes={{ root: classes.lockComponentIcon }} />
          </i>
        )}
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

  const editingExtensions = [
    { columnName: 'menu', editingEnabled: false },
    { columnName: 'usingSearch', editingEnabled: false },
    { columnName: 'dataSets', editingEnabled: false },
    { columnName: 'lastModifiedBy', editingEnabled: false },
    { columnName: 'isLocked', editingEnabled: false },
    { columnName: 'folderPath', editingEnabled: false },
    { columnName: 'comments', editingEnabled: false },
  ];

  let dataSetId: string | number | undefined;
  let defaultFolder: string;
  const handleMenuItemClick = (
    action: MenuOption,
    row: TreeData | undefined
  ): void => {
    if (!row) return;
    switch (action.label.toLowerCase()) {
      case 'open':
        history.push(`/search/results/${row.dataSetId}`);
        break;
      case 'rename': {
        const rowIndex = rows.findIndex((r) => r.id === row.id);
        setEnableEditing(true);
        setRows(
          rows.map((r, i) => (i === rowIndex ? { ...r, isEditable: true } : r))
        );
        setCellToEdit([{ rowId: rowIndex, columnName: 'name' }]);
        setIsRename(true);
        break;
      }
      case 'save as':
        dataSetId = row.dataSetId;
        defaultFolder = row.folderPath;
        break;
      case 'lock':
        setLockLevel(row);
        break;
      case 'unlock':
        setLockLevel(row);
        break;
      default:
        break;
    }
  };

  const setLockLevel = async (row: TreeData): Promise<void> => {
    if (!row || !row.dataSetId) return;
    try {
      setRows(
        rows.map((r) =>
          r.dataSetId === row.dataSetId ? { ...r, isLocked: !row.isLocked } : r
        )
      );
      setDatasetLockLevel(row.dataSetId, !row.isLocked);
    } catch (error) {
      context.setSnackBar &&
        context.setSnackBar({
          text: 'Setting lock level failed',
          severity: 'error',
        });
      setRows(
        rows.map((r) =>
          r.dataSetId === row.dataSetId ? { ...r, isLocked: row.isLocked } : r
        )
      );
    }
  };

  const createFolder = async (editedRow: TreeData): Promise<void> => {
    if (isRename) return;
    if (!editedRow.name.trim()) {
      setRows(rows.filter((r) => r.id !== editedRow.id));
      context.setSnackBar &&
        context.setSnackBar({
          text: `Folder name should not be empty`,
          severity: 'warning',
        });
      setSelectedRow(undefined);
      setHighlightedItem([-1]);
      return;
    }

    //check if folder already exists
    const result = rows
      .filter((r) => r.parent === editedRow.parent)
      .find((c) => c.name === editedRow.name);
    if (result) {
      setRows(rows.filter((r) => r.id !== editedRow.id));
      context.setSnackBar &&
        context.setSnackBar({
          text: `Folder ${editedRow.name} already exists`,
          severity: 'warning',
        });
      setSelectedRow(undefined);
      setHighlightedItem([-1]);
      return;
    }

    try {
      await createDatasetFolder({
        folderPath: `${editedRow.folderPath}/${editedRow.name}`,
        userId: context.currentUserId,
      });
    } catch (error) {
      context.setSnackBar &&
        context.setSnackBar({
          text: 'Creating a folder failed',
          severity: 'error',
        });
      setSelectedRow(undefined);
      setRows(rows.filter((r) => r.id !== editedRow.id));
      setHighlightedItem([-1]);
    } finally {
      setTreeFolders();
      context.getDatasetsForUser && context.getDatasetsForUser();
      setSelectedRow(undefined);
      setHighlightedItem([-1]);
    }
  };

  const rename = async (
    row: TreeData,
    originalRow: TreeData
  ): Promise<void> => {
    if (!isRename) return;
    if (!row.name) {
      context.setSnackBar &&
        context.setSnackBar({
          text: 'Name should not be empty',
          severity: 'warning',
        });
      setRows(
        rows.map((r) =>
          r.id === row.id ? { ...r, name: originalRow.name } : r
        )
      );
      return;
    }

    try {
      if (row.folder) {
        await renameFolder({
          folderPath: row.folderPath,
          newName: row.name,
        });
      } else {
        if (!row.dataSetId) throw new Error('Selected row dataset id is empty');
        await renameDataset(row.dataSetId, {
          newName: row.name,
          newComments: originalRow.comments,
        });
      }
    } catch (error) {
      context.setSnackBar &&
        context.setSnackBar({ text: 'Renaming failed', severity: 'error' });
      setRows(
        rows.map((r) =>
          r.id === row.id ? { ...r, name: originalRow.name } : r
        )
      );
    } finally {
      setIsRename(false);
      context.getDatasetsForUser && context.getDatasetsForUser();
      if (row.folderPath) setTreeFolders();
    }
  };

  const deleteTheDataset = async (row: TreeData): Promise<void> => {
    if (!row || !row.dataSetId) return;
    try {
      setRows(rows.filter((r) => r.dataSetId !== row.dataSetId));
      await deleteDataset(row.dataSetId);
    } catch (error) {
      context.setSnackBar &&
        context.setSnackBar({ text: 'Deleting failed', severity: 'error' });
      setRows((r) => [...r, row]);
    } finally {
      context.getDatasetsForUser && context.getDatasetsForUser();
    }
  };

  const handleSave = async (e: SaveAcceptEvent): Promise<void> => {
    if (!e.folderName || !e.route || !dataSetId) return;
    setDummyState(!dummyState);
    try {
      if (defaultFolder !== e.route) {
        const parent = rows.find((r) => r.folderPath + '/' === e.route);
        setRows(
          rows.map((r) =>
            r.dataSetId === dataSetId
              ? {
                  ...r,
                  name: e.folderName as string,
                  comments: e.comments as string,
                  parent: parent?.id ?? null,
                }
              : r
          )
        );
        await assignFolderToDataset(e.route, dataSetId as string);
        await renameDataset(dataSetId as string, {
          newName: e.folderName,
          newComments: e.comments ?? '',
        });
      } else {
        setRows(
          rows.map((r) =>
            r.dataSetId === dataSetId
              ? {
                  ...r,
                  name: e.folderName as string,
                  comments: e.comments as string,
                }
              : r
          )
        );
        await renameDataset(dataSetId as string, {
          newName: e.folderName,
          newComments: e.comments ?? '',
        });
      }
    } catch (error) {
      context.setSnackBar &&
        context.setSnackBar({
          text: 'Error saving changes',
          severity: 'error',
        });
    } finally {
      context.getDatasetsForUser && (await context.getDatasetsForUser());
    }
  };

  const handleNewFolderSave = async (e: NewFolderAcceptEvt): Promise<void> => {
    if (!e.route || !e.folderName) return;
    try {
      foldersData.push({
        id: uniqueId('tempId_'),
        parent: e.row?.id ?? null,
        title: e.folderName ?? '',
        subject: '',
        folder: true,
      });
      await createDatasetFolder({
        folderPath: e.route + e.folderName,
        userId: context.currentUserId as string,
      });
    } catch (error) {
      context.setSnackBar &&
        context.setSnackBar({
          text: 'Error creating new folder',
          severity: 'error',
        });
      foldersData.pop();
    }
  };

  interface SavePopoverProps {
    defaultComments: string | undefined;
    defaultName: string | undefined;
    defaultRoute: string | undefined;
  }

  const SaveContent = (saveProps: SavePopoverProps): JSX.Element => {
    return (
      <Save
        title="Save search"
        buttonText="Save"
        dropdownRows={foldersData}
        newFolderDropdownRows={foldersData}
        okClick={handleSave}
        newFolderOkClick={handleNewFolderSave}
        removeCheckBox
        classes={{
          root: classes.saveSearch,
          closeIcon: classes.closeButton,
          title: classes.saveSearchTitle,
        }}
        defaultName={saveProps.defaultName}
        defaultRoute={saveProps.defaultRoute}
        defaultComments={saveProps.defaultComments}
        cancelClick={(): void => console.log('')}
        showComments
      />
    );
  };

  const headerIcons = [
    {
      icon: <AddCircleOutlineOutlinedIcon />,
      text: 'New Folder',
      onClick: addNewFolder,
      disabled: !selectedRow?.folder,
    },
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

  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <Fragment>
      <CustomHeader
        route={[<label>My search results</label>]}
        icons={headerIcons}
      />
      <TreeView<TreeData>
        isLoading={isLoading}
        onNameClick={(row): void => history.push(row.linkTo ?? '')}
        setSelectedItem={highlightedItem}
        enableColumnResize
        resizeDefaultColumnWidths={columnSizes}
        enableEditing={enableEditing}
        onEditingComplete={(rows, _changed, changedRow, originalRow): void => {
          if (!changedRow) {
            setEnableEditing(false);
            return;
          }
          setEnableEditing(false);
          if (rows) setRows(rows);
          rename(changedRow, originalRow);
          createFolder(changedRow);
        }}
        editingCells={cellToEdit}
        columns={columns}
        expandedRowIds={expandedGroups}
        dataTypeProviders={dataTypeProviders}
        editingColumnExtensions={editingExtensions}
        rows={rows}
        virtualTableProps={{ height: 800 }}
        displayGroupInColumn="name"
        onSelect={(r): void => setSelectedRow(r)}
        classes={{
          rootComponent: classes.rootComponent,
        }}
        renderMenu={(row): JSX.Element =>
          row.parent === null ? (
            <Fragment />
          ) : (
            <OptionsMenu<TreeData>
              row={row}
              onItemClick={handleMenuItemClick}
              items={[
                { id: 0, label: 'Open', disabled: row.folder },
                {
                  id: 1,
                  label: 'Save as',
                  afterClickContent: SaveContent({
                    defaultComments: row.comments,
                    defaultName: row.name,
                    defaultRoute: row.folderPath,
                  }),
                  disabled: row.folder,
                },
                { id: 2, label: 'Rename' },
                {
                  id: 4,
                  label: row.isLocked ? 'Unlock' : 'Lock',
                  disabled: row.folder,
                },
                {
                  id: 5,
                  label: 'Delete',
                  afterClickContent: (
                    <Alert
                      classes={{
                        root: classes.popover,
                        text: classes.popoverText,
                      }}
                      okButtonText="Delete this dataset"
                      contentText={`Delete will permanently erase ${row.name}.`}
                      okButtonClick={(): Promise<void> => deleteTheDataset(row)}
                    />
                  ),
                  isAlert: true,
                  disabled: row.folder,
                },
              ]}
            />
          )
        }
        disableGrouping
        hideEye
        virtual
      />
    </Fragment>
  );
}

export default ResultsTree;
