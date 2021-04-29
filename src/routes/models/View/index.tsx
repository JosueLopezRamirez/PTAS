// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { Fragment, useContext, useEffect } from 'react';
import Project from './Projects';
import CustomHeader from 'components/common/CustomHeader';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { ProjectContext } from 'context/ProjectsContext';
import { IconToolBarItem } from '@ptas/react-ui-library';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import { AppContext } from 'context/AppContext';
import useSignalR from 'components/common/useSignalR';

/**
 * ViewProject
 *
 * @param props - Component props
 * @returns A JSX element
 */
function ViewProject(): JSX.Element {
  const context = useContext(ProjectContext);
  const { setRouteFrom, jobId } = useContext(AppContext);
  const location = useLocation();
  const history = useHistory();
  const { message } = useSignalR(parseInt(`${jobId}`));

  useEffect(() => {
    if(message?.jobStatus === 'Succeeded'){
      // window.location.reload();
      history.go(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  useEffect(() => {
    setRouteFrom && setRouteFrom(location.pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const icons: IconToolBarItem[] = [
    {
      icon: <SystemUpdateAltIcon />,
      text:
        context.projectType === 'annual update'
          ? 'Apply annual update '
          : 'Apply regression',
      disabled: true,
    }
  ];

  return (
    <Fragment>
      <CustomHeader
        route={[
          <Link to="/models" style={{ color: 'black' }}>
            Models
          </Link>,
          <span>{context.projectName}</span>,
        ]}
        icons={icons}
        detailTop={context.headerDetails?.top}
        detailBottom={context.headerDetails?.bottom}
      />
      <Project />
    </Fragment>
  );
}

export default ViewProject;
