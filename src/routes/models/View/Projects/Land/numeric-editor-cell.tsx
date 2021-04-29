// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { makeStyles, TextField } from '@material-ui/core';
import React, { forwardRef, useImperativeHandle, useState } from 'react';

const useStyles = makeStyles({
  root: {
    '&::before': {
      borderBottom: 'none',
    },
    '&:hover': {
      '&:before': {
        borderBottom: 'none !important',
      },
      '&:after': {
        borderBottom: 'none !important',
      },
    },
    '&::after': {
      borderBottom: 'none',
    },
  },
});

export const NumericCellEditor = forwardRef(
  //eslint-disable-next-line
  (props: any, ref): JSX.Element => {
    const [value, setValue] = useState<number>(props.value);
    const classes = useStyles();
    useImperativeHandle(ref, () => {
      return {
        getValue: (): number => {
          return value;
        },
      };
    });

    return (
      <TextField
        id="filled-number"
        type="number"
        value={value}
        InputLabelProps={{
          hidden: true,
        }}
        InputProps={{
          classes: { underline: classes.root },
        }}
        onChange={(event): void => setValue(parseInt(event.target.value))}
        variant="standard"
      />
    );
  }
);
