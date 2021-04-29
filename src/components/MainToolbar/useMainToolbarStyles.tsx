// useMainToolbarStyles
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';

const useMainToolbarStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      backgroundColor: "#001433",
      minHeight: 48,
      padding: theme.spacing(0, 3, 0, 3),
    },
  })
);

export default useMainToolbarStyles;
