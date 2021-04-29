// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { PropsWithChildren } from "react";
import { AppBar as MUIAppBar, useTheme } from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      /**
       * An absolute minHeight in order to position the content
       */
      minHeight: "48px",
      background: "none",
    },
  })
);

/**
 *
 * Material app bar with some customization
 *
 * @param props -Component props
 * @returns -Material AppBar component
 */
const _AppBar = (props: PropsWithChildren<object>): JSX.Element => {
  const theme = useTheme();
  const classes = useStyles(theme);
  return (
    <MUIAppBar
      position="fixed"
      classes={{
        root: classes.root,
      }}
      elevation={0}
    >
      {props.children}
    </MUIAppBar>
  );
};

export default _AppBar;
