/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import { makeStyles } from '@material-ui/core';

/**
 * Land
 *
 * @param props - Component props
 * @returns A JSX element
 */

export const useStyles = makeStyles({
  root: {
    padding: 0,
    backgroundColor: 'transparent',
    marginBottom: '15px',
  },
  dropdown: {
    width: '70%',
    marginBottom: '15px',
  },
  button: {
    color: '#FFF',
    position: 'absolute',
    right: '5px',
    border: '1px solid #FFF',
    height: '25px',
    borderRadius: '5px',
  },
  sectionLoader: {
    width: '100%',
    height: '250px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    display: 'inline-block',
    color: 'red',
    marginTop: '5px',
    fontWeight: 500,
  },
  icons: {
    paddingLeft: '0',
    marginBottom: '15px',
  },
  ecuation: {
    fontSize: 16,
    fontWeight: 500,
    marginLeft: -16
  },
});
