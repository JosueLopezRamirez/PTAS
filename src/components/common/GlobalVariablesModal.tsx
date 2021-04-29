// GlobalVariablesModal.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useContext, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import {
  CustomButton,
  CustomModal,
  DropDownItem,
  SimpleDropDown,
} from '@ptas/react-ui-library';
import { AppContext } from 'context/AppContext';

interface Props {
  isOpen: boolean;
  onConfirm?: () => void;
  onClose: () => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: 454,
  },
  modal: {
    backgroundColor: 'rgba(255,255,255, 1)',
    width: 'unset',
    height: 'unset',
    padding: theme.spacing(2, 2, 3, 2),
  },
  title: {
    fontSize: '1.375rem',
    fontFamily: theme.ptas.typography.bodyFontFamily,
    marginBottom: 24,
    display: 'block',
  },
  dropdown: {
    width: '100%',
  },
  button: {
    display: 'flex',
    marginLeft: 'auto',
    marginTop: 40,
  },
  closeButton: {
    right: 15,
  },
}));

/**
 * GlobalVariablesModal
 *
 * @param props - Component props
 * @returns A JSX element
 */
function GlobalVariablesModal(props: Props): JSX.Element {
  const classes = useStyles();
  const context = useContext(AppContext);
  const [category, setCategory] = useState<string>();

  const getCategories = (): DropDownItem[] => {
    const categories: DropDownItem[] = [];
    context.globalVariablesCategories?.forEach((c) =>
      categories.push({ label: c, value: c })
    );
    return categories;
  };

  const handleConfirm = (): void => {
    props.onConfirm && props.onConfirm();
    if (!context.globalVariables) return;
    context.setGlobalVariablesToAdd &&
      context.setGlobalVariablesToAdd(
        context.globalVariables.filter((g) => g.category === category)
      );
  };

  return (
    <CustomModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      classes={{ root: classes.modal, iconButton: classes.closeButton }}
    >
      <div className={classes.root}>
        <label className={classes.title}>Add global variables</label>
        <SimpleDropDown
          label="Category"
          items={getCategories()}
          onSelected={(item): void => setCategory(item.label)}
          classes={{ root: classes.dropdown }}
        />
        <CustomButton
          classes={{ root: classes.button }}
          onClick={handleConfirm}
          fullyRounded
        >
          Add variables
        </CustomButton>
      </div>
    </CustomModal>
  );
}

export default GlobalVariablesModal;
