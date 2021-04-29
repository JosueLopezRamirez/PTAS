// AppBarContainer.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from 'react';
import { Box } from '@material-ui/core';
import { MainToolbar } from 'components/MainToolbar';
import AppBar from 'components/AppBar';
import AppBarMenu from 'components/AppBarMenu';

/**
 * The container for application bar
 * @beta
 *
 */
const AppBarContainer = (): JSX.Element => {
  return (
    <AppBar>
      <MainToolbar>
        <Box flexGrow={1} style={{display: "flex"}}>
          <AppBarMenu />
        </Box>
      </MainToolbar>
    </AppBar>
  );
};

export default AppBarContainer;
