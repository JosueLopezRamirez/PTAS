// CustomSimpleDropdown.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useState } from 'react';
import { Box, makeStyles } from '@material-ui/core';
import {
  SimpleDropDown,
  SimpleDropDownProps,
  CustomIconButton,
  DropDownItem,
} from '@ptas/react-ui-library';
import CloseOutlinedIcon from '@material-ui/icons/CloseOutlined';
import { omit } from 'lodash';
import clsx from 'clsx';

interface Props {
  id?: string;
  onButtonClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  //added second onClick to avoid breaking other components
  onButtonClickWithValue?: (
    id?: string,
    value?: React.ReactText,
    e?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  container?: string;
  onSelected: (item: DropDownItem, prevValue?: React.ReactText) => void;
}

export type CustomSimpleDropdownProps = Props & SimpleDropDownProps;

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'relative',
  },
  icon: {
    color: '#929292',
    fontSize: 32,
  },
  iconButton: {
    position: 'absolute',
    top: 3,
    right: -41,
  },
}));

/**
 * CustomSimpleDropdown
 *
 * @param props - Component props
 * @returns A JSX element
 */
function CustomSimpleDropdown(props: Props & SimpleDropDownProps): JSX.Element {
  const classes = useStyles();
  const newProps = omit(props, ['onButtonClick', 'onSelected']);
  const [currentValue, setCurrentValue] = useState<React.ReactText>();

  return (
    <Box className={clsx(classes.container, props.container)}>
      <SimpleDropDown
        {...newProps}
        onSelected={(s, p): void => {
          setCurrentValue(s.value);
          props.onSelected(s, p);
        }}
      />
      <CustomIconButton
        disableRipple={false}
        onClick={(e): void => {
          props.onButtonClick && props.onButtonClick(e);
          props.onButtonClickWithValue &&
            props.onButtonClickWithValue(props.id, currentValue, e);
        }}
        className={classes.iconButton}
        icon={<CloseOutlinedIcon className={classes.icon} />}
      ></CustomIconButton>
    </Box>
  );
}

export default CustomSimpleDropdown;
