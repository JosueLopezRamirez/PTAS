// ProjectDetails.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useContext } from 'react';
import { makeStyles, Box, Divider } from '@material-ui/core';
import { CustomTextField } from '@ptas/react-ui-library';
import { ProjectContext } from 'context/ProjectsContext';


const useStyles = makeStyles((theme) => ({
  root: {padding: theme.spacing(2, 1, 1, 2)},
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 'normal',
    fontFamily: theme.ptas.typography.bodyFontFamily,
  },
  divider: {
      marginBottom: theme.spacing(3),
      marginTop: theme.spacing(1)
  },
  commentsTextField: {
    width: "100%",
  },
  editContent: {
    padding: theme.spacing(2, 2, 6, 2),
  },
}));

/**
 * ProjectDetails
 *
 * @param props - Component props
 * @returns A JSX element
 */
function ProjectDetails(): JSX.Element {
  const classes = useStyles();
  const context = useContext(ProjectContext);

  return (
    <Box className={classes.root}>
      <label className={classes.sectionTitle}>
        {context.projectDetails}
      </label>
      <Divider className={classes.divider} />
      <Box className={classes.editContent}>
        <CustomTextField
          className={classes.commentsTextField}
          autoFocus
          fullWidth
          label="Comments"
          multiline
          rowsMax={4}
          rows={4}
          value={context.comments}
          onChange={(e): void => context.setComments && context.setComments(e.target.value)}
        />
      </Box>
    </Box>
  );
}

export default ProjectDetails;
