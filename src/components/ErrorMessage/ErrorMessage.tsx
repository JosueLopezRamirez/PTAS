/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from 'react';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  errorMessage: {
    display: 'inline-block',
    color: 'red',
    marginTop: '5px',
    fontWeight: 500,
  },
  wrapper : {
    display: 'flex',
    flexDirection: 'column'
  }
});

export interface ValidationErrorType {
  executeStatement: string;
  success: boolean;
  validatedExpression: string;
  validatedExpressionRole: string;
  validatedExpressionType: string;
  validatedIndex: number;
  validationError: string;
  validationErrorDetails: string;
}

export interface ImportErrorMessageType {
  message: string;
  reason?: ValidationErrorType[];
}

interface ErrorMessageProps {
  message: ImportErrorMessageType | undefined;
}

export default function ErrorMessage(props: ErrorMessageProps): JSX.Element {
  const classes = useStyles();

  if (!props.message) return <></>;

  return (
    <div className={classes.wrapper}>
      <span className={classes.errorMessage}>{props.message.message}</span>
      {props.message?.reason?.map((val) => (
        <span className={classes.errorMessage}>
          {val?.validationError}: {val?.validationErrorDetails}
        </span>
      ))}
    </div>
  );
}
