// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useState, Fragment, useEffect, useContext } from 'react';

//import { AppContext } from 'context/AppContext';
import {
  IdNameDescription,
  SearchParam,
  SearchResults,
} from 'services/map.typings';
import MessageDisplay from 'components/MessageDisplay';
import SearchReader from './SearchReader';

import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

import { AxiosLoader } from 'services/AxiosLoader';
import { useHistory } from 'react-router-dom';
import Loading from 'components/Loading';
import { makeStyles } from '@material-ui/core';
import CategoryTree from './CategoryTree';
import CustomHeader from 'components/common/CustomHeader';
import {
  CustomPopover,
  IconToolBarItem,
  Save,
  CustomTextField,
  DropdownTreeRow,
  SaveAcceptEvent,
  NewFolderAcceptEvt,
} from '@ptas/react-ui-library';
import { Folder, Folders } from './typings';
import { AppContext } from 'context/AppContext';
import { uniqueId } from 'lodash';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2.125, 4.25, 2.125, 4.25),
    display: 'grid',
    gridTemplateColumns: '20em 1fr',
  },
  title: {
    fontSize: theme.ptas.typography.bodyLarge.fontSize,
    fontFamily: theme.ptas.typography.bodyFontFamily,
    borderBottom: '1px solid silver',
    display: 'block',
    paddingBottom: theme.spacing(1),
  },
  categoryList: {
    position: 'relative',
    paddingTop: 10,
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
}));

interface FoldersToSave {
  folderPath: string;
  userId: string;
}

export const flatFolderList = (
  folders: Folder[],
  flatList: DropdownTreeRow[]
): void => {
  folders.forEach((f) => {
    if (f.children) {
      flatFolderList(f.children, flatList);
    }
    flatList.push({
      id: f.folderId,
      parent: f.parentFolderId,
      title: f.folderName,
      subject: f.folderName,
      folder: true,
    });
  });
};

function NewSearch(): JSX.Element {
  const appContext = useContext(AppContext);
  const classes = useStyles();
  const [
    selectedSearch,
    setSelectedSearch,
  ] = useState<IdNameDescription | null>(null);

  const history = useHistory();

  const [searchParams, setSearchParams] = useState<SearchParam>();
  const [loading, setLoading] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [name, setName] = useState<string>();
  const [folder, setFolder] = useState<string>();
  const [comments, setComments] = useState<string>();
  const [folders, setFolders] = useState<Folders | null>();
  const [foldersData, setFoldersData] = useState<DropdownTreeRow[]>([
    { id: 1, title: 'Test', subject: 'hola', parent: null },
  ]);
  const [isSave, setIsSave] = useState<boolean>(false);
  const [newFolder, setNewFolder] = useState<DropdownTreeRow | null>();
  const [newFolderName, setNewFolderName] = useState<string>();
  const [okAdd, setOkAdd] = useState<boolean>(false);
  const [newFoldersToSave, setNewFoldersToSave] = useState<FoldersToSave[]>([]);
  const context = useContext(AppContext);

  const setSnackMessage = (
    message: string,
    severity: 'success' | 'error' | 'warning' | 'info'
  ): void => {
    context.setSnackBar &&
      context.setSnackBar({ text: message, severity: severity });
  };

  const runSearch = async (): Promise<void> => {
    if (!searchParams) return;
    try {
      saveFolders();
      const loader = new AxiosLoader<SearchResults, SearchParam>();
      setLoading(true);
      const data = await loader.PutInfo(
        `CustomSearches/ExecuteCustomSearch/${selectedSearch?.id || ''}`,
        searchParams,
        {}
      );

      history.push(`/new-search/results/${data?.datasetId}`);
    } catch (e) {
      setSnackMessage(e, 'error');
      console.log({ e, searchParams });
    } finally {
      setLoading(false);
      setIsSave(false);
      context.getDatasetsForUser && context.getDatasetsForUser();
    }
  };

  const saveFolders = async (): Promise<void> => {
    if (!newFoldersToSave) return;
    try {
      const loader = new AxiosLoader<{}, FoldersToSave>();

      for (let index = 0; index < newFoldersToSave.length; index++) {
        await loader.PutInfo(
          `CustomSearches/CreateDatasetFolder/`,
          newFoldersToSave[index],
          {}
        );
      }
    } catch (error) {
      setSnackMessage(error, 'error');
      console.log('Save folder error', error);
    }
  };

  const getFolders = async (): Promise<void> => {
    try {
      const loader = new AxiosLoader<Folders, {}>();
      const data = await loader.GetInfo(
        `CustomSearches/GetDatasetFoldersForUser/${appContext.currentUserId}`,
        {}
      );
      setFolders(data);
    } catch (e) {
      setSnackMessage(e, 'error');
    }
  };

  useEffect(() => {
    const toAdd: DropdownTreeRow[] = [];
    if (!folders) return;
    flatFolderList(folders.folders, toAdd);
    setFoldersData(toAdd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders]);

  const flatFolderList = (
    folders: Folder[],
    flatList: DropdownTreeRow[]
  ): void => {
    folders.forEach((f) => {
      if (f.children) {
        flatFolderList(f.children, flatList);
      }
      if (!f.folderName.trim()) return;
      flatList.push({
        id: f.folderId,
        parent: f.parentFolderId,
        title: f.folderName,
        subject: f.folderName,
        folder: true,
      });
    });
  };

  const [isValid, setIsValid] = useState(true);

  const headerIcons: IconToolBarItem[] = [
    {
      icon: <InsertDriveFileIcon />,
      text: 'Save search',
      onClick: (event): void => {
        setAnchorEl(event.currentTarget);
        getFolders();
      },
      disabled: !searchParams,
    },
    {
      icon: <PlayCircleFilledIcon />,
      text: 'Run search',
      onClick: runSearch,
      disabled: !(searchParams /* && isValid */),
    },
  ];

  const handleSave = (e: SaveAcceptEvent): void => {
    setFolder(e.route);
    setName(e.folderName);
  };

  useEffect(() => {
    if (!name || !folder) return;
    const folderPath = name[0] !== '/' ? `/${folder}` : folder;
    setSearchParams(
      (prev): SearchParam => {
        return {
          parameters: prev ? prev.parameters : [],
          folderPath: folderPath,
          datasetName: name,
          comments: comments ?? '',
        };
      }
    );
    cleanState();
    setIsSave(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, folder]);

  const handleNewFolderSave = (e: NewFolderAcceptEvt): void => {
    setNewFolderName(e.folderName);
    setNewFolder(e.row);
    setNewFoldersToSave((f) => [
      ...f,
      {
        folderPath: e.route ? e.route : '' + newFolderName,
        userId: context.currentUserId as string,
      },
    ]);
    setOkAdd(true);
  };

  useEffect(() => {
    const addNewFolder = (): void => {
      if (!newFolder || !newFolderName) return;
      setFoldersData((f) => [
        ...f,
        {
          id: uniqueId('folder_'),
          parent: newFolder.id,
          subject: newFolder.subject,
          title: newFolderName,
          folder: true,
        },
      ]);
      setNewFolderName('');
      setNewFolder(null);
    };
    if (!okAdd) return;
    addNewFolder();
    setOkAdd(false);
  }, [newFolder, newFolderName, okAdd]);

  useEffect(() => {
    if (!isSave) return;
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isSave]);

  const cleanState = (): void => {
    setAnchorEl(null);
    setName(undefined);
    setFolder(undefined);
    setComments(undefined);
  };

  if (loading) return <Loading />;
  return (
    <Fragment>
      <CustomHeader route={[<span>New Search</span>]} icons={headerIcons} />
      <CustomPopover
        showCloseButton
        border
        anchorEl={anchorEl}
        onClose={(): void => {
          cleanState();
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Save
          isNewSave
          defaultRoute="User/"
          title="Save search"
          buttonText="Save"
          dropdownRows={foldersData}
          newFolderDropdownRows={foldersData}
          okClick={handleSave}
          newFolderOkClick={handleNewFolderSave}
          cancelClick={(): void => {
            cleanState();
          }}
          removeCheckBox
          classes={{
            root: classes.saveSearch,
            closeIcon: classes.closeButton,
            title: classes.saveSearchTitle,
          }}
        >
          <CustomTextField
            multiline
            rows={4}
            label="Comments"
            style={{ width: '100%' }}
            onChange={(t): void => setComments(t.currentTarget.value)}
          />
        </Save>
      </CustomPopover>
      {/* new-search */}
      <div className={classes.root}>
        <div>
          <label className={classes.title}>
            {isValid ? '✔' : '❌'}
            Searches
          </label>
          <div className={classes.categoryList}>
            <CategoryTree
              onSearchSelected={(data): void => {
                setSelectedSearch(data);
                setIsValid(true);
              }}
            />
          </div>
        </div>
        {selectedSearch ? (
          <div>
            <label className={classes.title}>
              {selectedSearch.name}: {selectedSearch.description}
            </label>
            <SearchReader
              onValuesChanged={setSearchParams}
              onValidChanged={setIsValid}
              searchId={selectedSearch.id}
            />
          </div>
        ) : (
            <MessageDisplay color="accent" message="No search selected." />
          )}
      </div>
    </Fragment>
  );
}

export default NewSearch;
