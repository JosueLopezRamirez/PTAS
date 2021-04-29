// showInfo.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React from 'react';

const ShowInfo = ({ toDisplay }: { toDisplay: {} | null }): JSX.Element =>
  toDisplay ? (
    <pre>
      {JSON.stringify(
        toDisplay,
        (
          key: string,
          value: string | number | null
        ): string | number | undefined => {
          if (value === 0) return 0;
          return value || undefined;
        },
        3
      )}
    </pre>
  ) : (
    <></>
  );
export default ShowInfo;
