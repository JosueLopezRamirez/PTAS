// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import React, { useContext, useEffect } from 'react';
import { AppContext } from 'context/AppContext';
import { Color } from '@material-ui/lab/Alert';

const MessageDisplay = (props: {
  message: string;
  color?: string;
}): JSX.Element => {
  const { setSnackBar } = useContext(AppContext);

  const getColor = (): Color => {
    if(props?.color === 'green') return 'success';
    if(props?.color === 'red') return 'error';
    return 'warning';
  }

  useEffect(() => {
    if (props.message.length && setSnackBar) setSnackBar({
      severity: getColor(),
      text: props.message
    })
    //eslint-disable-next-line
  }, [props.message])

  return (
    <>
    </>
  );
};

export default MessageDisplay;

