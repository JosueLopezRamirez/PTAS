// CustomSection.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { PropsWithChildren, useEffect, useState } from 'react';
import { makeStyles, Box } from '@material-ui/core';
import {
  SectionContainer,
  IconToolBar,
  MenuOption,
  IconToolBarItem,
  CustomIconButton,
} from '@ptas/react-ui-library';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { ChartCard as Card } from '@ptas/react-ui-library';
import { CSSProperties } from '@material-ui/core/styles/withStyles';
import LockIcon from '@material-ui/icons/Lock';
import LockOpenIcon from '@material-ui/icons/LockOpen';


interface Props {
  title?: string;
  lastSyncDetails?: SyncDetails;
  iconText?: string;
  iconOnClick?: () => void;
  cards?: Card[];
  noIcons?: boolean;
  containerStyles?: CSSProperties;
  extraIcons?: IconToolBarItem[];
  showLock?: boolean;
  disableIcon?: boolean;
  lockOnClick?: () => void;
}

export interface SyncDetails {
  lastSyncOn: string;
  lastSyncBy: string;
}

export interface Card {
  id?: React.ReactText;
  title: string;
  author: string;
  date: string;
  onClick: () => void;
  onMenuOptionClick: (option: MenuOption) => void;
  menuItems: MenuOption[];
  image?: string;
  error?: string;
  showLock?: boolean;
  isLocked?: boolean;
  onLockClick?: (isLocked: boolean) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {},
  iconToolBar: {
    marginBottom: theme.spacing(4),
  },
  sectionContainer: {
    paddingBottom: theme.spacing(4),
  },
  container: {
    paddingLeft: theme.spacing(2),
    display: 'flex',
    flexWrap: 'wrap',
  },
  card: {
    minHeight: 261.5,
    height: "auto",
    marginRight: theme.spacing(4),
    marginBottom: theme.spacing(4),
    '&:last-child': {
      marginRight: 0,
    },
  },
  lockIcon: {
    color: theme.ptas.colors.theme.white,
  },
  title: {
    marginLeft: theme.spacing(1),
  },
  cardFooter: {
    height: "unset",
  }
}));

/**
 * CustomSection
 *
 * @param props - Component props
 * @returns A JSX element
 */
function CustomSection(props: PropsWithChildren<Props>): JSX.Element {
  const classes = useStyles();
  const { lastSyncDetails } = props;
  const [icons, setIcons] = useState<IconToolBarItem[]>([
    {
      icon: <AddCircleOutlineIcon />,
      text: props.iconText,
      onClick: props.iconOnClick,
      disabled: props.disableIcon,
    },
  ]);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    if (!props.extraIcons) return;
    const toAdd: IconToolBarItem[] = [];
    props.extraIcons.forEach((i) => toAdd.push(i));
    setIcons((i) => [...i, ...toAdd]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (props.disableIcon === undefined) return;
    setIcons([{
      icon: <AddCircleOutlineIcon />,
      text: props.iconText,
      onClick: props.iconOnClick,
      disabled: props.disableIcon,
    }]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.disableIcon]);


  const lockIcon = (
    <CustomIconButton
      icon={
        isLocked ? (
          <LockIcon className={classes.lockIcon} />
        ) : (
          <LockOpenIcon className={classes.lockIcon} />
        )
      }
      onClick={(): void => {
        setIsLocked(!isLocked);
        props.lockOnClick && props.lockOnClick();
      }}
    />
  );

  return (
    <SectionContainer
      title={props.title}
      details={
        lastSyncDetails
          ? `Last updated by ${lastSyncDetails?.lastSyncBy} on ${lastSyncDetails?.lastSyncOn}`
          : ''
      }
      classes={{
        root: classes.sectionContainer,
        title: props.showLock ? classes.title : '',
      }}
      icon={props.showLock ? lockIcon : <></>}
    >
      {!props.noIcons && (
        <IconToolBar icons={icons} classes={{ root: classes.iconToolBar }} />
      )}
      <Box className={classes.container} style={props.containerStyles}>
        {props.children}
        {props.cards?.map((c, i) => (
          <Card
            key={i}
            classes={{ root: classes.card, footer: classes.cardFooter }}
            imgSrc={c.image}
            title={c.title}
            author={c.author}
            date={new Date(c.date + "Z").toLocaleString()}
            onClick={c.onClick}
            onMenuOptionClick={c.onMenuOptionClick}
            menuItems={c.menuItems}
            error={c.error}
            onLockClick={c.onLockClick}
            isLocked={c.isLocked}
            showLock={c.showLock}
          />
        ))}
      </Box>
    </SectionContainer>
  );
}

export default CustomSection;
