// useDisableVariablesMenu.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import { useContext } from 'react';
import { AppContext } from './../../context/AppContext';

type ToReturn = (disable: boolean) => void;

export default function useDisableVariablesMenu(): ToReturn {
  const context = useContext(AppContext);

  return (disable: boolean): void => {
    context.setDisableVariablesMenu && context.setDisableVariablesMenu(disable);
  };
}
