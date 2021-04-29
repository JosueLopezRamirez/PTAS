// NewLandModal.tsx
/**
 * Copyright (c) King County. All rights reserved.
 * @packageDocumentation
 */

import React, { useEffect, useRef } from 'react';
import { withStyles, WithStyles, createStyles, Theme } from '@material-ui/core';
import Modal from '@material-ui/core/Modal';
import CloseIcon from '@material-ui/icons/Close';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import {
  CustomButton,
  CustomIconButton,
  CustomNumericField,
} from '@ptas/react-ui-library';
import { GetModalDataType } from 'services/map.typings';
import useLoaderCursor from 'components/common/useLoaderCursor';
import BlockUi from 'react-block-ui';

/**
 * Component props
 */
interface Props extends WithStyles<typeof useStyles> {
  isOpen?: boolean;
  running: boolean;
  onButtonClick?: (data: GetModalDataType) => void;
  onClose?: () => void;
}

/**
 * Component styles
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const useStyles = (theme: Theme) =>
  createStyles({
    root: {
      borderRadius: 12,
      boxShadow: theme.shadows[5],
      width: 617,
      height: 414,
      backgroundColor: 'white',
      position: 'absolute',
      padding: theme.spacing(2.5, 5, 2.5, 5),
    },
    iconButton: {
      position: 'absolute',
      top: 13,
      right: 34,
      color: 'black',
    },
    closeIcon: {
      fontSize: 42,
    },
    label: {
      fontFamily: theme.ptas.typography.bodyFontFamily,
      fontSize: '1.375rem',
      marginBottom: 14,
      display: 'block',
    },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    column: {
      display: 'flex',
      flexDirection: 'column',
    },
    numeric: {
      marginBottom: 16,
    },
    columnTitle: {
      fontFamily: theme.ptas.typography.titleFontFamily,
      fontSize: '1.25rem',
      marginBottom: 24,
      fontWeight: 'bolder',
    },
    button: {
      display: 'flex',
      marginLeft: 'auto',
      marginTop: 60,
    },
  });

/**
 * NewLandModal
 *
 * @param props - Component props
 * @returns A JSX element
 */
function NewLandModal(props: Props): JSX.Element {
  const { classes } = props;
  const [open, setOpen] = React.useState(false);
  const loadingCursor = useLoaderCursor();

  const nonWaterFrom = useRef<HTMLInputElement>(null);
  const nonWaterTo = useRef<HTMLInputElement>(null);
  const nonWaterStep = useRef<HTMLInputElement>(null);

  const waterFrom = useRef<HTMLInputElement>(null);
  const waterTo = useRef<HTMLInputElement>(null);
  const waterStep = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (props.isOpen === undefined) return;
    setOpen(props.isOpen);
  }, [props.isOpen]);

  const handleClose = (): void => {
    if (props.running) return;
    setOpen(false);
    props.onClose && props.onClose();
  };

  useEffect(() => {
    loadingCursor(props.running);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.running]);

  const getModalData = (): GetModalDataType => {
    return {
      nonWaterFront: {
        from: nonWaterFrom.current?.value,
        to: nonWaterTo.current?.value,
        step: nonWaterStep.current?.value,
      },
      waterFront: {
        from: waterFrom.current?.value,
        to: waterTo.current?.value,
        step: waterStep.current?.value,
      },
    };
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      disableBackdropClick={props.running}
    >
      <Fade in={open}>
        <div className={classes.root} style={{ height: 'auto' }}>
          <label className={classes.label}>Create new land model</label>
          <BlockUi blocking={props.running}>
            <div className={classes.content}>
              <div className={classes.column}>
                <label className={classes.columnTitle}>
                  Non-Waterfront Schedule
                </label>
                <CustomNumericField
                  className={classes.numeric}
                  label="From"
                  decimalScale={2}
                  minValue={0}
                  inputRef={nonWaterFrom}
                  defaultValue={nonWaterFrom.current?.value}
                />
                <CustomNumericField
                  className={classes.numeric}
                  label="To"
                  decimalScale={2}
                  inputRef={nonWaterTo}
                  defaultValue={nonWaterTo.current?.value}
                />
                <CustomNumericField
                  className={classes.numeric}
                  label="Step"
                  inputRef={nonWaterStep}
                  defaultValue={nonWaterStep.current?.value}
                />
              </div>
              <div className={classes.column}>
                <label className={classes.columnTitle}>
                  Waterfront Schedule
                </label>
                <CustomNumericField
                  className={classes.numeric}
                  minValue={0}
                  label="From"
                  decimalScale={2}
                  inputRef={waterFrom}
                  defaultValue={waterFrom.current?.value}
                />
                <CustomNumericField
                  className={classes.numeric}
                  label="To"
                  decimalScale={2}
                  inputRef={waterTo}
                  defaultValue={waterTo.current?.value}
                />
                <CustomNumericField
                  className={classes.numeric}
                  label="Step"
                  inputRef={waterStep}
                  defaultValue={waterStep.current?.value}
                />
              </div>
            </div>
          </BlockUi>
          <CustomButton
            classes={{ root: classes.button }}
            onClick={(): void => {
              props.onButtonClick && props.onButtonClick(getModalData());
            }}
            fullyRounded
            disabled={props.running}
          >
            {props.running ? 'Creating Schedule...' : 'Create Schedule'}
          </CustomButton>
          <CustomIconButton
            icon={<CloseIcon className={classes.closeIcon} />}
            className={classes.iconButton}
            onClick={handleClose}
            disabled={props.running}
          />
        </div>
      </Fade>
    </Modal>
  );
}

export default withStyles(useStyles)(NewLandModal);
