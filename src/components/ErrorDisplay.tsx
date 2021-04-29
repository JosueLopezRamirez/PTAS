// ErrorDisplay.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { AppContext } from 'context/AppContext';
import React, { useContext, useEffect } from 'react';
const ErrorDisplay = ({ message }: { message: string }): JSX.Element => {
  const { setSnackBar } = useContext(AppContext);

  const messageChange = (): void => {
    if (message.length)
      setSnackBar?.({
        severity: 'error',
        text: message,
      });
  };

  useEffect(messageChange, [message]);
  return <></>;
};
export default ErrorDisplay;
