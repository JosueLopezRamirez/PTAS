// useShowMapsMenu.ts
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

type ToReturn = (show: boolean) => void;

export default function useShowMapsMenu(): ToReturn {
  const context = useContext(AppContext);

  return (show: boolean): void => {
    context.setShowMapMenu && context.setShowMapMenu(show);
  };
}
