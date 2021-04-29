// filename
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from 'react';
import { MenuRoot, MenuRootContent } from '@ptas/react-ui-library';
import LinkMenuItem from '../LinkMenuItem';

const ModelMenu = (): JSX.Element => {
  return (
    <MenuRoot text="Models">
      {({ menuProps, closeMenu }): JSX.Element => (
        <MenuRootContent {...menuProps}>
          <LinkMenuItem
            display="New Model..."
            link="/models/new-model"
            closeMenu={closeMenu}
          />
          <LinkMenuItem display="All models" link="/models" closeMenu={closeMenu} />
        </MenuRootContent>
      )}
    </MenuRoot>
  );
};

export default ModelMenu;
