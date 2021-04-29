// CamelToSpace.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from 'react';

const restLcase = (s: string): string => s.slice(1).toLowerCase();

const firstUcase = (s: string): string => s.substring(0, 1).toUpperCase();

const jsUcfirst = (s: string): string => `${firstUcase(s)}${restLcase(s)}`;

export const ToCamel = (src: string): string =>
  jsUcfirst(
    src
      .replace(/([A-Z]+)/g, ' $1')
      .replace(/([A-Z][a-z])/g, ' $1')
      .trim()
      .replace('  ', ' ')
  );

const CamelToSpace = ({ display }: { display: string }): JSX.Element => (
  <span>{ToCamel(display)}</span>
);
export default CamelToSpace;
