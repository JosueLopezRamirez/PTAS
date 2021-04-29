// FILENAME
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import { CSSProperties } from '@material-ui/styles';
import React, { PropsWithChildren, useEffect, useState } from 'react';
import FullscreenExit from '@material-ui/icons/FullscreenExit';
import Fullscreen from '@material-ui/icons/Fullscreen';
import { CustomIconButton } from '@ptas/react-ui-library';

const ZoomContents = (props: PropsWithChildren<object>): JSX.Element => {
  const [isZoomed, setIsZoomed] = useState(false);
  const zoomed = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    width: '100vw',
    height: '100vh',
    zIndex: 10000,
    overflow: 'hide',
    padding: '1em',
    margin: '0',
    backgroundColor: '#eee',
  };
  const notZoomed = {};
  const [style, setStyle] = useState<CSSProperties>(notZoomed);

  const zoomChangd = (): void => {
    setStyle(isZoomed ? zoomed : notZoomed);
  };

  useEffect(zoomChangd, [isZoomed]);
  return (
    <div style={style}>
      <div style={{ borderBottom: '1px solid #eee' }}>
        {!isZoomed && (
          <CustomIconButton
            onClick={(): void => setIsZoomed(true)}
            className="clear-btn"
            icon={<Fullscreen />}
          />
        )}
        {isZoomed && (
          <CustomIconButton
            onClick={(): void => setIsZoomed(false)}
            className="clear-btn"
            icon={<FullscreenExit />}
          />
        )}
      </div>
      {props.children}
    </div>
  );
};

export default ZoomContents;
