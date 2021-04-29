// CategoryTree.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect } from 'react';
// import { TreeView } from '@ptas/react-ui-library';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
// import { makeStyles } from '@material-ui/core';
import FolderIcon from '@material-ui/icons/Folder';
import Loading from 'components/Loading';
import { AppContext } from 'context/AppContext';
import { CustomSearchResults, IdNameDescription } from 'services/map.typings';
import { useState } from 'react';
import { AxiosLoader } from 'services/AxiosLoader';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    '& tbody tr': {
      height: 24,
    },
  },
  noInfo: {
    marginLeft: '1rem',
    color: 'gray',
  },
  icon: {
    color: theme.ptas.colors.theme.accentBright,
    fontSize: '16px',
    marginRight: '0.25rem',
  },
  groupCell: {
    fontSize: '1rem',
    fontWeight: 'normal',
    cursor: 'pointer',
    '&:hover': {
      fontWeight: 'bold',
    },
  },
  childCell: {
    marginLeft: '1rem',
    cursor: 'pointer',
    lineHeight: '16px',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
    padding: '0.25em 0',
    '&:hover': {
      fontWeight: 'bold',
    },
  },
  folderIcon: {
    color: theme.ptas.colors.theme.accent,
    marginRight: 4,
    fontSize: 24,
    verticalAlign: 'top',
  },
}));

const SearchList = ({
  items,
  onSearchSelected,
}: {
  items: IdNameDescription[];
  onSearchSelected: (row: IdNameDescription) => void;
}): JSX.Element => {
  const classes = useStyles();

  return items.length === 0 ? (
    <div className={classes.noInfo}>No Searches.</div>
  ) : (
    <div>
      {items.map((itm: IdNameDescription, i) => (
        <div
          key={i}
          onClick={(): void => onSearchSelected(itm)}
          className={classes.childCell}
          title={itm.description}
        >
          <InsertDriveFileIcon className={classes.icon} />
          {itm.name}
        </div>
      ))}
    </div>
  );
};

const CategoryDisplay = ({
  category,
  onSearchSelected,
}: {
  category: IdNameDescription;
  onSearchSelected: (row: IdNameDescription) => void;
}): JSX.Element => {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<IdNameDescription[] | null>(null);

  useEffect(() => {
    const getCustomSearchesByCategory = async (): Promise<void> => {
      const loader = new AxiosLoader<CustomSearchResults, {}>();
      const customSearch = await loader.GetInfo(
        `CustomSearches/GetCustomSearchesByCategory/${category.id}`,
        {}
      );
      setData(customSearch?.customSearches || []);
    };

    if (expanded && !data) {
      getCustomSearchesByCategory();
    }
  }, [category.id, data, expanded]);

  const classes = useStyles();

  return (
    <Fragment>
      <div
        onClick={(): void => setExpanded(!expanded)}
        className={classes.groupCell}
      >
        <FolderIcon className={classes.folderIcon} /> {category.description}
      </div>
      {expanded && (
        <div>
          {!data ? (
            <div>Loading...</div>
          ) : (
            <SearchList onSearchSelected={onSearchSelected} items={data} />
          )}
        </div>
      )}
    </Fragment>
  );
};

function CategoryTree({
  onSearchSelected,
}: {
  onSearchSelected: (row: IdNameDescription) => void;
}): JSX.Element {
  const context = useContext(AppContext);

  // const columns = [
  //   { name: 'parentDescription', title: '' },
  //   { name: 'childDescription', title: '' },
  // ];

  if (!context.customSearchesParams?.customSearchCategories) {
    return <Loading></Loading>;
  }

  return (
    <Fragment>
      {context.customSearchesParams?.customSearchCategories.map((csp, i) => (
        <CategoryDisplay
          onSearchSelected={onSearchSelected}
          category={csp}
          key={i}
        />
      ))}
    </Fragment>

    // <TreeView<CategoryData>
    //   rows={context.data ?? []}
    //   onChange={props.onSearchSelected}
    //   groupFolderIcon={<FolderIcon className={classes.folderIcon} />}
    //   groupRowIndentColumnWidth={60}
    //   columns={columns}
    //   groupBy="parentDescription"
    //   displayGroupInColumn="childDescription"
    //   rowIcon={<InsertDriveFileIcon className={classes.icon} />}
    //   classes={{ root: classes.root, groupCell: classes.groupCell }}
    //   hideHeader
    //   virtual
    //   hideEye
    // />
  );
}

export default CategoryTree;
