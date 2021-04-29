// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, {
  useContext,
  useEffect,
  useState,
  Fragment,
  useRef,
} from 'react';
import { AppContext } from 'context/AppContext';
import { Project, UserInfo } from 'services/map.typings';
import { useHistory } from 'react-router-dom';
import { makeStyles, Box } from '@material-ui/core';
import {
  CustomTabs,
  AutoComplete,
  TreeViewRow,
  TreeView,
  OptionsMenu,
  MenuOption,
  getGroups,
  Alert,
} from '@ptas/react-ui-library';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import {
  DataTypeProvider,
  EditingCell,
  Sorting,
} from '@devexpress/dx-react-grid';
import CustomHeader from 'components/common/CustomHeader';
import {
  createNewProjectVersion,
  deleteProjectVersion,
  deleteUserProject,
  getUserProjects,
} from 'services/common';

const useStyles = makeStyles((theme) => ({
  panelHeader: {},
  title: {
    fontSize: '1.375rem',
    fontFamily: theme.ptas.typography.titleFontFamily,
    top: 10,
    left: 20,
  },
  totalLabel: {
    fontSize: theme.ptas.typography.bodySmall.fontSize,
    marginRight: theme.spacing(3),
  },
  customTabsSelected: {
    color: theme.ptas.colors.theme.black,
  },
  table: {
    padding: '1em',
  },
  tabs: {
    display: 'flex',
  },
  autoComplete: {
    marginLeft: 'auto',
  },
  column: {
    width: '100%',
  },
  iconToolBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  tableContainer: {
    '& table': {
      '& thead tr th': {
        backgroundColor: '#7a7a7a',
        color: theme.ptas.colors.theme.white,
        '& div div div span': {
          color: theme.ptas.colors.theme.white,
          '& svg': {
            color: theme.ptas.colors.theme.white + '!important',
          },
        },
      },
    },
  },
  lockComponentIcon: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  nameCell: {
    fontWeight: 'normal',
  },
  groupCell: {
    fontWeight: 'normal',
  },
  rootComponent: {
    position: 'fixed',
  },
}));

interface ProjectTreeModel extends TreeViewRow, Project {
  id: string | number;
  name: string;
  parent: number | string | null;
  areas: string | null;
  byYear: number | null;
}

const AllProjects = (): JSX.Element => {
  const appContext = useContext(AppContext);
  const userId = appContext.currentUserId;
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [rows, setRows] = useState<ProjectTreeModel[]>([]);
  const [initialRows, setInitialRows] = useState<ProjectTreeModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const history = useHistory();
  const classes = useStyles();

  // 0 - Project
  // 1 - Year
  const [switchState, setSwitchState] = useState<number>(0);
  const [expandedGroups, setExpandedGroups] = useState<(string | number)[]>([]);
  const [closePop, setClosePop] = useState<boolean>(false);
  const [usersDetails, setUsersDetails] = useState<UserInfo[]>([]);
  const [cellToEdit, setCellToEdit] = useState<EditingCell[]>([]);
  const [enableEditing, setEnableEditing] = useState<boolean>(false);
  const projectLength = useRef<number>(0);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      await getProjects();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const setMessage = (
    message: string,
    severity?: 'success' | 'info' | 'warning' | 'error'
  ): void =>
    appContext.setSnackBar &&
    appContext.setSnackBar({ text: message, severity: severity });

  const getProjects = async (): Promise<void> => {
    setRows([]);
    if (!userId) return;
    try {
      const data = await getUserProjects(userId);
      if (!data) return;
      setProjects(data.projects);
      setUsersDetails(data.usersDetails);
    } catch (error) {
      appContext.setSnackBar &&
        appContext.setSnackBar({
          text: 'Failed getting user projects',
          severity: 'error',
        });
    }
  };

  useEffect(() => {
    //if (usersDetails.length < 1) return;
    const toAdd: ProjectTreeModel[] = [];
    projects?.forEach((p) =>
      toAdd.push({
        id: p.userProjectId,
        parent: p.rootVersionUserProjectId as number,
        areas: p.versionNumber > 1 ? null : p.selectedAreas.join(', '),
        userProjectId: p.userProjectId,
        versionNumber: p.versionNumber,
        name: p.versionNumber > 1 ? '' : p.projectName,
        projectName: p.projectName,
        comments: p.comments,
        isLocked: p.isLocked,
        assessmentYear: p.versionNumber > 1 ? null : p.assessmentYear,
        byYear: p.assessmentYear,
        assessmentDateFrom: p.assessmentDateFrom,
        assessmentDateTo: p.assessmentDateTo,
        selectedAreas: p.selectedAreas,
        rootVersionUserProjectId: p.rootVersionUserProjectId,
        userId: p.userId,
        projectType: p.versionNumber > 1 ? null : p.projectType,
        customSearchDefinitionId: p.customSearchDefinitionId,
        createdBy: p.createdBy,
        lastModifiedBy:
          usersDetails.find((u) => u.id === p.lastModifiedBy)?.fullName ??
          "John Doe",
        createdTimestamp: p.createdTimestamp,
        lastModifiedTimestamp: p.lastModifiedTimestamp,
        projectDatasets: p.projectDatasets,
        linkTo: `/models/view/${p.userProjectId}`,
      })
    );
    setRows(toAdd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, usersDetails, switchState]);

  useEffect(() => {
    projectLength.current = rows.length;
    if (!rows || rows.length < 1) return;
    setIsLoading(false);
  }, [rows]);

  useEffect(() => {
    if (switchState === 0) {
      setRows(
        rows.map((r) => {
          return {
            ...r,
            name: r.versionNumber > 1 ? '' : r.projectName,
            parent: r.rootVersionUserProjectId as number,
            areas: r.versionNumber > 1 ? null : r.selectedAreas.join(', '),
            projectType: r.versionNumber > 1 ? null : r.projectType,
            assessmentYear: r.versionNumber > 1 ? null : r.assessmentYear,
          };
        })
      );
      return;
    }

    setRows(
      rows.map((r) => {
        return {
          ...r,
          name: r.projectName + ` v${r.versionNumber}`,
          parent: null,
          projectType: r.projectType,
          assessmentYear: r.byYear,
          areas:
            r.selectedAreas.length > 1
              ? 'Areas ' + r.selectedAreas.join(', ')
              : 'Area ' + r.selectedAreas,
        };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchState]);
  //
  useEffect(() => {
    switchState === 0
      ? setExpandedGroups(
          rows.flatMap((r, i) => (r.rootVersionUserProjectId === null ? i : []))
        )
      : setExpandedGroups(getGroups<ProjectTreeModel>(rows, 'byYear'));
  }, [rows, switchState]);

  const handleFiltering = (val: string): void => {
    if (initialRows.length < 1) setInitialRows([...rows]);
    if (!val) setRows(initialRows);
    const filtered = initialRows.filter(
      (r) =>
        r.projectName.toLowerCase().includes(val.toLowerCase()) ||
        r.comments.toLowerCase().includes(val.toLowerCase())
    );
    setRows(filtered);
  };

  const miscContent = (): JSX.Element => {
    return (
      <Fragment>
        <Box style={{ display: 'flex', marginLeft: 'auto' }}>
          <label className={classes.totalLabel}>
            {projectLength.current} projects
          </label>
          <Box className={classes.tabs}>
            <label style={{ marginRight: 8 }}>View by:</label>
            <CustomTabs
              items={['Project', 'Year']}
              defaultSelection={switchState}
              onSelected={(e): void => {
                setSwitchState(e);
              }}
              classes={{ selectedItem: classes.customTabsSelected }}
              switchVariant
            />
          </Box>
        </Box>
        <Box></Box>
        <Box className={classes.autoComplete}>
          <AutoComplete
            data={[]}
            label={'Name or comment'}
            onTextFieldValueChange={handleFiltering}
            AutocompleteProps={{ clearOnBlur: false }}
          />
        </Box>
      </Fragment>
    );
  };

  const columns = [
    { name: 'name', title: 'Name' },
    { name: 'menu', title: '...' },
    { name: 'comments', title: 'Comment' },
    { name: 'assessmentYear', title: 'Year' },
    { name: 'areas', title: 'Area(s)' },
    { name: 'versionNumber', title: 'Version' },
    { name: 'projectType', title: 'Type' },
    { name: 'lastModifiedBy', title: 'Last modified by' },
  ];

  const DeleteAlert = (row: ProjectTreeModel): JSX.Element => (
    <Alert
      okButtonText="Delete this model"
      contentText={
        row.versionNumber > 1
          ? `Delete will permanently erase ${row.projectName} version ${row.versionNumber}.`
          : `Delete will permanently erase ${row.projectName}.`
      }
      okButtonClick={(): Promise<void> => deleteProject(row)}
    />
  );

  const deleteProject = async (row: ProjectTreeModel): Promise<void> => {
    if (row.versionNumber > 1) {
      try {
        setRows(rows.filter((r) => r.userProjectId !== row.userProjectId));
        await deleteProjectVersion(row.userProjectId);
        setClosePop(!closePop);
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            text: 'Deleting project version failed',
            severity: 'error',
          });
        setRows((r) => [...r, row]);
      }
    } else {
      try {
        setRows(rows.filter((r) => r.userProjectId !== row.userProjectId));
        await deleteUserProject(row.userProjectId);
        setClosePop(!closePop);
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            text: 'Deleting project failed',
            severity: 'error',
          });
        setRows((r) => [...r, row]);
      }
    }
  };

  const handleMenuOptionClick = (
    action: MenuOption,
    row: ProjectTreeModel | undefined
  ): void => {
    if (!row) return;
    switch (action.id) {
      case 'open':
        history.push(`/models/view/${row?.userProjectId}`);
        break;
      case 'createVersion':
        createVersion(row.userProjectId);
        break;
      case 'rename': {
        const rowIndex = rows.findIndex((r) => r.id === row.id);
        setEnableEditing(true);
        setRows(
          rows.map((r, i) => (i === rowIndex ? { ...r, isEditable: true } : r))
        );
        setCellToEdit([{ rowId: rowIndex, columnName: 'name' }]);
        break;
      }
    }
  };

  const createVersion = async (projectId: React.ReactText): Promise<void> => {
    try {
      setMessage('Creating new project version...', 'info');
      await createNewProjectVersion(projectId);
      await getProjects();
    } catch (error) {
      setMessage('Creating new project version failed', 'error');
    }
  };

  const columnWidths = [
    { columnName: 'name', width: 300 },
    { columnName: 'menu', width: 40 },
    { columnName: 'versionNumber', width: 80 },
    { columnName: 'comments', width: 200 },
    { columnName: 'assessmentYear', width: 100 },
    { columnName: 'areas', width: 100 },
    { columnName: 'projectType', width: 200 },
    { columnName: 'lastModifiedBy', width: 300 },
  ];

  const lockedComponent = (
    props: DataTypeProvider.ValueFormatterProps
  ): JSX.Element => {
    return (
      <span>
        {props.row.isLocked && (
          <LockIcon classes={{ root: classes.lockComponentIcon }} />
        )}
        {props.row.isLocked === false && (
          <LockOpenIcon classes={{ root: classes.lockComponentIcon }} />
        )}
      </span>
    );
  };

  const commentComponent = (
    props: DataTypeProvider.ValueFormatterProps
  ): JSX.Element => {
    return (
      <span
        style={{
          fontWeight:
            switchState === 0
              ? props.row.versionNumber > 1
                ? 'normal'
                : 'bold'
              : 'normal',
          textDecoration:
            switchState === 0
              ? props.row.versionNumber > 1
                ? ''
                : 'underline'
              : '',
        }}
      >
        {props.value}
      </span>
    );
  };

  const dataTypeProviders = [
    <DataTypeProvider
      key="isLocked"
      for={['isLocked']}
      formatterComponent={lockedComponent}
    />,
    <DataTypeProvider
      key="comments"
      for={['comments']}
      formatterComponent={commentComponent}
    />,
  ];

  const sortByColumns: Sorting[] = [
    {
      columnName: switchState === 0 ? 'name' : 'assessmentYear',
      direction: 'asc',
    },
  ];

  const rename = async (
    editedRow: ProjectTreeModel,
    originalRow: ProjectTreeModel
  ): Promise<void> => {
    if (!editedRow || !originalRow) return;
    if (!editedRow.name.trim()) {
      setMessage('Name should not be empty', 'warning');
      setRows(
        rows.map((r) =>
          r.id === editedRow.id ? { ...r, name: originalRow.name } : r
        )
      );
      return;
    }
    console.log('Edited Row', editedRow, 'Original Row', originalRow);
  };

  const onEditingComplete = (
    newRows: ProjectTreeModel[],
    _changed: unknown,
    changedRow: ProjectTreeModel,
    originalRow: ProjectTreeModel
  ): void => {
    if (!changedRow) {
      setEnableEditing(false);
      return;
    }
    setEnableEditing(false);
    if (newRows) setRows(newRows);
    rename(changedRow, originalRow);
  };

  return (
    <Fragment>
      <CustomHeader
        icons={[
          {
            icon: <AddCircleOutlineIcon />,
            text: 'New Model',
            onClick: (): void => history.push('/models/new-model'),
          },
        ]}
        route={[<label>Models</label>]}
        classes={{
          root: classes.panelHeader,
          column: classes.column,
          iconToolBarContainer: classes.iconToolBarContainer,
        }}
        miscContent={miscContent()}
      />
      <TreeView<ProjectTreeModel>
        onEditingComplete={onEditingComplete}
        editingCells={cellToEdit}
        enableEditing={enableEditing}
        enableColumnResize
        resizeDefaultColumnWidths={columnWidths}
        disableGrouping={switchState === 0}
        isLoading={isLoading}
        onNameClick={(row): void => history.push(row.linkTo ?? '')}
        sortBy={sortByColumns}
        dataTypeProviders={dataTypeProviders}
        expandedRowIds={expandedGroups}
        expandedGroups={expandedGroups as string[]}
        virtualTableProps={{ height: 800 }}
        rows={rows}
        columns={columns}
        groupBy={switchState === 0 ? 'name' : ['assessmentYear', 'areas']}
        displayGroupInColumn="name"
        classes={{
          tableContainer: classes.tableContainer,
          nameColumn: classes.nameCell,
          groupCell: classes.groupCell,
          rootComponent: classes.rootComponent,
        }}
        renderMenu={(row): JSX.Element => (
          <OptionsMenu<ProjectTreeModel>
            row={row}
            onItemClick={(action, row): void =>
              handleMenuOptionClick(action, row)
            }
            closeAfterPopover={closePop}
            items={[
              { id: 'open', label: 'Open...' },
              {
                id: 'createVersion',
                label: 'Create version...',
                disabled: row.versionNumber > 1,
              },
              { id: 'clone', label: 'Clone...', disabled: true },
              {
                id: 'rename',
                label: 'Rename...',
                //disabled: row.versionNumber > 1,
                disabled: true,
              },
              {
                id: 'delete',
                label: 'Delete...',
                afterClickContent: DeleteAlert(row),
                isAlert: true,
              },
            ]}
          />
        )}
        virtual
        hideEye
      />
    </Fragment>
  );
};

export default AllProjects;
