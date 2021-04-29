// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, {
  memo,
  PropsWithChildren,
  useEffect,
  Fragment,
  useState,
} from 'react';
import { createStyles, Theme, WithStyles, withStyles } from '@material-ui/core';
import { SnackBar } from 'components/common/index';

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const styles = (theme: Theme) => {
  return createStyles({
    root: {
      position: 'relative',
      /**
       * The same pixels as app bar height
       */
      top: '48px',
      /**
       * Actually header min height is 88px
       */
      height: 'calc(100% - 104px)',
      //overflow: 'hidden',
    },
  });
};

/**
 * Wrapper props
 */

type Props = WithStyles<typeof styles>;

const ContentWrapper = (props: PropsWithChildren<Props>): JSX.Element => {
  const [openSnack, setOpenSnack] = useState(false);
  const [snackText, setSnackText] = useState('');

  useEffect(() => {
    if (openSnack === false) {
      setSnackText('');
    }
  }, [openSnack]);

  return (
    <Fragment>
      <div className={props.classes.root}>{props.children}</div>
      <SnackBar
        message={snackText}
        open={openSnack}
        onClose={(): void => setOpenSnack(false)}
      />
    </Fragment>
  );
};

export default memo(withStyles(styles)(ContentWrapper));
