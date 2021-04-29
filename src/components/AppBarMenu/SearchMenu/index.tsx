//SearchMenu.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useContext } from 'react';
import { MenuRoot, MenuRootContent } from '@ptas/react-ui-library';
import NestedMenuItem from 'material-ui-nested-menu-item';
import { Box, Divider, makeStyles } from '@material-ui/core';
import LinkMenuItem from '../LinkMenuItem';
import { AppContext } from 'context/AppContext';

const useStyles = makeStyles((theme) => ({
  root: {
    fontSize: "0.875rem",
    transition: 'none !important',
    fontFamily: theme.ptas.typography.bodyFontFamily,
    '&:hover': {
      backgroundColor: theme.ptas.colors.theme.grayLight,
    },
  }
}));

const SearchMenu = (): JSX.Element => {
  const context = useContext(AppContext);
  const classes = useStyles();
  return (
    <MenuRoot text="Search">
      {({ menuProps, isMenuRootOpen, closeMenu }): JSX.Element => (
        <MenuRootContent {...menuProps}>
          <LinkMenuItem
            display="New Search..."
            link="/search/new-search"
            closeMenu={closeMenu}
          />
          <LinkMenuItem
            display="All search results"
            link="/search/results"
            closeMenu={closeMenu}
          />
          <Divider />
          <div style={{maxHeight: 300, overflow: "auto"}}>
            {context.treeDatasets?.datasets
              .filter((f) => f.folderPath.substring(1, 5) === 'User')
              .map((d, i) => {
                return (
                  <LinkMenuItem
                    key={i}
                    display={d.datasetName}
                    link={`/search/results/${d.datasetId}`}
                    closeMenu={closeMenu}
                  />
                );
              })}
          </div>
          <NestedMenuItem
            label={
              <Box component="span" width="100%">
                Shared searches
              </Box>
            }
            parentMenuOpen={isMenuRootOpen}
            className={classes.root}
          >
            {context.treeDatasets?.datasets
              .sort((a, b) => a.datasetName.localeCompare(b.datasetName))
              .filter((f) => f.folderPath.substring(1, 7) === 'Shared')
              .map((d, i) => {
                return (
                  <LinkMenuItem
                    key={i}
                    display={d.datasetName}
                    link={`/search/results/${d.datasetId}`}
                    closeMenu={closeMenu}
                  />
                );
              })}
          </NestedMenuItem>
        </MenuRootContent>
      )}
    </MenuRoot>
  );
};

export default SearchMenu;
