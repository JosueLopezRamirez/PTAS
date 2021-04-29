// MainToolbar.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { PropsWithChildren } from "react";
import Toolbar from "@material-ui/core/Toolbar";
import useMainToolbarStyles from "./useMainToolbarStyles";

function MainToolbar(props: PropsWithChildren<{}>): JSX.Element {
  const classes = useMainToolbarStyles();
  return <Toolbar className={classes.root}>{props.children}</Toolbar>;
}

export default MainToolbar;
