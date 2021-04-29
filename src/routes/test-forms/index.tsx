// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment } from 'react';
const TestForm = (): JSX.Element => {
  return (
    <Fragment>
      {[1, 2, 3, 4, 5].map((i) => (
        <div>{i}</div>
      ))}
    </Fragment>
  );
};

export default TestForm;
