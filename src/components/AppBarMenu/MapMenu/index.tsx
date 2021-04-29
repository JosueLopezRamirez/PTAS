// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useContext } from 'react';
import { MenuRoot, MenuRootContent } from '@ptas/react-ui-library';
import LinkMenuItem from '../LinkMenuItem';
import { AppContext } from 'context/AppContext';

const MapMenu = (): JSX.Element => {
  const context = useContext(AppContext);

  return (
    <MenuRoot text="Map">
      {({ menuProps, closeMenu }): JSX.Element => (
        <MenuRootContent {...menuProps}>
          <LinkMenuItem
            display="Show map"
            link=""
            closeMenu={closeMenu}
            redirect={process.env.REACT_APP_MAP_URL}
          />
          <LinkMenuItem
            display="Show all rows"
            link=""
            closeMenu={closeMenu}
            redirect={process.env.REACT_APP_MAP_URL + "?datasetId=" + (context.currentDatasetId ?? "")}
          />
          <LinkMenuItem
            display="Show only selected rows"
            link=""
            closeMenu={closeMenu}
            redirect={process.env.REACT_APP_MAP_URL + "?datasetId=" + (context.currentDatasetId ?? "") + "&filter=selected"}
          />
          <LinkMenuItem
            display="Show only non-selected rows"
            link=""
            closeMenu={closeMenu}
            redirect={process.env.REACT_APP_MAP_URL + "?datasetId=" + (context.currentDatasetId ?? "") + "&filter=notSelected"}
          />
        </MenuRootContent>
      )}
    </MenuRoot>
  );
};

export default MapMenu;
