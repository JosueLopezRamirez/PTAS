// CustomHeader.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { withStyles } from '@material-ui/core';
import { PanelHeader } from '@ptas/react-ui-library';

const CustomHeader = withStyles(() => ({
  root: {
    top: 48,
    position: 'sticky',
    zIndex: 3,
  },
  column: {},
  iconToolBarContainer: {},
}))(PanelHeader);

export default CustomHeader;
