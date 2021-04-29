// useToast.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import { useContext } from 'react';
import { AppContext } from './../../context/AppContext';

type Severity = 'success' | 'error' | 'warning' | 'info';
type ToReturn = (message: string, severity?: Severity) => void;

export default function useToast(): ToReturn {
  const context = useContext(AppContext);

  return (message: string, severity?: Severity): void => {
    context.setSnackBar &&
      context.setSnackBar({ text: message, severity: severity });
  };
}