// SearchResults.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment } from 'react';
import ResultsTree from './ResultsTree';

/**
 * SearchResults
 *
 * @param props - Component props
 * @returns A JSX element
 */
function SearchResults(): JSX.Element {

  return (
    <Fragment>
      <ResultsTree />
    </Fragment>
  );
}

export default SearchResults;
