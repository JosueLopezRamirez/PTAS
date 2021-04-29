// index.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, {
  Fragment,
  useEffect,
  useState,
  useRef,
  useContext,
} from 'react';
import {
  withStyles,
  WithStyles,
  createStyles,
  Box,
  Theme,
} from '@material-ui/core';
import { Link, useParams } from 'react-router-dom';
import GetAppIcon from '@material-ui/icons/GetApp';
import { AxiosLoader, DownloadFile } from 'services/AxiosLoader';

import { Project, UserDetailsType } from 'services/map.typings';
import ModelDetailsHeader from 'routes/models/ModelDetailsHeader';
import { AppContext } from 'context/AppContext';
import { getUserProject } from 'services/common';
import PDFObject from 'pdfobject';

type Props = WithStyles<typeof useStyles>;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useStyles = (theme: Theme) =>
  createStyles({
    iframe: {
      width: '100%',
      border: 'none',
      overflow: 'hidden',
    },
    body: {
      padding: theme.spacing(8),
      backgroundColor: 'white',
    },
    pdfBody: {
      height: 'calc(100vh - 116px)',
    },
  });

/**
 * Reports
 *
 * @param props - Component props
 * @returns A JSX element
 */
function ReportDisplay(props: Props): JSX.Element {
  const { classes } = props;
  const iframe = useRef<HTMLIFrameElement>(null);

  const {
    id,
    postprocessId,
    fileName,
  }: { id: string; postprocessId: string; fileName: string } = useParams();
  const [report, setReport] = useState<string>();
  const [project, setProject] = useState<Project | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetailsType[]>();
  const appContext = useContext(AppContext);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const response = await getUserProject(id);
        setProject(response?.project ?? null);
        setUserDetails(response?.usersDetails);
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            severity: 'error',
            text: 'Getting user project failed',
          });
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      const loader = new AxiosLoader<string, {}>();
      try {
        const data = await loader.GetInfo(
          `CustomSearches/GetDatasetFile/${postprocessId}/${fileName}`,
          {},
          fileName.includes('.pdf') ? { responseType: 'blob' } : {}
        );
        setReport(data ? data : undefined);
      } catch (error) {
        appContext.setSnackBar &&
          appContext.setSnackBar({
            severity: 'error',
            text: 'Linear regression not found',
          });
      }
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postprocessId, fileName]);

  useEffect(() => {
    if (!report) return;

    if (fileName.includes('.pdf')) {
      const file = new Blob([report], { type: 'application/pdf' });
      const reportObj = URL.createObjectURL(file);
      PDFObject.embed(reportObj, '#pdfBody', {
        pdfOpenParams: { suppressConsole: true },
      });
    } else {
      const summaryHtml = iframe?.current?.contentWindow?.document;
      if (summaryHtml) {
        summaryHtml.open();
        summaryHtml.write(report);
        summaryHtml.close();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report]);

  const icons = [
    {
      icon: <GetAppIcon />,
      text: 'Export',
      onClick: (): void => {
        const fileName = 'linearregression.docx';
        const link = `${process.env.REACT_APP_CUSTOM_SEARCHES_URL}CustomSearches/GetDatasetFile/${postprocessId}/${fileName}`;
        DownloadFile(link, fileName);
      },
      disabled: !report,
    },
  ];

  const resizeIframe = (): void => {
    if (
      iframe &&
      iframe.current &&
      iframe.current.style &&
      iframe.current.contentWindow
    ) {
      iframe.current.style.height =
        iframe.current.contentWindow.document.documentElement.scrollHeight +
        'px';
    }
  };

  const links = useRef<JSX.Element[]>([]);
  useEffect(() => {
    if (appContext.postProcessName) {
      links.current = [
        <Link to={`/models/regression/${id}/${postprocessId}`}>
          {appContext.postProcessName}
        </Link>,
        <span>{fileName}</span>,
      ];
    } else {
      links.current = [<span>{fileName}</span>];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Fragment>
      <ModelDetailsHeader
        userDetails={userDetails}
        modelDetails={project}
        links={links.current}
        icons={fileName.includes('.pdf') ? [] : icons}
        detailsBottom=""
      />
      {fileName.includes('.pdf') ? (
        <Box className={classes.pdfBody} id="pdfBody" />
      ) : (
        <Box className={classes.body}>
          <iframe
            ref={iframe}
            onLoad={resizeIframe}
            src="about:blank"
            title="report"
            className={classes.iframe}
          />
        </Box>
      )}
    </Fragment>
  );
}

export default withStyles(useStyles)(ReportDisplay);
